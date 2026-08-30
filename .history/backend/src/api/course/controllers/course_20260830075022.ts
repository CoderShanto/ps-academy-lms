import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::course.course', ({ strapi }) => ({
  // 1. Fetch Courses with strict role-based filtering & deduplication
  async find(ctx) {
    const user = ctx.state.user;
    const roleName = (user?.role?.name || user?.role?.type || '').toLowerCase();
    const isInstructor = Boolean(user && roleName.includes('instructor'));

    try {
      const courses: any[] = await (strapi as any).documents('api::course.course').findMany({
        populate: ['lessons', 'instructor'],
      });

      // Strict Instructor Filter: Only return courses created by this instructor
      if (isInstructor) {
        const owned = courses.filter((c: any) => {
          const ownerId = c.instructor?.id;
          return ownerId === user.id;
        });
        return { data: owned };
      }

      // Admin, Content Manager, and Public get all courses
      return { data: courses };
    } catch (err: any) {
      console.error('Course find error:', err);
      return super.find(ctx);
    }
  },

  // 2. Create Course and tag the logged-in Instructor as owner
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const { data } = ctx.request.body || {};

    try {
      const course = await (strapi as any).documents('api::course.course').create({
        data: {
          ...data,
          instructor: user.id,
        },
        populate: ['lessons'],
      });
      return { data: course };
    } catch (err: any) {
      console.error('Course create error:', err);
      return ctx.badRequest(err.message || 'Failed to create course');
    }
  },

  // 3. Update Course (Strict ownership check for Instructors)
  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const { id } = ctx.params;
    const roleName = (user.role?.name || user.role?.type || '').toLowerCase();
    const isInstructor = roleName.includes('instructor');

    try {
      if (isInstructor) {
        const course: any = await (strapi as any).documents('api::course.course').findOne({
          documentId: id,
          populate: ['instructor'],
        });

        if (!course) return ctx.notFound('Course not found');

        const ownerId = course.instructor?.id;
        if (ownerId && ownerId !== user.id) {
          return ctx.forbidden('You are only allowed to edit your own courses.');
        }
      }

      const { data } = ctx.request.body || {};
      const updated = await (strapi as any).documents('api::course.course').update({
        documentId: id,
        data,
        populate: ['lessons'],
      });
      return { data: updated };
    } catch (err: any) {
      console.error('Course update error:', err);
      return ctx.badRequest(err.message || 'Failed to update course');
    }
  },

  // 4. Delete Course (Strict ownership check for Instructors)
  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const { id } = ctx.params;
    const roleName = (user.role?.name || user.role?.type || '').toLowerCase();
    const isInstructor = roleName.includes('instructor');

    try {
      if (isInstructor) {
        const course: any = await (strapi as any).documents('api::course.course').findOne({
          documentId: id,
          populate: ['instructor'],
        });

        if (!course) return ctx.notFound('Course not found');

        const ownerId = course.instructor?.id;
        if (ownerId && ownerId !== user.id) {
          return ctx.forbidden('You are only allowed to delete your own courses.');
        }
      }

      await (strapi as any).documents('api::course.course').delete({
        documentId: id,
      });
      return { ok: true };
    } catch (err: any) {
      console.error('Course delete error:', err);
      return ctx.badRequest(err.message || 'Failed to delete course');
    }
  },
}));