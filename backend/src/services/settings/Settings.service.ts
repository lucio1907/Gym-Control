import { Model } from "sequelize";
import SettingsModel from "../../models/settings.models";

interface SettingsData {
  gym_name?: string;
  currency?: "ARS" | "USD";
  base_fee?: number;
  notif_payment_reminder?: boolean;
  notif_debt_alert?: boolean;
  notif_routine_update?: boolean;
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
        notif_routine_update: true
      }
    });
    return settings;
  }

  public async updateSettings(data: SettingsData): Promise<Model> {
    const settings = await this.getSettings();
    await settings.update(data);
    return settings;
  }
}

const settingsService = new SettingsService();
export default settingsService;
