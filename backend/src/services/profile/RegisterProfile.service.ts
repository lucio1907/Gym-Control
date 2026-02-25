import { Model, Optional } from "sequelize";
import { nanoid } from "nanoid";
import BadRequestException from "../../errors/BadRequestException";
import ProfileModel from "../../models/profiles.models";
import { v4 as uuid } from "uuid";
import { hashPassword } from "../../utils/hashPassword.utils";
import calculateBillingDate from "../../utils/billingDate.utils";
import { BaseService } from "../BaseService.service";
import { RegisterType } from "../../validators/validators";
import emailService from "../emails/email.service";
import settingsService from "../settings/Settings.service";
import { formatDateDayMonthYear } from "../../utils/formatDate.utils";

interface RegisterBody {
  name: string;
  lastname: string;
  email: string;
  password: string;
  phone: string;
  dni: string;
}

interface Profile {
  id: string;
  name: string;
  lastname: string;
  email: string;
  password: string;
  rol: "admin" | "user";
  phone: string;
  dni: string;
  billing_state: "OK" | "defeated" | "pending";
  expiration_day: Date;
  recovery_token?: string | null;
  recovery_token_expires?: Date | null;
}

class RegisterProfile extends BaseService<Model>{
  constructor() {
    super(ProfileModel);
  }

  private checkExistentUser = async (email: string) => {
    const exists = await this.collection.findOne({ where: { email } });
    return exists;
  };

  public register = async (body: RegisterBody) => {
    const { name, lastname, email, password, phone, dni } = body;

    const existentUser = await this.checkExistentUser(email);
    if (existentUser) throw new BadRequestException(`User with email ${email} already exists`);

    const recoveryToken = nanoid(32);
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // 24 hours for activation

    const saveToDB: Optional<Profile, any> = {
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
    };

    const newProfile = await this.collection.create(saveToDB);

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
}

const registerProfileService = new RegisterProfile();
export default registerProfileService;
