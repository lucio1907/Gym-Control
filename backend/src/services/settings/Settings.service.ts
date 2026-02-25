import { Model } from "sequelize";
import SettingsModel from "../../models/settings.models";
import ProfileModel from "../../models/profiles.models";
import emailService from "../emails/email.service";

interface SettingsData {
  gym_name?: string;
  currency?: "ARS" | "USD";
  base_fee?: number;
  notif_payment_reminder?: boolean;
  notif_debt_alert?: boolean;
  notif_routine_update?: boolean;
  gym_email?: string;
  gym_sender_name?: string;
}

class SettingsService {
  public async getSettings(): Promise<Model> {
    const [settings] = await SettingsModel.findOrCreate({
      where: { id: "1" },
      defaults: {
        gym_name: "Gym Control Premium",
        currency: "ARS",
        base_fee: 15000,
        notif_payment_reminder: true,
        notif_debt_alert: true,
        notif_routine_update: true,
        gym_email: null,
        gym_sender_name: null
      }
    });
    return settings;
  }

  public async updateSettings(data: SettingsData): Promise<Model> {
    const settings = await this.getSettings() as any;
    const oldFee = settings.base_fee;

    await settings.update(data);

    // Check if fee increased
    if (data.base_fee && data.base_fee > oldFee) {
      this.notifyFeeIncrease(data.base_fee);
    }

    return settings;
  }

  private async notifyFeeIncrease(newFee: number) {
    try {
      const users = await ProfileModel.findAll({ where: { rol: "user" } });
      const settings = await this.getSettings() as any;

      for (const user of users) {
        const u = user.get() as any;
        emailService.sendEmail(
          u.email,
          "Actualización de cuota mensual - Gym Control",
          "fee_notification",
          {
            name: u.name,
            new_fee: newFee.toString()
          },
          settings.gym_sender_name,
          settings.gym_email
        ).catch(err => console.error(`Error notifying user ${u.email}:`, err));
      }
    } catch (err) {
      console.error("Error in notifyFeeIncrease:", err);
    }
  }
}

const settingsService = new SettingsService();
export default settingsService;
