import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::quiz.quiz', ({ strapi }) => ({
  // 2.7.8 - 2.7.11: Student Quiz Submission & Server-Side Auto-Grading
  async submit(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in to submit a quiz.');
    }

    const { id } = ctx.params;
    const { answers } = ctx.request.body || {}; // Expecting format: { "0": 1, "1": 3 }

    if (!answers || typeof answers !== 'object') {
      return ctx.badRequest('Answers object is required.');
    }

    // Fetch quiz along with its questions
    const quiz = await strapi.db.query('api::quiz.quiz').findOne({
      where: { id },
      populate: { questions: true },
    });

    if (!quiz) {
      return ctx.notFound('Quiz not found.');
    }

    const questions: Array<{ id: number; question: string; options: string[]; correctAnswer: number }> =
      quiz.questions || [];

    let score = 0;

    questions.forEach((q, index) => {
      if (answers[index] !== undefined && Number(answers[index]) === Number(q.correctAnswer)) {
        score += 1;
      }
    });

    const total = questions.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const passed = percentage >= 50;

    // 2.7.11: Store quiz result in QuizAttempt
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
      message: 'Quiz submitted and auto-graded successfully',
      result: {
        score,
        total,
        percentage,
        passed,
        attemptId: attempt.id,
      },
    };
  },

  // 2.7.3 & 2.7.4: Secure sanitized questions for taking the quiz
  async take(ctx) {
    const { id } = ctx.params;

    const quiz = await strapi.db.query('api::quiz.quiz').findOne({
      where: { id },
      populate: { questions: true },
    });

    if (!quiz) {
      return ctx.notFound('Quiz not found.');
    }

    // Strip out correctAnswer from payload
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