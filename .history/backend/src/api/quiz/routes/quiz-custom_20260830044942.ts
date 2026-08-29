export default {
  routes: [
    {
      method: 'POST',
      path: '/quizzes/:id/submit',
      handler: 'api::quiz.quiz.submitQuiz',
      config: {
        auth: {},
      },
    },
    {
      method: 'GET',
      path: '/quizzes/:id/my-attempt',
      handler: 'api::quiz.quiz.getMyAttempt',
      config: {
        auth: {},
      },
    },
  ],
};