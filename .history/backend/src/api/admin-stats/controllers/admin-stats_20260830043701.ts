export default {
  async getOverview(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const currentUser = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      populate: ['role'],
    });

    if (currentUser?.role?.name !== 'Admin') {
      return ctx.forbidden('Only Administrators can access this endpoint.');
    }

    try {
      const totalUsers = await strapi.db.query('plugin::users-permissions.user').count();
      const totalCourses = await strapi.db.query('api::course.course').count();
      const totalEnrollments = await strapi.db.query('api::enrollment.enrollment').count();
      const totalArticles = await strapi.db.query('api::blog-post.blog-post').count();

      const users = await strapi.db.query('plugin::users-permissions.user').findMany({
        populate: ['role'],
        select: ['id', 'documentId', 'username', 'email', 'createdAt'],
        orderBy: { createdAt: 'desc' },
      });

      const roles = await strapi.db.query('plugin::users-permissions.role').findMany({
        select: ['id', 'name', 'type'],
      });

      return {
        metrics: {
          totalUsers,
          totalCourses,
          totalEnrollments,
          totalArticles,
        },
        users,
        roles,
      };
    } catch (err: any) {
      console.error('Admin overview error:', err);
      return ctx.internalServerError('Failed to fetch admin overview stats.');
    }
  },

  async updateUserRole(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const currentUser = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      populate: ['role'],
    });

    if (currentUser?.role?.name !== 'Admin') {
      return ctx.forbidden('Only Administrators can assign user roles.');
    }

    const { id } = ctx.params;
    const { roleId } = ctx.request.body;

    if (!roleId) {
      return ctx.badRequest('roleId is required.');
    }

    try {
      const updatedUser = await strapi.db.query('plugin::users-permissions.user').update({
        where: { id: Number(id) },
        data: {
          role: Number(roleId),
        },
        populate: ['role'],
      });

      return {
        message: 'Role updated successfully',
        user: updatedUser,
      };
    } catch (err: any) {
      console.error('Update role error:', err);
      return ctx.badRequest('Failed to update user role.');
    }
  },
};