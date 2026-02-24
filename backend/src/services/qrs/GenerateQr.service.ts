import { nanoid } from "nanoid";
import TemporalQrModel from "../../models/temporalqr.models";
import { Model, Optional } from "sequelize";
import { v4 as uuid } from "uuid";
import { BaseService } from "../BaseService.service";

interface QrInterface {
    token: string
    profile_id: string
    expires_at: Date
}

class GenerateQRService extends BaseService<Model> {
  constructor() {
    super(TemporalQrModel)
  }

  public generateQr = async (profileId: string) => {
    const token = nanoid(10);
    const expires_at = new Date(Date.now() + 60 * 1000);

    const saveToDB: Optional<QrInterface, any> = {
        id: uuid(),
        token,
        profile_id: profileId,
        expires_at
    };

    await this.collection.create(saveToDB);

    return { token };
  };

  /**
   * Generates a QR for the entrance monitor. 
   * This is a special QR that ANY student can scan to register their entry.
   */
  public generateEntranceQr = async () => {
    const token = `ENTRANCE_${nanoid(15)}`;
    // Entrance QRs last longer (e.g., 2 minutes) and can be multi-use
    const expires_at = new Date(Date.now() + 2 * 60 * 1000);

    const saveToDB: Optional<QrInterface, any> = {
        id: uuid(),
        token,
        profile_id: "GYM_ENTRANCE",
        expires_at
    };

    await this.collection.create(saveToDB);

    return { token };
  };
}

const generateQRService = new GenerateQRService();
export default generateQRService;
