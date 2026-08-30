import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::quiz.quiz', ({ strapi }) => ({
  async submitQuiz(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in to submit a quiz.');
    }

    const { id } = ctx.params;
    const { answers } = ctx.request.body || {};

    const isDocId = typeof id === 'string' && isNaN(Number(id));
    const quiz = await strapi.db.query('api::quiz.quiz').findOne({
      where: isDocId ? { documentId: id } : { id: Number(id) },
      populate: ['questions'],
    });

    if (!quiz) {
      return ctx.notFound('Quiz not found.');
    }

    const questions = quiz.questions || [];
    let correctCount = 0;
    const totalQuestions = questions.length;

    questions.forEach((q: any) => {
      const qKey = q.id || q.documentId;
      const userAnswer = answers ? answers[qKey] : null;

      // Extract expected correct answer (e.g. 'A' or the actual text)
      const expectedKey = String(q.correctAnswer || '').trim().toUpperCase();
      const userSelected = String(userAnswer || '').trim().toUpperCase();

      if (userAnswer && (userSelected === expectedKey || userSelected === String(q[`option${expectedKey}`] || '').trim().toUpperCase())) {
        correctCount += 1;
      }
    });

    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = scorePercentage >= (quiz.passingScore || 60);

    let attemptRecord = null;
    try {
      attemptRecord = await strapi.db.query('api::quiz-attempt.quiz-attempt').create({
        data: {
          score: scorePercentage,
          passed,
          student: user.id,
          quiz: quiz.id,
          answers: answers || {},
          completedAt: new Date(),
        },
      });
    } catch (e: any) {
      console.warn('Attempt create note:', e.message);
    }

    return {
      score: scorePercentage,
      correctCount,
      totalQuestions,
      passed,
      attempt: attemptRecord,
    };
  },

  async getMyAttempt(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in.');
    }

    const { id } = ctx.params;
    const isDocId = typeof id === 'string' && isNaN(Number(id));
    const quiz = await strapi.db.query('api::quiz.quiz').findOne({
      where: isDocId ? { documentId: id } : { id: Number(id) },
    });

    if (!quiz) {
      return ctx.notFound('Quiz not found.');
    }

    const attempt = await strapi.db.query('api::quiz-attempt.quiz-attempt').findOne({
      where: {
        student: user.id,
        quiz: quiz.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { attempt: attempt || null };
  },
}));