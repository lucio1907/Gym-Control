import { DataTypes } from "sequelize";
import sequelizeConfig from "../config/sequelize.config";
import ProfileModel from "./profiles.models";

const PaymentsModel = sequelizeConfig.define("payments", {
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
  amount: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  payment_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  concept: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mp_payment_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("completed", "failed", "pending"),
    defaultValue: "pending",
    allowNull: false,
  },
});

export default PaymentsModel;
