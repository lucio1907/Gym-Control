import cron from "node-cron";
import ProfileModel from "../../models/profiles.models";
import settingsService from "../settings/Settings.service";
import emailService from "../emails/email.service";
import { Op } from "sequelize";

class CronService {
    public init() {
        // Runs every day at 09:00 AM server time
        cron.schedule("0 9 * * *", async () => {
            console.log("[CRON] Running daily checks for expirations...");
            try {
                await this.checkPaymentReminders();
                await this.checkDebtAlerts();
                await this.checkAndUpdateExpirations();
            } catch (error) {
                console.error("[CRON] Error running daily checks:", error);
            }
        });
    }

    private async checkPaymentReminders() {
        const settings = await settingsService.getSettings() as any;
        if (!settings.notif_payment_reminder) {
            console.log("[CRON] Reminder notifications are disabled globally.");
            return;
        }

        // Target: expiration_day is exactly 3 days from now
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 3);
        targetDate.setHours(0, 0, 0, 0);

        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const expiringProfiles = await ProfileModel.findAll({
            where: {
                rol: "user",
                expiration_day: {
                    [Op.between]: [targetDate, endOfDay]
                }
            }
        }) as any[];

        console.log(`[CRON] Found ${expiringProfiles.length} profiles expiring in 3 days.`);

        for (const profile of expiringProfiles) {
            try {
                if (!profile.email) continue;
                await emailService.sendEmail(
                    profile.email,
                    "🌟 Tu cuota de Gym Control vence pronto",
                    "payment_reminder",
                    {
                        name: profile.name,
                        gym_name: settings.gym_name,
                        amount: settings.base_fee.toString(),
                        currency: settings.currency === "ARS" ? "$" : "US$"
                    }
                );
            } catch (err) {
                console.error(`[CRON] Failed to send reminder to ${profile.email}`, err);
            }
        }
    }

    private async checkDebtAlerts() {
        const settings = await settingsService.getSettings() as any;
        if (!settings.notif_debt_alert) {
            console.log("[CRON] Debt alert notifications are disabled globally.");
            return;
        }

        // Target: expiration_day was exactly 1 day ago
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - 1);
        targetDate.setHours(0, 0, 0, 0);

        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const expiredProfiles = await ProfileModel.findAll({
            where: {
                rol: "user",
                expiration_day: {
                    [Op.between]: [targetDate, endOfDay]
                }
            }
        }) as any[];

        console.log(`[CRON] Found ${expiredProfiles.length} profiles that expired 1 day ago.`);

        for (const profile of expiredProfiles) {
            try {
                if (!profile.email) continue;
                await emailService.sendEmail(
                    profile.email,
                    "⚠️ Urgente: Cuota Vencida",
                    "debt_alert",
                    {
                        name: profile.name,
                        gym_name: settings.gym_name
                    }
                );
            } catch (err) {
                console.error(`[CRON] Failed to send debt alert to ${profile.email}`, err);
            }
        }
    }

    private async checkAndUpdateExpirations() {
        console.log("[CRON] Checking for expired profiles to update billing_state...");
        try {
            const now = new Date();
            
            // Find users who are mark as OK but their expiration day has passed
            const expiredProfiles = await ProfileModel.findAll({
                where: {
                    rol: "user",
                    billing_state: "OK",
                    expiration_day: {
                        [Op.lt]: now
                    }
                }
            }) as any[];

            if (expiredProfiles.length > 0) {
                console.log(`[CRON] Found ${expiredProfiles.length} expired profiles. Updating to 'defeated'...`);
                
                await ProfileModel.update(
                    { billing_state: "defeated" },
                    {
                        where: {
                            id: {
                                [Op.in]: expiredProfiles.map(p => p.id)
                            }
                        }
                    }
                );
                
                console.log("[CRON] Profiles updated successfully.");
            } else {
                console.log("[CRON] No new expirations found.");
            }
        } catch (error) {
            console.error("[CRON] Error updating expired profiles:", error);
        }
    }
}

const cronService = new CronService();
export default cronService;
