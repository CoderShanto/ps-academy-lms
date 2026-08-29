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

      // 1. Resolve Lesson ID & Course ID
      let resolvedLessonId: number | null = null;
      let resolvedCourseId: number | null = null;

      if (typeof lessonId === 'string' && isNaN(Number(lessonId))) {
        const lesson = await strapi.db.query('api::lesson.lesson').findOne({
          where: { documentId: lessonId },
          populate: ['course'],
        });
        if (lesson) {
          resolvedLessonId = lesson.id;
          resolvedCourseId = lesson.course?.id || null;
        }
      } else {
        resolvedLessonId = Number(lessonId);
      }

      if (!resolvedCourseId && courseId) {
        if (typeof courseId === 'string' && isNaN(Number(courseId))) {
          const course = await strapi.db.query('api::course.course').findOne({
            where: { documentId: courseId },
          });
          if (course) resolvedCourseId = course.id;
        } else {
          resolvedCourseId = Number(courseId);
        }
      }

      if (!resolvedLessonId) {
        return ctx.badRequest('Lesson not found.');
      }

      // 2. Find or create progress record
      const existing = await strapi.db.query('api::progress.progress').findOne({
        where: {
          student: user.id,
          lesson: resolvedLessonId,
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
        const createPayload: Record<string, any> = {
          student: user.id,
          lesson: resolvedLessonId,
          completed: true,
          completedAt: new Date(),
        };
        if (resolvedCourseId) {
          createPayload.course = resolvedCourseId;
        }

        record = await strapi.db.query('api::progress.progress').create({
          data: createPayload,
        });
      }

      // 3. Calculate percentage
      let totalLessons = 1;
      let completedLessons = 1;

      if (resolvedCourseId) {
        totalLessons = await strapi.db.query('api::lesson.lesson').count({
          where: { course: resolvedCourseId },
        });

        completedLessons = await strapi.db.query('api::progress.progress').count({
          where: {
            student: user.id,
            course: resolvedCourseId,
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
          lessonId: resolvedLessonId,
        },
      };
    } catch (err: any) {
      console.error('CRITICAL markComplete error:', err);
      return ctx.internalServerError(err.message || 'Internal error');
    }
  },

  async getCourseProgress(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized('You must be logged in.');

      const { courseId } = ctx.params;
      let resolvedCourseId: number | null = null;

      if (typeof courseId === 'string' && isNaN(Number(courseId))) {
        const course = await strapi.db.query('api::course.course').findOne({
          where: { documentId: courseId },
        });
        if (course) resolvedCourseId = course.id;
      } else {
        resolvedCourseId = Number(courseId);
      }

      if (!resolvedCourseId) {
        return {
          courseId,
          completedLessonIds: [],
          completedCount: 0,
          totalLessons: 0,
          percentage: 0,
        };
      }

      const totalLessons = await strapi.db.query('api::lesson.lesson').count({
        where: { course: resolvedCourseId },
      });

      const records = await strapi.db.query('api::progress.progress').findMany({
        where: {
          student: user.id,
          course: resolvedCourseId,
          completed: true,
        },
        populate: ['lesson'],
      });

      const completedLessonIds = records
        .map((r: any) => r.lesson?.id || r.lesson?.documentId)
        .filter(Boolean);

      const completedCount = completedLessonIds.length;
      const percentage = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;

      return {
        courseId: resolvedCourseId,
        completedLessonIds,
        completedCount,
        totalLessons,
        percentage,
      };
    } catch (err: any) {
      console.error('CRITICAL getCourseProgress error:', err);
      return ctx.internalServerError(err.message || 'Internal error');
    }
  },
}));