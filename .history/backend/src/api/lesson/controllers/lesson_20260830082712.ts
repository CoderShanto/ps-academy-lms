import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::lesson.lesson', ({ strapi }) => ({
//   async create(ctx) {
//     const user = ctx.state.user;
//     if (!user) return ctx.unauthorized('You must be logged in.');

//     const { data } = ctx.request.body || {};
//     const roleName = (user.role?.name || user.role?.type || '').toLowerCase();
//     const isInstructor = roleName.includes('instructor');

//     try {
//       // Validate that instructor owns the course being added to
//       if (isInstructor && data?.course) {
//         const isDocId = typeof data.course === 'string' && isNaN(Number(data.course));
//         const course: any = await (strapi as any).documents('api::course.course').findOne({
//           documentId: isDocId ? data.course : undefined,
//           where: !isDocId ? { id: Number(data.course) } : undefined,
//           populate: ['instructor'],
//         });

//         if (course) {
//           const ownerId = course.instructor?.id;
//           if (ownerId && ownerId !== user.id) {
//             return ctx.forbidden('You can only add lessons to your own courses.');
//           }
//         }
//       }

//       const lesson = await (strapi as any).documents('api::lesson.lesson').create({
//         data: {
//           ...data,
//           publishedAt: data?.publishedAt || new Date().toISOString(),
//         },
//       });

//       return { data: lesson };
//     } catch (err: any) {
//       console.error('Lesson create error:', err);
//       return ctx.badRequest(err.message || 'Failed to create lesson');
//     }
//   },

    async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const { data } = ctx.request.body || {};
    const roleName = (user.role?.name || user.role?.type || '').toLowerCase();
    const isInstructor = roleName.includes('instructor');

    try {
      if (isInstructor && data?.course) {
        const isDocId = typeof data.course === 'string' && isNaN(Number(data.course));
        const course: any = await (strapi as any).documents('api::course.course').findOne({
          documentId: isDocId ? data.course : undefined,
          where: !isDocId ? { id: Number(data.course) } : undefined,
          populate: ['instructor'],
        });

        if (course) {
          const ownerId = course.instructor?.id;
          if (ownerId && ownerId !== user.id) {
            return ctx.forbidden('You can only add lessons to your own courses.');
          }
        }
      }

      const lesson = await (strapi as any).documents('api::lesson.lesson').create({
        data: {
          ...data,
        },
        status: 'published', // Automatically publish the lesson
      });

      return { data: lesson };
    } catch (err: any) {
      console.error('Lesson create error:', err);
      return ctx.badRequest(err.message || 'Failed to create lesson');
    }
  },
    
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