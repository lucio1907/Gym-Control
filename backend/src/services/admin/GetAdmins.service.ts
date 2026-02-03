import { Model } from "sequelize";
import ProfileModel from "../../models/profiles.models";

class GetAdminsService {
    private collection;

    constructor() {
        this.collection = ProfileModel;
    }

    public get = async (): Promise<Model[]> => {
        const admin = await this.collection.findAll({ attributes: { exclude: ['password'] } });
        return admin;
    };
};

const getAdminsService = new GetAdminsService();
export default getAdminsService;