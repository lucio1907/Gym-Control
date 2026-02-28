import { Model, Optional } from "sequelize";
import { v4 as uuid } from "uuid";
import BadRequestException from "../../errors/BadRequestException";
import NotFoundException from "../../errors/NotFoundException";
import ProfileModel from "../../models/profiles.models";
import RoutinesModel from "../../models/routines.models";
import { Routine, RoutineContent } from "../../types/routines.types";
import { BaseService } from "../BaseService.service";
import emailService from "../emails/email.service";
import settingsService from "../settings/Settings.service";

interface CreateRoutineBody {
    routine_name: string
    routine_content: RoutineContent;
}

interface UpdateRoutineBody {
    routine_name?: string;
    routine_content?: RoutineContent;
    is_active?: boolean;
}

class RoutineService extends BaseService<Model> {
    constructor() {
        super(RoutinesModel);
    }

    public create = async (body: CreateRoutineBody, profileId: string): Promise<Optional<Routine, any>> => {
        const { routine_name, routine_content } = body;

        if (!routine_name || !routine_content) throw new BadRequestException('Fields cannot be empty');

        const profileExists = await ProfileModel.findByPk(profileId);
        if (!profileExists) throw new NotFoundException('Profile not found');

        // Deactivate all existing routines for this student to ensure only ONE is active
        await this.collection.update(
            { is_active: false },
            { where: { profile_id: profileId } }
        );

        const existentRoutine = await this.collection.findOne({ 
            where: { 
                routine_name,
                profile_id: profileId,
                is_active: true 
            } 
        });

        if (existentRoutine) throw new BadRequestException('You already have an active routine with this name for this student');

        const newRoutine: Optional<Routine, any> = {
            id: uuid(),
            profile_id: profileId,
            routine_name,
            routine_content,
            is_active: true
        }

        await this.collection.create(newRoutine);
        return newRoutine;
    };

    public getByProfileId = async (profileId: string): Promise<Model[]> => {
        return await this.collection.findAll({
            where: { profile_id: profileId }
        });
    };

    public update = async (id: string, body: UpdateRoutineBody): Promise<Model> => {
        const routine = await this.collection.findByPk(id);
        if (!routine) throw new NotFoundException('Routine not found');

        if (body.routine_name) {
            const profileId = routine.get('profile_id') as string;
            const exists = await this.collection.findOne({ 
                where: { 
                    routine_name: body.routine_name,
                    profile_id: profileId,
                    is_active: true
                } 
            });

            if (exists && (exists as any).id !== id) {
                throw new BadRequestException('Ya existe una rutina con ese nombre para este alumno.');
            }
        }

        await routine.update({
            routine_name: body.routine_name ?? routine.get('routine_name'),
            routine_content: body.routine_content ?? routine.get('routine_content'),
            is_active: body.is_active !== undefined ? body.is_active : routine.get('is_active')
        });

        return routine;
    };

    public delete = async (id: string): Promise<void> => {
        const routine = await this.collection.findByPk(id);
        if (!routine) throw new NotFoundException('Routine not found');

        await routine.destroy();
    };

    public notify = async (profileId: string): Promise<void> => {
        const profile = await ProfileModel.findByPk(profileId);
        if (!profile) throw new NotFoundException('Profile not found');

        const activeRoutine = await this.collection.findOne({
            where: { 
                profile_id: profileId,
                is_active: true
            }
        });

        if (!activeRoutine) throw new NotFoundException('No active routine found for this student');

        const settings = await settingsService.getSettings() as any;

        await emailService.sendEmail(
            profile.dataValues.email,
            "🔥 ¡Tu nueva rutina está lista!",
            "new_routine",
            {
                name: profile.dataValues.name,
                routine_name: (activeRoutine as any).routine_name
            },
            settings.gym_sender_name,
            settings.gym_email
        );
    };
}

const routineService = new RoutineService();
export default routineService;
