import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";

class EmailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_PORT === "465", // true for 465, false for others
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false // Often needed for some SMTP relays
            },
            pool: true,
            connectionTimeout: 15000,
            greetingTimeout: 15000,
            socketTimeout: 15000
        });
    }

    public sendEmail = async (
        to: string, 
        subject: string, 
        templateFileName: string, 
        data: Record<string, string>,
        fromName?: string,
        fromEmail?: string
    ): Promise<any> => {
        try {
            // Busca la ruta del archivo HTML
            const templatePath = path.join(__dirname, "../../templates", `${templateFileName}.html`);

            // Lee el contenido del archivo con un string
            let htmlContent = await fs.readFile(templatePath, "utf-8");

            // Reemplaza los placeholders {{key}} por los valores de 'data'
            const templateData = {
                ...data,
                frontend_url: process.env.FRONTEND_URL || "http://localhost:3000"
            };

            Object.keys(templateData).forEach((key) => {
                const regex = new RegExp(`{{${key}}}`, "g");
                htmlContent = htmlContent.replace(regex, (templateData as any)[key]);
            });

            const finalFromEmail = fromEmail || process.env.EMAIL_FROM || process.env.EMAIL_USER;
            const finalFromName = fromName || "Gym Control 💪";

            const info = await this.transporter.sendMail({
                from: `"${finalFromName}" <${finalFromEmail}>`,
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