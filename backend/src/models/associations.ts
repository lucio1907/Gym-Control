import ProfileModel from "./profiles.models";
import PaymentsModel from "./payments.models";
import AttendanceModel from "./attendance.models";
import RoutinesModel from "./routines.models";

// Profile has many Payments
ProfileModel.hasMany(PaymentsModel, {
  foreignKey: "profile_id",
  as: "payments",
});
PaymentsModel.belongsTo(ProfileModel, {
  foreignKey: "profile_id",
  as: "profile",
});

// Profile has many Attendances
ProfileModel.hasMany(AttendanceModel, {
  foreignKey: "profile_id",
  as: "attendances",
});
AttendanceModel.belongsTo(ProfileModel, {
  foreignKey: "profile_id",
  as: "profile",
});

// Profile has many Routines
ProfileModel.hasMany(RoutinesModel, {
    foreignKey: "profile_id",
    as: "routines",
});
RoutinesModel.belongsTo(ProfileModel, {
    foreignKey: "profile_id",
    as: "profile",
});