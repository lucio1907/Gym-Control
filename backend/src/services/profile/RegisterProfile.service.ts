import { Model, Optional } from "sequelize";
import BadRequestException from "../../errors/BadRequestException";
import ProfileModel from "../../models/profiles.models";
import { v4 as uuid } from "uuid";
import { hashPassword } from "../../utils/hashPassword.utils";
import calculateBillingDate from "../../utils/billingDate.utils";
import { BaseService } from "../BaseService.service";
import { RegisterType } from "../../validators/validators";

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
      expiration_day: calculateBillingDate(new Date()),
    };

    await this.collection.create(saveToDB);

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
