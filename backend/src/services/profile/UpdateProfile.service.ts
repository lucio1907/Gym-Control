import { Model } from "sequelize";
import ProfileModel from "../../models/profiles.models";
import { BaseService } from "../BaseService.service";
import NotFoundException from "../../errors/NotFoundException";

interface UpdateProfileData {
    name?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    dni?: string;
    billing_state?: "OK" | "defeated" | "pending";
    expiration_day?: Date;
}

class UpdateProfileService extends BaseService<Model> {
    constructor() {
        super(ProfileModel);
    }

    public update = async (id: string, data: UpdateProfileData): Promise<Model> => {
        const profile = await this.collection.findByPk(id);

        if (!profile) throw new NotFoundException("Profile not found");

        await profile.update(data);

        return profile;
    };
}

const updateProfileService = new UpdateProfileService();
export default updateProfileService;
