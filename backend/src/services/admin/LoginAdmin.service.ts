import { Model } from "sequelize";
import ProfileModel from "../../models/profiles.models";
import BadRequestException from "../../errors/BadRequestException";
import NotFoundException from "../../errors/NotFoundException";
import { comparePassword } from "../../utils/hashPassword.utils";
import jwtManagement from "../../utils/jwt.utils";
import { BaseService } from "../BaseService.service";

interface Body {
    email: string
    password: string
}

class LoginAdminService extends BaseService<Model> {
    constructor() {
        super(ProfileModel)
    }

    private checkAdmin = async (email: string, rol: string): Promise<Model | null> => {
        const exists = await this.collection.findOne({ where: { email, rol } });
        return exists;
    }

    public login = async (body: Body) => {
        const { email, password } = body;

        const admin = await this.checkAdmin(email, 'admin');
        if (!admin) throw new NotFoundException('Admin not found');

        const hashedPassword = admin.dataValues.password;
        const isPasswordOk = await comparePassword(hashedPassword, password);

        const infoForToken = {
            id: admin.dataValues.id,
            name: admin.dataValues.name,
            lastname: admin.dataValues.lastname,
            email: admin.dataValues.email,
            phone: admin.dataValues.phone,
            rol: admin.dataValues.rol,
        };

        const token = await jwtManagement.generateToken(infoForToken);
        if (token) {
              const data = {
                user: {
                  id: admin.dataValues.id,
                  credentials: {
                    name: admin.dataValues.name,
                    lastname: admin.dataValues.lastname,
                    email: admin.dataValues.email,
                    role: admin.dataValues.rol
                  },
                  session: "active",
                },
                access_token: token,
                token_type: "Bearer",
              };
        
              if (isPasswordOk) return data;
              else throw new BadRequestException("Incorrect password");
            }
    }   
};

const loginAdminService = new LoginAdminService();
export default loginAdminService;