
const app_conf = {
  userTypes: {
    administrator: 1,
    organizationAdmin: 2,
    organizationUser: 3,
  },
  env: {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV,
    jwtSecret: process.env.JWT_SECRET,
    apiUrl: process.env.API_URL,
    adminAppUrl: process.env.REACT_APP_ADMIN_URL,
    userAppUrl: process.env.REACT_APP_URL,
  },
};

export default app_conf;
