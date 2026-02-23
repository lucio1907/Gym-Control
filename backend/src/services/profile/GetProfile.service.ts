import { Model } from "sequelize";
import ProfileModel from "../../models/profiles.models";
import { BaseService } from "../BaseService.service";
import NotFoundException from "../../errors/NotFoundException";

class GetProfileService extends BaseService<Model> {
    constructor() {
        super(ProfileModel);
    }

    public getMe = async (id: string): Promise<Model> => {
        const profile = await this.collection.findByPk(id, {
            attributes: { exclude: ["password", "recovery_token", "recovery_token_expires"] }
        });

        if (!profile) throw new NotFoundException("Profile not found");

        return profile;
    };

    public getAll = async (): Promise<Model[]> => {
        const profiles = await this.collection.findAll({
            attributes: { exclude: ["password", "recovery_token", "recovery_token_expires"] }
        });
        return profiles;
    };
}

const getProfileService = new GetProfileService();
export default getProfileService;
