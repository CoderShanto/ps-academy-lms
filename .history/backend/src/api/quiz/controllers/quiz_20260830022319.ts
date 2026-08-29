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

    let quiz: any = null;
    if (isNaN(Number(id))) {
      quiz = await strapi.db.query('api::quiz.quiz').findOne({
        where: { documentId: id },
        populate: ['questions'],
      });
    } else {
      quiz = await strapi.db.query('api::quiz.quiz').findOne({
        where: { id: Number(id) },
        populate: ['questions'],
      });
    }

    if (!quiz) return ctx.notFound('Quiz not found.');

    const questions: any[] = quiz.questions || [];
    let score = 0;

    questions.forEach((q, index) => {
      if (answers[index] !== undefined && Number(answers[index]) === Number(q.correctAnswer)) {
        score += 1;
      }
    });

    const total = questions.length || 1;
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= 50;

    const attempt = await strapi.db.query('api::quiz-attempt.quiz-attempt').create({
      data: {
        student: user.id,
        quiz: quiz.id,
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

    let quiz: any = null;
    if (isNaN(Number(id))) {
      quiz = await strapi.db.query('api::quiz.quiz').findOne({
        where: { documentId: id },
        populate: ['questions'],
      });
    } else {
      quiz = await strapi.db.query('api::quiz.quiz').findOne({
        where: { id: Number(id) },
        populate: ['questions'],
      });
    }

    if (!quiz) return ctx.notFound('Quiz not found.');

    const sanitizedQuestions = (quiz.questions || []).map((q: any, idx: number) => ({
      id: q.id || idx,
      question: q.question,
      options: q.options,
    }));

    return {
      data: {
        id: quiz.id,
        documentId: quiz.documentId,
        title: quiz.title,
        questions: sanitizedQuestions,
      },
    };
  },
}));