import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::course.course', ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    const roleName = (user?.role?.name || user?.role?.type || '').toLowerCase();

    // If logged in as Instructor, filter courses to only their own
    if (user && roleName.includes('instructor')) {
      const courses = await strapi.db.query('api::course.course').findMany({
        where: {
          $or: [
            { instructor: user.id },
            { user: user.id },
            { author: user.id },
          ],
        },
        populate: ['lessons'],
      });
      return { data: courses };
    }

    // Admins, Managers, and Public get full catalog
    return super.find(ctx);
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const { data } = ctx.request.body || {};

    try {
      const course = await strapi.db.query('api::course.course').create({
        data: {
          ...data,
          instructor: user.id, // Tag current instructor as owner
          publishedAt: data.publishedAt || new Date().toISOString(),
        },
        populate: ['lessons'],
      });
      return { data: course };
    } catch (err: any) {
      console.error('Course create error:', err);
      return ctx.badRequest(err.message || 'Failed to create course');
    }
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const { id } = ctx.params;
    const roleName = (user.role?.name || user.role?.type || '').toLowerCase();
    const isDocId = typeof id === 'string' && isNaN(Number(id));

    // If instructor, check course ownership first
    if (roleName.includes('instructor')) {
      const existing = await strapi.db.query('api::course.course').findOne({
        where: isDocId ? { documentId: id } : { id: Number(id) },
        populate: ['instructor', 'user', 'author'],
      });

      if (!existing) return ctx.notFound('Course not found');

      const ownerId = existing.instructor?.id || existing.user?.id || existing.author?.id;
      if (ownerId && ownerId !== user.id) {
        return ctx.forbidden('You can only edit courses you own.');
      }
    }

    return super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const { id } = ctx.params;
    const roleName = (user.role?.name || user.role?.type || '').toLowerCase();
    const isDocId = typeof id === 'string' && isNaN(Number(id));

    if (roleName.includes('instructor')) {
      const existing = await strapi.db.query('api::course.course').findOne({
        where: isDocId ? { documentId: id } : { id: Number(id) },
        populate: ['instructor', 'user', 'author'],
      });

      if (!existing) return ctx.notFound('Course not found');

      const ownerId = existing.instructor?.id || existing.user?.id || existing.author?.id;
      if (ownerId && ownerId !== user.id) {
        return ctx.forbidden('You can only delete courses you own.');
      }
    }

    return super.delete(ctx);
  },
}));