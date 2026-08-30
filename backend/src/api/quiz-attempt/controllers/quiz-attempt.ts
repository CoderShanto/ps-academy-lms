import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::quiz-attempt.quiz-attempt', ({ strapi }) => ({
  // 1. Submit attempt, calculate score, and save result
  async submitAttempt(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const { quizId, answers } = ctx.request.body || {};
    if (!quizId) return ctx.badRequest('quizId is required.');

    try {
      const isDocId = typeof quizId === 'string' && isNaN(Number(quizId));
      const quiz: any = await (strapi as any).documents('api::quiz.quiz').findOne({
        documentId: isDocId ? quizId : undefined,
        where: !isDocId ? { id: Number(quizId) } : undefined,
        populate: ['questions', 'lesson'],
      });

      if (!quiz) return ctx.notFound('Quiz not found.');

      const questions = quiz.questions || [];
      const totalQuestions = questions.length;
      let correctCount = 0;

      // Grade answers
      questions.forEach((q: any) => {
        const submitted = answers?.[q.id] || answers?.[q.documentId];
        if (submitted && String(submitted).trim().toUpperCase() === String(q.correctAnswer).trim().toUpperCase()) {
          correctCount += 1;
        }
      });

      const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
      const passed = score >= (quiz.passingScore || 60);

      // Save to database
      const attempt = await (strapi as any).documents('api::quiz-attempt.quiz-attempt').create({
        data: {
          student: user.id,
          quiz: quiz.id,
          score,
          passed,
          answers: answers || {},
          publishedAt: new Date().toISOString(),
        },
        populate: ['quiz'],
      });

      return {
        data: {
          id: attempt.documentId || attempt.id,
          score,
          passed,
          passingScore: quiz.passingScore || 60,
          totalQuestions,
          correctCount,
        },
      };
    } catch (err: any) {
      console.error('submitAttempt error:', err);
      return ctx.internalServerError('Failed to submit quiz attempt.');
    }
  },

  // 2. Fetch logged-in student's past attempts
  async myAttempts(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    try {
      const attempts = await strapi.db.query('api::quiz-attempt.quiz-attempt').findMany({
        where: { student: user.id },
        populate: ['quiz', 'quiz.lesson', 'quiz.lesson.course'],
        orderBy: { createdAt: 'desc' },
      });

      const formatted = attempts.map((att: any) => ({
        id: att.id,
        documentId: att.documentId,
        score: att.score,
        passed: att.passed,
        submittedAt: att.createdAt,
        quizTitle: att.quiz?.title || 'Lesson Quiz',
        lessonTitle: att.quiz?.lesson?.title || 'Lesson Assessment',
        courseTitle: att.quiz?.lesson?.course?.title || 'Enrolled Course',
      }));

      return { data: formatted };
    } catch (err: any) {
      console.error('myAttempts error:', err);
      return ctx.internalServerError('Failed to fetch past quiz attempts.');
    }
  },
}));