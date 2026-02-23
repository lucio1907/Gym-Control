import { nanoid } from "nanoid";
import ProfileModel from "../../models/profiles.models";
import emailService from "../emails/email.service";

class ForgotPasswordService {
    public async forgotPassword(email: string) {
        const user: any = await ProfileModel.findOne({ where: { email } });

        if (!user) {
            // We return success even if user not found for security reasons (avoiding email enumeration)
            // But in a internal control system, we might want to throw error. 
            // Following standard practice:
            return { message: "If the email is registered, you will receive a recovery link." };
        }

        const recoveryToken = nanoid(32);
        const expires = new Date();
        expires.setHours(expires.getHours() + 1); // 1 hour expiration

        user.recovery_token = recoveryToken;
        user.recovery_token_expires = expires;
        await user.save();

        const recoveryUrl = `${process.env.FRONTEND_URL}/reset-password?token=${recoveryToken}`;

        await emailService.sendEmail(
            email,
            "Restablecer tu contraseña - Gym Control",
            "forgot-password",
            {
                name: user.name,
                recovery_url: recoveryUrl
            }
        );

        return { message: "Recovery email sent." };
    }
}

const forgotPasswordService = new ForgotPasswordService();
export default forgotPasswordService;
