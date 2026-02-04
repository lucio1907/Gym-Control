import { Model, Optional } from "sequelize";
import BadRequestException from "../../errors/BadRequestException";
import ProfileModel from "../../models/profiles.models";
import { v4 as uuid } from "uuid";
import { hashPassword } from "../../utils/hashPassword.utils";
import { BaseService } from "../BaseService.service";

interface Body {
  name: string;
  lastname: string;
  email: string;
  password: string;
  rol: "admin" | "user";
  phone: string;
  dni: string;
}

interface Admin extends Body {
  id: string;
}

class CreateAdminService extends BaseService<Model> {
  constructor() {
    super(ProfileModel)
  }

  private checkAdmin = async (email: string): Promise<Model | null> => {
    const exists = await this.collection.findOne({ where: { email } });
    return exists;
  };

  public create = async (body: Body) => {
    const { name, lastname, email, password, rol, phone, dni } = body;

    const adminExists = await this.checkAdmin(email);

    if (adminExists) throw new BadRequestException("This email is registered");

    const newAdmin: Optional<Admin, any> = {
      id: uuid(),
      name,
      lastname,
      email,
      password: await hashPassword(password),
      rol: "admin",
      phone,
      dni,
    };

    await this.collection.create(newAdmin);

    return {
      id: newAdmin.id,
      name,
      lastname,
      email,
      role: rol,
      phone,
      dni,
    };
  };
}

const createAdminService = new CreateAdminService();
export default createAdminService;