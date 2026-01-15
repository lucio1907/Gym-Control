const configServer = {
  server: {
    port: process.env.PORT || 8080,
  },
  database: {
    host: process.env.PG_HOST as string,
    username: process.env.PG_USERNAME as string,
    password: process.env.PG_PASSWORD as string,
    db: process.env.PG_DATABASE as string,
    port: process.env.PG_PORT as string,
  },
  jwt: {
    expiration: process.env.JWT_EXPIRATION as string,
    secret_key: process.env.JWT_SECRET_KEY as string,
  },
};

export default configServer;
