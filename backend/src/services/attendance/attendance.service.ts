import NotFoundException from "../../errors/NotFoundException";
import ProfileModel from "../../models/profiles.models";
import TemporalQrModel from "../../models/temporalqr.models";
import BadRequestException from "../../errors/BadRequestException";
import { v4 as uuid } from "uuid";
import AttendanceModel from "../../models/attendance.models";
import { Model, Optional } from "sequelize";
import { BaseService } from "../BaseService.service";

interface NewAttendance {
    id: string
    profile_id: string
    check_in_time: Date
    method: string
}

class AttendanceService extends BaseService<Model> {
    constructor(
        private readonly qrCollection = TemporalQrModel,
        private readonly profileCollection = ProfileModel
    ) {
        super(AttendanceModel)
    }

    private checkProfileOverdue = async (profileId: string): Promise<Model> => {
        const profile = await this.profileCollection.findByPk(profileId);

        if (profile?.dataValues.billing_state !== 'OK') throw new BadRequestException('Overdue fee');

        return profile;
    };

    public registerEntry = async (token: string, profileId: string, method: 'QR_SCAN' | 'MANUAL') => {
        const qrRecord = await this.qrCollection.findOne({ where: { token } });

        if (!qrRecord) throw new NotFoundException("Invalid QR code");

        if (new Date() > qrRecord.dataValues.expires_at) throw new BadRequestException('QR code expired');

        // Chequea si tiene la cuota al día
        const profile = await this.checkProfileOverdue(profileId);

        // Sumar día marcado
        await profile.increment('marked_days', { by: 1 });

        // Recargar la instancia para que el "return" tenga el valor actualizado
        await profile.reload();

        const newAttendance: Optional<NewAttendance, any> = await this.collection.create({
            id: uuid(),
            profile_id: profileId,
            check_in_time: new Date(),
            method
        })

        // Borrar QR escaneado
        await qrRecord.destroy();

        return {
            profile: {
                name: profile.dataValues.name,
                lastname: profile.dataValues.lastname,
                expiration_day: profile.dataValues.expiration_day,
                marked_days: profile.dataValues.marked_days
            },
            time: newAttendance.check_in_time
        }
    };

}

const attendanceService = new AttendanceService();
export default attendanceService;