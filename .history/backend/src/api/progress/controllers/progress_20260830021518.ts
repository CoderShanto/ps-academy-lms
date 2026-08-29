import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::progress.progress', ({ strapi }) => ({
  async markComplete(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('You must be logged in.');
      }

      const { lessonId, courseId } = ctx.request.body || {};
      if (!lessonId) {
        return ctx.badRequest('lessonId is required.');
      }

      // 1. Resolve lesson internal ID
      let lessonRecord: any = null;
      if (typeof lessonId === 'string' && isNaN(Number(lessonId))) {
        lessonRecord = await strapi.db.query('api::lesson.lesson').findOne({
          where: { documentId: lessonId },
          populate: ['course'],
        });
      } else {
        lessonRecord = await strapi.db.query('api::lesson.lesson').findOne({
          where: { id: Number(lessonId) },
          populate: ['course'],
        });
      }

      const numericLessonId = lessonRecord?.id || Number(lessonId);

      // 2. Resolve course internal ID
      let numericCourseId: number | null = null;
      if (courseId) {
        if (typeof courseId === 'string' && isNaN(Number(courseId))) {
          const courseRecord = await strapi.db.query('api::course.course').findOne({
            where: { documentId: courseId },
          });
          numericCourseId = courseRecord?.id || null;
        } else {
          numericCourseId = Number(courseId);
        }
      }
      if (!numericCourseId && lessonRecord?.course?.id) {
        numericCourseId = lessonRecord.course.id;
      }

      // 3. Find existing progress record
      const existing = await strapi.db.query('api::progress.progress').findOne({
        where: {
          student: user.id,
          lesson: numericLessonId,
        },
      });

      let record;
      if (existing) {
        record = await strapi.db.query('api::progress.progress').update({
          where: { id: existing.id },
          data: {
            completed: true,
            completedAt: new Date(),
          },
        });
      } else {
        const payload: any = {
          student: user.id,
          lesson: numericLessonId,
          completed: true,
          completedAt: new Date(),
        };
        if (numericCourseId) {
          payload.course = numericCourseId;
        }

        record = await strapi.db.query('api::progress.progress').create({
          data: payload,
        });
      }

      // 4. Calculate percentage
      let totalLessons = 1;
      let completedLessons = 1;

      if (numericCourseId) {
        totalLessons = await strapi.db.query('api::lesson.lesson').count({
          where: { course: numericCourseId },
        });

        completedLessons = await strapi.db.query('api::progress.progress').count({
          where: {
            student: user.id,
            course: numericCourseId,
            completed: true,
          },
        });
      }

      const percentage = totalLessons > 0 ? Math.min(100, Math.round((completedLessons / totalLessons) * 100)) : 100;

      return {
        message: 'Lesson marked complete',
        data: record,
        meta: {
          completedLessons,
          totalLessons,
          percentage,
          lessonId: numericLessonId,
        },
      };
    } catch (err: any) {
      console.error('CRITICAL markComplete error:', err);
      return ctx.badRequest(err.message || 'Error marking progress');
    }
  },

  async getCourseProgress(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized('You must be logged in.');

      const { courseId } = ctx.params;
      let numericCourseId: number | null = null;

      if (typeof courseId === 'string' && isNaN(Number(courseId))) {
        const courseRecord = await strapi.db.query('api::course.course').findOne({
          where: { documentId: courseId },
        });
        numericCourseId = courseRecord?.id || null;
      } else {
        numericCourseId = Number(courseId);
      }

      if (!numericCourseId) {
        return {
          courseId,
          completedLessonIds: [],
          completedCount: 0,
          totalLessons: 0,
          percentage: 0,
        };
      }

      const totalLessons = await strapi.db.query('api::lesson.lesson').count({
        where: { course: numericCourseId },
      });

      const records = await strapi.db.query('api::progress.progress').findMany({
        where: {
          student: user.id,
          course: numericCourseId,
          completed: true,
        },
        populate: ['lesson'],
      });

      const completedLessonIds = (records || [])
        .map((r: any) => r.lesson?.id || r.lesson?.documentId)
        .filter(Boolean);

      const completedCount = completedLessonIds.length;
      const percentage = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;

      return {
        courseId: numericCourseId,
        completedLessonIds,
        completedCount,
        totalLessons,
        percentage,
      };
    } catch (err: any) {
      console.error('CRITICAL getCourseProgress error:', err);
      return {
        courseId: ctx.params?.courseId,
        completedLessonIds: [],
        completedCount: 0,
        totalLessons: 0,
        percentage: 0,
      };
    }
  },
}));