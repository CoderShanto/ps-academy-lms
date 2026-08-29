import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::quiz.quiz', ({ strapi }) => ({
  async submit(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const { id } = ctx.params;
    const { answers } = ctx.request.body || {};

    if (!answers || typeof answers !== 'object') {
      return ctx.badRequest('Answers object is required.');
    }

    const quiz = await strapi.db.query('api::quiz.quiz').findOne({
      where: { id },
      populate: { questions: true },
    });

    if (!quiz) return ctx.notFound('Quiz not found.');

    const questions: any[] = quiz.questions || [];
    let score = 0;

    questions.forEach((q, index) => {
      if (answers[index] !== undefined && Number(answers[index]) === Number(q.correctAnswer)) {
        score += 1;
      }
    });

    const total = questions.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const passed = percentage >= 50;

    const attempt = await strapi.db.query('api::quiz-attempt.quiz-attempt').create({
      data: {
        student: user.id,
        quiz: id,
        score,
        total,
        answers,
        passed,
      },
    });

    return {
      message: 'Quiz graded successfully',
      result: {
        score,
        total,
        percentage,
        passed,
        attemptId: attempt.id,
      },
    };
  },

  async take(ctx) {
    const { id } = ctx.params;

    const quiz = await strapi.db.query('api::quiz.quiz').findOne({
      where: { id },
      populate: { questions: true },
    });

    if (!quiz) return ctx.notFound('Quiz not found.');

    const sanitizedQuestions = (quiz.questions || []).map((q: any, idx: number) => ({
      id: q.id || idx,
      question: q.question,
      options: q.options,
    }));

    return {
      data: {
        id: quiz.id,
        title: quiz.title,
        questions: sanitizedQuestions,
      },
    };
  },
}));