import { nanoid } from "nanoid";
import TemporalQrModel from "../../models/temporalqr.models";
import { Model, Optional } from "sequelize";
import { v4 as uuid } from "uuid";
import { BaseService } from "../BaseService.service";

interface QrInterface {
    token: string
    expires_at: Date
}

class GenerateQRService extends BaseService<Model> {
  constructor() {
    super(TemporalQrModel)
  }

  public generateQr = async () => {
    const token = nanoid(10);
    const expires_at = new Date(Date.now() + 60 * 1000);

    const saveToDB: Optional<QrInterface, any> = {
        id: uuid(),
        token,
        expires_at
    };

    await this.collection.create(saveToDB);

    return { token };
  };
}

const generateQRService = new GenerateQRService();
export default generateQRService;
