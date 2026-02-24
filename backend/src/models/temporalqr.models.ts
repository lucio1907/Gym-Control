import { DataTypes } from "sequelize";
import sequelizeConfig from "../config/sequelize.config";

const TemporalQrModel = sequelizeConfig.define("active_qrs", {
  id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  profile_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

export default TemporalQrModel;
