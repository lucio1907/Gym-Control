import { DataTypes } from "sequelize";
import sequelizeConfig from "../config/sequelize.config";
import ProfileModel from "./profiles.models";

const AttendanceModel = sequelizeConfig.define("attendance", {
  id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  profile_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: ProfileModel,
      key: "id",
    },
  },
  check_in_time: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Date.now(),
  },
  method: {
    type: DataTypes.ENUM("MANUAL", "QR_SCAN"),
    allowNull: false,
  },
});

export default AttendanceModel;
