const {
  NODE_ENV,
  JWT_SECRET = 'super-strong-secret',
  PORT = 5000,
  MONGO_URI = 'uri',
  MONGO_PW = 'pw',
  MONGO_USER = 'user',
} = process.env;

module.exports = {
  NODE_ENV,
  JWT_SECRET: NODE_ENV === 'production' ? JWT_SECRET : 'super-strong-secret',
  PORT,
  MONGO_URI,
  MONGO_PW,
  MONGO_USER,
};
