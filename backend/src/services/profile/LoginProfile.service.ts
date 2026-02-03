import BadRequestException from "../../errors/BadRequestException";
import NotFoundException from "../../errors/NotFoundException";
import ProfileModel from "../../models/profiles.models";
import { comparePassword } from "../../utils/hashPassword.utils";
import jwtManagement from "../../utils/jwt.utils";

interface LoginBody {
  email: string;
  password: string;
}

class LoginProfileService {
  private collection;

  constructor() {
    this.collection = ProfileModel;
  }

  private checkExistentUser = async (email: string) => {
    const user = await this.collection.findOne({ where: { email } });
    return user;
  };

  public login = async (body: LoginBody) => {
    const { email, password } = body;

    if ([email, password].includes(""))
      throw new BadRequestException("Fields cannot be empty");

    const user = await this.checkExistentUser(email);
    if (!user) throw new NotFoundException("User not found");

    const hashedPassword = await user.dataValues.password;
    const isPasswordOk = await comparePassword(hashedPassword, password);

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
    if (token) {
      const data = {
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

      if (isPasswordOk) return data;
      else throw new BadRequestException("Incorrect password");
    }
  };
}

const loginProfileService = new LoginProfileService();
export default loginProfileService;
