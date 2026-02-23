import { Model } from "sequelize";
import ProfileModel from "../../models/profiles.models";
import { BaseService } from "../BaseService.service";
import NotFoundException from "../../errors/NotFoundException";

class DeleteProfileService extends BaseService<Model> {
    constructor() {
        super(ProfileModel);
    }

    public delete = async (id: string): Promise<void> => {
        const profile = await this.collection.findByPk(id);

        if (!profile) throw new NotFoundException("Profile not found");

        await profile.destroy();
    };
}

const deleteProfileService = new DeleteProfileService();
export default deleteProfileService;
