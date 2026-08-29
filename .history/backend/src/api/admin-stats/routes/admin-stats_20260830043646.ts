export default {
  routes: [
    {
      method: 'GET',
      path: '/admin/overview',
      handler: 'api::admin-stats.admin-stats.getOverview',
      config: {
        auth: {},
      },
    },
    {
      method: 'PUT',
      path: '/admin/users/:id/role',
      handler: 'api::admin-stats.admin-stats.updateUserRole',
      config: {
        auth: {},
      },
    },
  ],
};