import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::blog-post.blog-post', ({ strapi }) => ({
  // 2.8.5 - 2.8.7: Public & Students can ONLY view published posts
  async find(ctx) {
    const user = ctx.state.user;
    const role = user?.role?.name;

    // Filter to only 'published' posts for non-admins and non-content-managers
    if (!user || (role !== 'Admin' && role !== 'Content Manager')) {
      ctx.query = {
        ...ctx.query,
        filters: {
          ...(ctx.query.filters as object),
          status: 'published',
        },
        populate: { author: { fields: ['username', 'email'] } },
      };
    }

    return await super.find(ctx);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    const role = user?.role?.name;
    const { id } = ctx.params;

    const post = await strapi.db.query('api::blog-post.blog-post').findOne({
      where: { id },
      populate: { author: { fields: ['username', 'email'] } },
    });

    if (!post) {
      return ctx.notFound('Blog post not found.');
    }

    if (post.status === 'draft' && role !== 'Admin' && role !== 'Content Manager') {
      return ctx.forbidden('This draft blog post is not accessible.');
    }

    return { data: post };
  },

  // 2.8.2 & 2.8.8: Automatically link authenticated user as author on creation
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in.');
    }

    const role = user.role?.name;
    if (role !== 'Admin' && role !== 'Content Manager') {
      return ctx.forbidden('Only Content Managers and Admins can create blog posts.');
    }

    if (ctx.request.body?.data) {
      ctx.request.body.data.author = user.id;
    }

    return await super.create(ctx);
  },
}));