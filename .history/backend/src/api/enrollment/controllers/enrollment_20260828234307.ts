// import { factories } from '@strapi/strapi';

// export default factories.createCoreController(
//   'api::enrollment.enrollment',
//   ({ strapi }) => ({
//     async create(ctx) {
//       const { data } = ctx.request.body;

//       const studentId = data?.student;
//       const courseId = data?.course;

//       if (!studentId || !courseId) {
//         return ctx.badRequest('Student and course are required.');
//       }

//       const existingEnrollment = await strapi.db
//         .query('api::enrollment.enrollment')
//         .findOne({
//           where: {
//             student: studentId,
//             course: courseId,
//           },
//         });

//       if (existingEnrollment) {
//         return ctx.badRequest(
//           'This student is already enrolled in this course.'
//         );
//       }

//       return await super.create(ctx);
//     },
// async myCourses(ctx) {
//   const user = ctx.state.user;

//   if (!user) {
//     return ctx.unauthorized('You must be logged in.');
//   }

//   const enrollments = await strapi.db
//     .query('api::enrollment.enrollment')
//     .findMany({
//       where: {
//         student: user.id,
//       },
//       populate: {
//         course: true,
//       },
//     });

//   const courses = enrollments
//     .map((enrollment) => enrollment.course)
//     .filter(Boolean);

//   return { data: courses };
// },



//   })
// );

import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::enrollment.enrollment',
  ({ strapi }) => ({
    async create(ctx) {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('You must be logged in.');
      }

      const { data } = ctx.request.body || {};
      const courseId = data?.course;

      if (!courseId) {
        return ctx.badRequest('Course is required.');
      }

      // Security Fix (2.5.5): Enforce current user ID unless Admin
      const studentId = user.role?.name === 'Admin' ? (data?.student || user.id) : user.id;

      const existingEnrollment = await strapi.db
        .query('api::enrollment.enrollment')
        .findOne({
          where: {
            student: studentId,
            course: courseId,
          },
        });

      if (existingEnrollment) {
        return ctx.badRequest(
          'This student is already enrolled in this course.'
        );
      }

      // Auto-assign the safe studentId to the payload
      if (ctx.request.body?.data) {
        ctx.request.body.data.student = studentId;
      }

      return await super.create(ctx);
    },

    async myCourses(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('You must be logged in.');
      }

      const enrollments = await strapi.db
        .query('api::enrollment.enrollment')
        .findMany({
          where: {
            student: user.id,
          },
          populate: {
            course: {
              populate: ['lessons', 'instructor'],
            },
          },
        });

      const courses = enrollments
        .map((enrollment: any) => enrollment.course)
        .filter(Boolean);

      return { data: courses };
    },
  })
);