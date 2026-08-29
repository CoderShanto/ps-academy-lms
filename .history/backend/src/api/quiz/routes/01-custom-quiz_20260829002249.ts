export default {
  routes: [
    {
      method: 'POST',
      path: '/quizzes/:id/submit',
      handler: 'quiz.submit',
      config: {
        auth: {},
      },
    },
    {
      method: 'GET',
      path: '/quizzes/:id/take',
      handler: 'quiz.take',
      config: {
        auth: {},
      },
    },
  ],
};