export default {
  routes: [
    {
      method: 'POST',
      path: '/quiz-attempts/submit',
      handler: 'api::quiz-attempt.quiz-attempt.submitAttempt',
      config: {
        auth: {},
      },
    },
    {
      method: 'GET',
      path: '/quiz-attempts/my-attempts',
      handler: 'api::quiz-attempt.quiz-attempt.myAttempts',
      config: {
        auth: {},
      },
    },
  ],
};