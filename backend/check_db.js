const { Sequelize, DataTypes } = require('sequelize');
const dot = require('dotenv');
dot.config();

const sequelize = new Sequelize(process.env.PG_DATABASE, process.env.PG_USERNAME, process.env.PG_PASSWORD, {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

const Routines = sequelize.define("routines", {
    id: { type: DataTypes.STRING, primaryKey: true },
    routine_name: DataTypes.STRING,
    profile_id: DataTypes.STRING,
    is_active: DataTypes.BOOLEAN
}, { timestamps: false });

async function check() {
    try {
        await sequelize.authenticate();
        const all = await Routines.findAll();
        console.log("ROUTINES_DATA:" + JSON.stringify(all, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
