import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::quiz-attempt.quiz-attempt', ({ strapi }) => ({
  // 1. Submit and store quiz attempt result
  async submitAttempt(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in to submit a quiz.');

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

      // Auto-grade submission
      questions.forEach((q: any) => {
        const submitted = answers?.[q.id] || answers?.[q.documentId];
        if (submitted && String(submitted).trim().toUpperCase() === String(q.correctAnswer).trim().toUpperCase()) {
          correctCount += 1;
        }
      });

      const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
      const passed = score >= (quiz.passingScore || 60);

      // Store quiz attempt record
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
      return ctx.internalServerError('Failed to process and store quiz attempt.');
    }
  },

  // 2. Fetch all previous quiz attempts for the logged-in student
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
        quizTitle: att.quiz?.title || 'Quiz',
        lessonTitle: att.quiz?.lesson?.title || 'General Lesson',
        courseTitle: att.quiz?.lesson?.course?.title || 'Course Assessment',
      }));

      return { data: formatted };
    } catch (err: any) {
      console.error('myAttempts error:', err);
      return ctx.internalServerError('Failed to fetch past quiz attempts.');
    }
  },
}));