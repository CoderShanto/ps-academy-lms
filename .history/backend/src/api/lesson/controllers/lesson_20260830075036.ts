import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const { id } = ctx.params;
    const roleName = (user.role?.name || user.role?.type || '').toLowerCase();
    const isInstructor = roleName.includes('instructor');

    try {
      if (isInstructor) {
        const lesson: any = await (strapi as any).documents('api::lesson.lesson').findOne({
          documentId: id,
          populate: ['course', 'course.instructor'],
        });

        if (!lesson) return ctx.notFound('Lesson not found');

        const courseOwnerId = lesson.course?.instructor?.id;
        if (courseOwnerId && courseOwnerId !== user.id) {
          return ctx.forbidden('You can only edit lessons from your own courses.');
        }
      }

      const { data } = ctx.request.body || {};
      const updated = await (strapi as any).documents('api::lesson.lesson').update({
        documentId: id,
        data,
      });
      return { data: updated };
    } catch (err: any) {
      console.error('Lesson update error:', err);
      return ctx.badRequest(err.message || 'Failed to update lesson');
    }
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const { id } = ctx.params;
    const roleName = (user.role?.name || user.role?.type || '').toLowerCase();
    const isInstructor = roleName.includes('instructor');

    try {
      if (isInstructor) {
        const lesson: any = await (strapi as any).documents('api::lesson.lesson').findOne({
          documentId: id,
          populate: ['course', 'course.instructor'],
        });

        if (!lesson) return ctx.notFound('Lesson not found');

        const courseOwnerId = lesson.course?.instructor?.id;
        if (courseOwnerId && courseOwnerId !== user.id) {
          return ctx.forbidden('You can only delete lessons from your own courses.');
        }
      }

      await (strapi as any).documents('api::lesson.lesson').delete({
        documentId: id,
      });
      return { ok: true };
    } catch (err: any) {
      console.error('Lesson delete error:', err);
      return ctx.badRequest(err.message || 'Failed to delete lesson');
    }
  },
}));