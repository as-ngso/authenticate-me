export default () => ({
  port: parseInt(process.env.PORT, 10) || 4000,
  env: process.env.NODE_ENV,
  prod: process.env.NODE_ENV === 'production',
});
