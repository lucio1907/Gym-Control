import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import fs from "fs/promises";
import path from "path";

class EmailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    public sendEmail = async (to: string, subject: string, templateFileName: string, data: Record<string, string>): Promise<SMTPTransport.SentMessageInfo> => {
        try {
            // Busca la ruta del archivo HTML
            const templatePath = path.join(__dirname, "../../templates", `${templateFileName}.html`);

            // Lee el contenido del archivo con un string
            let htmlContent = await fs.readFile(templatePath, "utf-8");

            // Reemplaza los placeholders {{key}} por los valores de 'data'
            Object.keys(data).forEach((key) => {
                const regex = new RegExp(`{{${key}}}`, "g");
                htmlContent = htmlContent.replace(regex, data[key]);
            });

            const info = await this.transporter.sendMail({
                from: `"Gym Control 💪" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html: htmlContent
            });
            return info;
        } catch (error) {
            console.error("Error sending email: ", error);
            throw error;
        }
    };
};

const emailService = new EmailService();
export default emailService;