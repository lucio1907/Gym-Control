import { Model } from "sequelize";
import RoutinesModel from "../../models/routines.models";
import NotFoundException from "../../errors/NotFoundException";
import { BaseService } from "../BaseService.service";

class DeleteRoutineService extends BaseService<Model> {
    constructor() {
        super(RoutinesModel);
    }

    private checkIfExists = async (id: string): Promise<Model | null> => {
        const exists = await this.collection.findOne({ where: { id } });
        return exists;
    };

    public delete = async (id: string): Promise<boolean> => {
        const existsRoutine = await this.checkIfExists(id);

        if (!existsRoutine) throw new NotFoundException('Routine not found');

        await this.collection.destroy({ where: { id } });
        
        return true;
    };
};

const deleteRoutineService = new DeleteRoutineService();
export default deleteRoutineService;