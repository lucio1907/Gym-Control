import { Model, Optional, Op } from "sequelize";
import { v4 as uuid } from "uuid";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";
import BadRequestException from "../../errors/BadRequestException";
import NotFoundException from "../../errors/NotFoundException";
import ProfileModel from "../../models/profiles.models";
import { hashPassword, comparePassword } from "../../utils/hashPassword.utils";
import jwtManagement from "../../utils/jwt.utils";
import { BaseService } from "../BaseService.service";
import emailService from "../emails/email.service";
import settingsService from "../settings/Settings.service";
import { formatDateDayMonthYear } from "../../utils/formatDate.utils";
import calculateBillingDate from "../../utils/billingDate.utils";
import PlanModel from "../../models/plans.models";
import RoutinesModel from "../../models/routines.models";
import AttendanceModel from "../../models/attendance.models";

interface RegisterBody {
    name: string;
    lastname: string;
    email: string;
    password: string;
    phone: string;
    dni: string;
    plan_id?: string;
    teacher_id?: string;
    rol?: "admin" | "user" | "teacher";
}

interface LoginBody {
    email: string;
    password: string;
}

interface UpdateProfileData {
    name?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    dni?: string;
    billing_state?: "OK" | "defeated" | "pending";
    expiration_day?: Date;
    plan_id?: string;
    teacher_id?: string;
}

class ProfileService extends BaseService<Model> {
    constructor() {
        super(ProfileModel);
    }

    public register = async (body: RegisterBody) => {
        const { name, lastname, email, password, phone, dni, plan_id, teacher_id, rol = "user" } = body;

        const exists = await this.collection.findOne({ where: { email } });
        if (exists) throw new BadRequestException(`User with email ${email} already exists`);

        const recoveryToken = nanoid(32);
        const expires = new Date();
        expires.setHours(expires.getHours() + 24);

        const newProfile = await this.collection.create({
            id: uuid(),
            name,
            lastname,
            email,
            password: await hashPassword(password),
            phone,
            dni,
            rol,
            billing_state: "pending",
            expiration_day: null,
            plan_id,
            teacher_id,
            recovery_token: recoveryToken,
            recovery_token_expires: expires
        });

        const settings = await settingsService.getSettings() as any;
        const activationUrl = `${process.env.FRONTEND_URL}/reset-password?token=${recoveryToken}`;

        // Determinar plantilla y asunto según el rol
        const isTeacher = rol === "teacher";
        const emailSubject = isTeacher ? "¡Bienvenido al equipo de Gym Control! 🤝" : "¡Bienvenido al Gym!";
        const emailTemplate = isTeacher ? "teacher_welcome" : "welcome";

        await emailService.sendEmail(
            email,
            emailSubject,
            emailTemplate,
            {
                name,
                expiration_day: formatDateDayMonthYear(newProfile.dataValues.expiration_day),
                activation_url: activationUrl
            },
            settings.gym_sender_name,
            settings.gym_email
        );

        return {
            user: newProfile
        };
    };

    public login = async (body: LoginBody) => {
        const { email, password } = body;
        const user = await this.collection.findOne({ where: { email } });
        if (!user) throw new NotFoundException("User not found");

        const isPasswordOk = await comparePassword(user.dataValues.password, password);
        if (!isPasswordOk) throw new BadRequestException("Incorrect password");

        const infoForToken = {
            id: user.dataValues.id,
            name: user.dataValues.name,
            lastname: user.dataValues.lastname,
            email: user.dataValues.email,
            phone: user.dataValues.phone,
            rol: user.dataValues.rol,
            billing_state: user.dataValues.billing_state
        };

        const token = await jwtManagement.generateToken(infoForToken);
        return {
            user: {
                id: user.dataValues.id,
                credentials: {
                    name: user.dataValues.name,
                    lastname: user.dataValues.lastname,
                    email: user.dataValues.email,
                    role: user.dataValues.rol
                },
                session: "active",
            },
            access_token: token,
            token_type: "Bearer",
        };
    };

    public getMe = async (id: string) => {
        const profile = await this.collection.findByPk(id, {
            attributes: { exclude: ["password", "recovery_token", "recovery_token_expires"] },
            include: [{ model: PlanModel, as: "plan" }]
        });
        if (!profile) throw new NotFoundException("Profile not found");
        return profile;
    };

    public getAll = async () => {
        return await this.collection.findAll({
            attributes: { exclude: ["password", "recovery_token", "recovery_token_expires"] },
            include: [{ model: PlanModel, as: "plan" }]
        });
    };

    public getById = async (id: string) => {
        const profile = await this.collection.findByPk(id, {
            attributes: { exclude: ["password", "recovery_token", "recovery_token_expires"] },
            include: [{ model: PlanModel, as: "plan" }]
        });
        if (!profile) throw new NotFoundException("Profile not found");
        return profile;
    };

    public update = async (id: string, data: UpdateProfileData) => {
        const profile = await this.collection.findByPk(id);
        if (!profile) throw new NotFoundException("Profile not found");
        await profile.update(data);
        return profile;
    };

    public delete = async (id: string) => {
        const profile = await this.collection.findByPk(id);
        if (!profile) throw new NotFoundException("Profile not found");
        await profile.destroy();
    };

    public changePassword = async (id: string, { currentPass, newPass }: { currentPass: string, newPass: string }) => {
        const profile = await this.collection.findByPk(id) as any;
        if (!profile) throw new NotFoundException("Profile not found");

        const isMatch = bcrypt.compareSync(currentPass, profile.password);
        if (!isMatch) throw new BadRequestException("Contraseña actual incorrecta");

        await profile.update({ password: bcrypt.hashSync(newPass, 10) });
    };

    public forgotPassword = async (email: string) => {
        const user: any = await this.collection.findOne({ where: { email } });
        if (!user) return { message: "If the email is registered, you will receive a recovery link." };

        const recoveryToken = nanoid(32);
        const expires = new Date();
        expires.setHours(expires.getHours() + 1);

        user.recovery_token = recoveryToken;
        user.recovery_token_expires = expires;
        await user.save();

        const settings = await settingsService.getSettings() as any;
        await emailService.sendEmail(
            email,
            "Restablecer tu contraseña - Gym Control",
            "forgot-password",
            {
                name: user.name,
                recovery_url: `${process.env.FRONTEND_URL}/reset-password?token=${recoveryToken}`
            },
            settings.gym_sender_name,
            settings.gym_email
        );

        return { message: "Recovery email sent." };
    };

    public resetPassword = async (token: string, newPass: string) => {
        const user: any = await this.collection.findOne({
            where: {
                recovery_token: token,
                recovery_token_expires: { [Op.gt]: new Date() }
            }
        });

        if (!user) throw new BadRequestException("Invalid or expired recovery token");

        user.password = await bcrypt.hash(newPass, 10);
        user.recovery_token = null;
        user.recovery_token_expires = null;
        await user.save();

        return { message: "Password updated successfully" };
    };

    public getAssignedStudents = async (teacherId: string) => {
        const students = await this.collection.findAll({
            where: { teacher_id: teacherId, rol: "user" },
            attributes: { exclude: ["password", "recovery_token", "recovery_token_expires"] },
            include: [{ model: PlanModel, as: "plan" }]
        });

        const studentIds = students.map((s: any) => s.id);

        const activeRoutines = await RoutinesModel.findAll({
            where: {
                profile_id: studentIds,
                is_active: true
            },
            attributes: ["profile_id"]
        });

        const studentsWithActiveRoutine = new Set(activeRoutines.map((r: any) => r.get("profile_id")));

        return students.map((s: any) => {
            const studentData = s.toJSON();
            studentData.has_active_routine = studentsWithActiveRoutine.has(s.id);
            return studentData;
        });
    };

    public claimStudent = async (teacherId: string, identifier: string) => {
        const student: any = await this.collection.findOne({
            where: {
                [Op.and]: [
                    { rol: "user" },
                    {
                        [Op.or]: [
                            { dni: identifier },
                            { email: identifier }
                        ]
                    }
                ]
            }
        });

        if (!student) throw new NotFoundException("Servicio: Alumno no encontrado");

        if (student.teacher_id) {
            if (student.teacher_id === teacherId) {
                throw new BadRequestException("Este alumno ya está asignado a vos.");
            }
            throw new BadRequestException("Este alumno ya tiene otro profesor asignado.");
        }

        student.teacher_id = teacherId;
        await student.save();

        return student;
    };

    public searchUnlinkedStudents = async (query: string) => {
        return await this.collection.findAll({
            where: {
                rol: "user",
                teacher_id: null,
                [Op.or]: [
                    { name: { [Op.iLike]: `%${query}%` } },
                    { lastname: { [Op.iLike]: `%${query}%` } },
                    { dni: { [Op.iLike]: `%${query}%` } }
                ]
            },
            attributes: ["id", "name", "lastname", "dni", "email"],
            limit: 10
        });
    };

    public getTeacherStats = async (teacherId: string) => {
        const students = await this.collection.findAll({
            where: { teacher_id: teacherId, rol: "user" },
            attributes: ["id", "name", "lastname"]
        });

        const studentIds = students.map((s: any) => s.id);

        // 1. Total Students
        const totalStudents = students.length;

        // 2. Students without active routines
        const activeRoutines = await RoutinesModel.findAll({
            where: {
                profile_id: studentIds,
                is_active: true
            },
            attributes: ["profile_id"]
        });
        const studentsWithActiveRoutine = new Set(activeRoutines.map((r: any) => r.get("profile_id")));
        const studentsWithoutRoutine = totalStudents - studentsWithActiveRoutine.size;

        // 3. Recent Attendance (Last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentAttendance = await AttendanceModel.count({
            distinct: true,
            col: "profile_id",
            where: {
                profile_id: studentIds,
                check_in_time: { [Op.gte]: sevenDaysAgo }
            }
        });

        // 4. Routine Health (Updates in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const updatedRoutines = await RoutinesModel.count({
            distinct: true,
            col: "profile_id",
            where: {
                profile_id: studentIds,
                is_active: true,
                updatedAt: { [Op.gte]: thirtyDaysAgo }
            }
        });

        return {
            totalStudents,
            studentsWithoutRoutine,
            recentAttendance,
            updatedRoutines, // Count of students with recent routine updates
            healthPercentage: totalStudents > 0 ? Math.round((updatedRoutines / totalStudents) * 100) : 0
        };
    };
}

const profileService = new ProfileService();
export default profileService;
