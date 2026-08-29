import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::progress.progress',
  ({ strapi }) => ({
    // 2.6.2 & 2.6.3: Mark lesson complete with authorization check
    async markComplete(ctx) {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('You must be logged in.');
      }

      const { lessonId, courseId } = ctx.request.body || {};
      if (!lessonId || !courseId) {
        return ctx.badRequest('lessonId and courseId are required.');
      }

      // Verify student is enrolled in the course
      const enrollment = await strapi.db
        .query('api::enrollment.enrollment')
        .findOne({
          where: {
            student: user.id,
            course: courseId,
          },
        });

      if (!enrollment && user.role?.name !== 'Admin') {
        return ctx.forbidden('You are not enrolled in this course.');
      }

      // Upsert progress record
      const existing = await strapi.db
        .query('api::progress.progress')
        .findOne({
          where: {
            student: user.id,
            lesson: lessonId,
            course: courseId,
          },
        });

      let progressRecord;
      if (existing) {
        progressRecord = await strapi.db
          .query('api::progress.progress')
          .update({
            where: { id: existing.id },
            data: { completed: true, completedAt: new Date() },
          });
      } else {
        progressRecord = await strapi.db
          .query('api::progress.progress')
          .create({
            data: {
              student: user.id,
              lesson: lessonId,
              course: courseId,
              completed: true,
              completedAt: new Date(),
            },
          });
      }

      // 2.6.4 & 2.6.5: Calculate completed lessons and percentage
      const totalLessons = await strapi.db
        .query('api::lesson.lesson')
        .count({
          where: { course: courseId },
        });

      const completedLessons = await strapi.db
        .query('api::progress.progress')
        .count({
          where: {
            student: user.id,
            course: courseId,
            completed: true,
          },
        });

      const percentage =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

      return {
        message: 'Lesson marked as complete',
        data: progressRecord,
        meta: {
          completedLessons,
          totalLessons,
          percentage,
        },
      };
    },

    // 2.6.6 & 2.6.7: Get Progress for a student / instructor
    async getProgress(ctx) {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('You must be logged in.');
      }

      const { courseId } = ctx.params;
      const targetStudentId = ctx.query.studentId || user.id;

      // Ownership check: Student can only view own progress
      if (user.role?.name === 'Student' && targetStudentId !== user.id) {
        return ctx.forbidden('You can only view your own progress.');
      }

      const totalLessons = await strapi.db
        .query('api::lesson.lesson')
        .count({
          where: { course: courseId },
        });

      const records = await strapi.db
        .query('api::progress.progress')
        .findMany({
          where: {
            student: targetStudentId,
            course: courseId,
            completed: true,
          },
          populate: { lesson: true },
        });

      const completedLessonIds = records
        .map((r: any) => r.lesson?.id)
        .filter(Boolean);
      const completedCount = completedLessonIds.length;
      const percentage =
        totalLessons > 0
          ? Math.round((completedCount / totalLessons) * 100)
          : 0;

      return {
        courseId: Number(courseId),
        completedLessonIds,
        completedCount,
        totalLessons,
        percentage,
      };
    },
  })
);