import { Sequelize } from "sequelize";
import configServer from "./configServer.config";

const sequelizeConfig = new Sequelize(
  configServer.database.db,
  configServer.database.username,
  configServer.database.password,
  {
    host: configServer.database.host,
    port: parseInt(configServer.database.port),
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

export default sequelizeConfig;