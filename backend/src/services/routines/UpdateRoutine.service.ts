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

    private checkDuplicateName = async (name: string, profile_id: string, currentId: string): Promise<boolean> => {
        const exists = await this.collection.findOne({ 
            where: { 
                routine_name: name,
                profile_id: profile_id,
                is_active: true
            } 
        });
        // Es duplicado solo si el ID es distinto al que estamos editando
        return exists !== null && (exists as any).id !== currentId;
    };

    public update = async (id: string, body: UpdateBody) => {
        const { routine_name, routine_content } = body;

        // 1. Buscar la rutina por ID
        const routine = await this.collection.findByPk(id);
        if (!routine) throw new NotFoundException('Routine not found');

        // 2. Validar que el nuevo nombre no esté ocupado por OTRA rutina del mismo alumno
        if (routine_name) {
            const profile_id = routine.get('profile_id') as string;
            const isDuplicate = await this.checkDuplicateName(routine_name, profile_id, id);
            if (isDuplicate) throw new BadRequestException('Ya existe una rutina con ese nombre para este alumno.');
        }

        // 3. Aplicar cambios
        await routine.update({
            routine_name: routine_name ?? routine.get('routine_name'),
            routine_content: routine_content ?? routine.get('routine_content'),
            is_active: body.is_active !== undefined ? body.is_active : routine.get('is_active')
        });

        return routine;
    };
}

const updateRoutineService = new UpdateRoutineService();
export default updateRoutineService;