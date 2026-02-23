import { Model } from "sequelize";
import RoutinesModel from "../../models/routines.models";
import { BaseService } from "../BaseService.service";
import NotFoundException from "../../errors/NotFoundException";

class GetRoutinesService extends BaseService<Model> {
    constructor() {
        super(RoutinesModel);
    }

    public getByProfileId = async (profileId: string): Promise<Model[]> => {
        const routines = await this.collection.findAll({
            where: { profile_id: profileId }
        });

        if (!routines || routines.length === 0) {
            // It's acceptable to return an empty array if no routines exist
            return [];
        }

        return routines;
    };
}

const getRoutinesService = new GetRoutinesService();
export default getRoutinesService;
