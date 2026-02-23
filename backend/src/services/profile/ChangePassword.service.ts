import { Model } from "sequelize";
import ProfileModel from "../../models/profiles.models";
import { BaseService } from "../BaseService.service";
import NotFoundException from "../../errors/NotFoundException";
import BadRequestException from "../../errors/BadRequestException";
import { compareSync, hashSync } from "bcrypt";

class ChangePasswordService extends BaseService<Model> {
    constructor() {
        super(ProfileModel);
    }

    public changePassword = async (id: string, passwords: { currentPass: string, newPass: string }): Promise<void> => {
        const profile = await this.collection.findByPk(id) as any;

        if (!profile) throw new NotFoundException("Profile not found");

        const isMatch = compareSync(passwords.currentPass, profile.password);
        if (!isMatch) throw new BadRequestException("Contraseña actual incorrecta");

        const hashedNewPassword = hashSync(passwords.newPass, 10);

        await profile.update({ password: hashedNewPassword });
    };
}

const changePasswordService = new ChangePasswordService();
export default changePasswordService;
