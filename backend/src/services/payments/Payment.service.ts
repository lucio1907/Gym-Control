import { Model } from "sequelize";
import PaymentsModel from "../../models/payments.models";
import ProfileModel from "../../models/profiles.models";
import { BaseService } from "../BaseService.service";
import { v4 as uuid } from "uuid";
import calculateBillingDate from "../../utils/billingDate.utils";
import BadRequestException from "../../errors/BadRequestException";
import NotFoundException from "../../errors/NotFoundException";

class PaymentService extends BaseService<Model> {
    constructor() {
        super(PaymentsModel);
    }

    public registerPayment = async (data: {
        profile_id: string;
        amount: number;
        concept: string;
        mp_payment_id: string;
        payment_date?: Date;
    }) => {
        const { profile_id, amount, concept, mp_payment_id, payment_date } = data;

        const profile = await ProfileModel.findByPk(profile_id);
        if (!profile) throw new NotFoundException("Profile not found");

        const newPayment = await this.collection.create({
            id: uuid(),
            profile_id,
            amount,
            concept,
            mp_payment_id,
            payment_date: payment_date || new Date(),
            status: "completed"
        });

        // Update profile subscription
        const expirationDate = calculateBillingDate(payment_date || new Date());

        await profile.update({
            billing_state: "OK",
            expiration_day: expirationDate,
            marked_days: 0 // Reset marked days for the new month
        });

        return newPayment;
    };

    public getHistory = async (profileId?: string): Promise<Model[]> => {
        const where: any = {};
        if (profileId) where.profile_id = profileId;

        return await this.collection.findAll({
            where,
            include: [
                {
                    model: ProfileModel,
                    as: "profile",
                    attributes: ["name", "lastname", "dni", "email"]
                }
            ],
            order: [["payment_date", "DESC"]]
        });
    };
}

const paymentService = new PaymentService();
export default paymentService;
