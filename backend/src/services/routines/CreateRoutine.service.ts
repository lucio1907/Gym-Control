import { Model, Optional } from "sequelize";
import BadRequestException from "../../errors/BadRequestException";
import ProfileModel from "../../models/profiles.models";
import RoutinesModel from "../../models/routines.models";
import { v4 as uuid } from "uuid";
import NotFoundException from "../../errors/NotFoundException";
import { Routine, RoutineContent } from "../../types/routines.types";
import { BaseService } from "../BaseService.service";
import emailService from "../emails/email.service";

interface Body {
    routine_name: string
    routine_content: RoutineContent;
}

class CreateRoutineService extends BaseService<Model> {
    constructor(private readonly profileCollection = ProfileModel) {
        super(RoutinesModel)
    }

    private checkIfExists = async (routineName: string, profile_id: string): Promise<Model | null> => {
        const exists = await this.collection.findOne({ 
            where: { 
                routine_name: routineName,
                profile_id: profile_id,
                is_active: true // Only check if an ACTIVE one exists with this name
            } 
        });
        return exists;
    };

    private checkIfProfileExists = async (profile_id: string): Promise<Model | null> => {
        const exists = await this.profileCollection.findOne({ where: { id: profile_id } });
        return exists;
    };

    public create = async (body: Body, profile_id: string): Promise<Optional<Routine, any>> => {
        const { routine_name, routine_content } = body;

        if ([routine_name, routine_content].includes("")) throw new BadRequestException('Fields cannot be empty');

        const profileExists = await this.checkIfProfileExists(profile_id);
        if (!profileExists) throw new NotFoundException('Profile not found');

        // Deactivate all existing routines for this student to ensure only ONE is active
        await this.collection.update(
            { is_active: false },
            { where: { profile_id } }
        );

        const existentRoutine = await this.checkIfExists(routine_name, profile_id);
        if (existentRoutine) throw new BadRequestException('You already have a routine with this name for this student');

        const newRoutine: Optional<Routine, any> = {
            id: uuid(),
            profile_id,
            routine_name,
            routine_content,
            is_active: true
        }

        await this.collection.create(newRoutine);

        return newRoutine;
    };
};

const createRoutineService = new CreateRoutineService();
export default createRoutineService;