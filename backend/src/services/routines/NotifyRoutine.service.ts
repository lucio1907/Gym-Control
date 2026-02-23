import BadRequestException from "../../errors/BadRequestException";
import NotFoundException from "../../errors/NotFoundException";
import ProfileModel from "../../models/profiles.models";
import RoutinesModel from "../../models/routines.models";
import emailService from "../emails/email.service";

class NotifyRoutineService {
    public notify = async (profileId: string): Promise<void> => {
        const profile = await ProfileModel.findOne({ where: { id: profileId } });
        if (!profile) throw new NotFoundException('Profile not found');

        const activeRoutine = await RoutinesModel.findOne({
            where: { 
                profile_id: profileId,
                is_active: true
            }
        });

        if (!activeRoutine) throw new NotFoundException('No active routine found for this student');

        await emailService.sendEmail(
            profile.dataValues.email,
            "🔥 ¡Tu nueva rutina está lista!",
            "new_routine",
            {
                name: profile.dataValues.name,
                routine_name: activeRoutine.dataValues.routine_name
            }
        );
    };
}

const notifyRoutineService = new NotifyRoutineService();
export default notifyRoutineService;
