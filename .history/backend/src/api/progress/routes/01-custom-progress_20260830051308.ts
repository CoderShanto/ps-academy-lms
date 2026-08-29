export default {
  routes: [
    {
      method: 'GET',
      path: '/progress/course/:courseId',
      handler: 'api::progress.progress.getCourseProgress',
      config: {
        auth: {},
      },
    },
    {
      method: 'POST',
      path: '/progress/toggle',
      handler: 'api::progress.progress.toggleLessonComplete',
      config: {
        auth: {},
      },
    },
    {
      method: 'POST',
      path: '/progress/mark-complete',
      handler: 'api::progress.progress.markComplete',
      config: {
        auth: {},
      },
    },
  ],
};