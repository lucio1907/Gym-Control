import SettingsModel from "./src/models/settings.models";
import sequelizeConfig from "./src/config/sequelize.config";
import "./src/models/associations";

const syncSettings = async () => {
    try {
        console.log("Authenticating...");
        await sequelizeConfig.authenticate();
        console.log("Syncing SettingsModel...");
        await SettingsModel.sync({ force: false, alter: true });
        console.log("SettingsModel synced successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error syncing SettingsModel:", error);
        process.exit(1);
    }
};

syncSettings();
