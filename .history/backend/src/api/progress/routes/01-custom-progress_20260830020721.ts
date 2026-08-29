export default {
  routes: [
    {
      method: 'POST',
      path: '/progress/mark-complete',
      handler: 'progress.markComplete',
      config: {
        auth: {},
      },
    },
    {
      method: 'GET',
      path: '/progress/course/:courseId',
      handler: 'progress.getCourseProgress',
      config: {
        auth: {},
      },
    },
  ],
};