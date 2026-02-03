import { Model } from "sequelize";
import BadRequestException from "../../errors/BadRequestException";
import NotFoundException from "../../errors/NotFoundException";
import RoutinesModel from "../../models/routines.models";
import { RoutineContent } from "../../types/routines.types";
import { BaseService } from "../BaseService.service";

interface UpdateBody {
    routine_name?: string;
    routine_content?: RoutineContent;
    is_active?: boolean;
}

class UpdateRoutineService extends BaseService<Model>{
    constructor() {
        super(RoutinesModel);
    }

    private checkDuplicateName = async (name: string, currentId: string): Promise<boolean> => {
        const exists = await this.collection.findOne({ 
            where: { routine_name: name } 
        });
        // Es duplicado solo si el ID es distinto al que estamos editando
        return exists !== null && (exists as any).id !== currentId;
    };

    public update = async (id: string, body: UpdateBody) => {
        const { routine_name, routine_content } = body;

        // 1. Buscar la rutina por ID
        const routine = await this.collection.findByPk(id);
        if (!routine) throw new NotFoundException('Routine not found');

        // 2. Validar que el nuevo nombre no esté ocupado por OTRA rutina
        if (routine_name) {
            const isDuplicate = await this.checkDuplicateName(routine_name, id);
            if (isDuplicate) throw new BadRequestException('Routine name already in use by another profile');
        }

        // 3. Aplicar cambios
        await routine.update({
            routine_name: routine_name ?? routine.get('routine_name'),
            routine_content: routine_content ?? routine.get('routine_content')
        });

        return routine;
    };
}

const updateRoutineService = new UpdateRoutineService();
export default updateRoutineService;