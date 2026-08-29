export default {
  routes: [
    {
      method: 'GET',
      path: '/my-courses',
      handler: 'enrollment.myCourses',
      config: {
        auth: {},
      },
    },
  ],
};