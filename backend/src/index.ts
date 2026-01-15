import app from "./app";
import configServer from "./config/configServer.config";
import sequelizeConfig from "./config/sequelize.config";

const main = async (): Promise<void> => {
  try {
    await sequelizeConfig.sync({ force: false, alter: true });
    const PORT: number = configServer.server.port as number;

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.log("Unable to connect to the database");
    console.error(error);
  }
};

main();
