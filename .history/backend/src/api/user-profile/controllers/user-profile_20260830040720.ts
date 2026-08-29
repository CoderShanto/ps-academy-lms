export default {
  async getCurrentUser(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const fullUser = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      populate: ['role'],
    });

    return {
      id: fullUser.id,
      documentId: fullUser.documentId,
      username: fullUser.username,
      email: fullUser.email,
      role: fullUser.role ? {
        id: fullUser.role.id,
        name: fullUser.role.name,
        type: fullUser.role.type,
      } : null,
    };
  },
};