export default {
  routes: [
    {
      method: 'POST',
      path: '/progress/mark-complete',
      handler: 'api::progress.progress.markComplete',
      config: {
        auth: {},
      },
    },
    {
      method: 'GET',
      path: '/progress/course/:courseId',
      handler: 'api::progress.progress.getCourseProgress',
      config: {
        auth: {},
      },
    },
  ],
};