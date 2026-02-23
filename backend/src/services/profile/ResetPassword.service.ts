import bcrypt from "bcrypt";
import ProfileModel from "../../models/profiles.models";
import BadRequestException from "../../errors/BadRequestException";
import { ResetPasswordType } from "../../validators/validators";
import { Op } from "sequelize";

class ResetPasswordService {
    public async resetPassword(data: ResetPasswordType) {
        const { token, newPassword } = data;

        const user: any = await ProfileModel.findOne({
            where: {
                recovery_token: token,
                recovery_token_expires: {
                    [Op.gt]: new Date()
                }
            }
        });

        if (!user) {
            throw new BadRequestException("Invalid or expired recovery token");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.recovery_token = null;
        user.recovery_token_expires = null;
        await user.save();

        return { message: "Password updated successfully" };
    }
}

const resetPasswordService = new ResetPasswordService();
export default resetPasswordService;
