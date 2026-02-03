import { Model } from "sequelize";
import ProfileModel from "../../models/profiles.models";
import { BaseService } from "../BaseService.service";

class GetAdminsService extends BaseService<Model> {
    constructor() {
        super(ProfileModel)
    }

    public get = async (): Promise<Model[]> => {
        const admin = await this.collection.findAll({ attributes: { exclude: ['password'] } });
        return admin;
    };
};

const getAdminsService = new GetAdminsService();
export default getAdminsService;