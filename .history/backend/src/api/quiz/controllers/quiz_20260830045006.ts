import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::quiz.quiz', ({ strapi }) => ({
  async submitQuiz(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in to submit a quiz.');

    const { id } = ctx.params;
    const { answers } = ctx.request.body || {}; // e.g. { questionId: selectedOptionIndexOrText }

    // Fetch Quiz with Questions
    const quiz = await strapi.db.query('api::quiz.quiz').findOne({
      where: typeof id === 'string' && isNaN(Number(id)) ? { documentId: id } : { id: Number(id) },
      populate: ['questions'],
    });

    if (!quiz) {
      return ctx.notFound('Quiz not found.');
    }

    const questions = quiz.questions || [];
    let correctCount = 0;
    const totalQuestions = questions.length;

    // Calculate score
    questions.forEach((q: any) => {
      const userAnswer = answers ? answers[q.id || q.documentId] : null;
      if (userAnswer !== undefined && String(userAnswer).trim().toLowerCase() === String(q.correctAnswer || q.correctOption).trim().toLowerCase()) {
        correctCount += 1;
      }
    });

    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // Save or update QuizAttempt
    const attemptRecord = await strapi.db.query('api::quiz-attempt.quiz-attempt').create({
      data: {
        score: scorePercentage,
        passed: scorePercentage >= 60,
        student: user.id,
        quiz: quiz.id,
        answers: answers || {},
        completedAt: new Date(),
      },
    });

    return {
      score: scorePercentage,
      correctCount,
      totalQuestions,
      passed: scorePercentage >= 60,
      attempt: attemptRecord,
    };
  },

  async getMyAttempt(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const { id } = ctx.params;
    const quiz = await strapi.db.query('api::quiz.quiz').findOne({
      where: typeof id === 'string' && isNaN(Number(id)) ? { documentId: id } : { id: Number(id) },
    });

    if (!quiz) return ctx.notFound('Quiz not found.');

    const attempt = await strapi.db.query('api::quiz-attempt.quiz-attempt').findOne({
      where: {
        student: user.id,
        quiz: quiz.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { attempt };
  },
}));