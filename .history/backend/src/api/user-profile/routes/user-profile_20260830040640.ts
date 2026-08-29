export default {
  routes: [
    {
      method: 'GET',
      path: '/auth/current-user',
      handler: 'api::user-profile.user-profile.getCurrentUser',
      config: {
        auth: {},
      },
    },
  ],
};