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

interface RegisterBody {
    name: string;
    lastname: string;
    email: string;
    password: string;
    phone: string;
    dni: string;
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
}

class ProfileService extends BaseService<Model> {
    constructor() {
        super(ProfileModel);
    }

    public register = async (body: RegisterBody) => {
        const { name, lastname, email, password, phone, dni } = body;

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
            rol: "user",
            billing_state: "pending",
            expiration_day: null,
            recovery_token: recoveryToken,
            recovery_token_expires: expires
        });

        const settings = await settingsService.getSettings() as any;
        const activationUrl = `${process.env.FRONTEND_URL}/reset-password?token=${recoveryToken}`;

        await emailService.sendEmail(
            email,
            "¡Bienvenido al Gym!",
            "welcome",
            {
                name,
                expiration_day: formatDateDayMonthYear(newProfile.dataValues.expiration_day),
                activation_url: activationUrl
            },
            settings.gym_sender_name,
            settings.gym_email
        );

        return {
            user: {
                name,
                lastname,
                email,
                phone,
                dni,
                rol: "user",
                expirationDay: calculateBillingDate(new Date()),
            },
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
            attributes: { exclude: ["password", "recovery_token", "recovery_token_expires"] }
        });
        if (!profile) throw new NotFoundException("Profile not found");
        return profile;
    };

    public getAll = async () => {
        return await this.collection.findAll({
            attributes: { exclude: ["password", "recovery_token", "recovery_token_expires"] }
        });
    };

    public getById = async (id: string) => {
        const profile = await this.collection.findByPk(id, {
            attributes: { exclude: ["password", "recovery_token", "recovery_token_expires"] }
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
}

const profileService = new ProfileService();
export default profileService;
