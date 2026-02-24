import "dotenv/config";
import sequelizeConfig from "./src/config/sequelize.config";

const check = async () => {
    try {
        console.log("Checking table: active_qrs");
        const description = await sequelizeConfig.getQueryInterface().describeTable('active_qrs');
        console.log("Columns in active_qrs:", Object.keys(description));
        console.log("Full description:", JSON.stringify(description, null, 2));
        process.exit(0);
    } catch (error) {
        console.error("Error checking table:", error);
        process.exit(1);
    }
}

check();
