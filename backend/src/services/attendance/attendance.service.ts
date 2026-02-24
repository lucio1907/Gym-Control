import NotFoundException from "../../errors/NotFoundException";
import ProfileModel from "../../models/profiles.models";
import TemporalQrModel from "../../models/temporalqr.models";
import BadRequestException from "../../errors/BadRequestException";
import { v4 as uuid } from "uuid";
import AttendanceModel from "../../models/attendance.models";
import { Model, Op, Optional } from "sequelize";
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

        if (!qrRecord) throw new NotFoundException("Código QR inválido");

        if (new Date() > qrRecord.dataValues.expires_at) throw new BadRequestException('El código QR expiró');

        // Check if it's an entrance QR or a user QR
        const isEntranceQr = qrRecord.dataValues.profile_id === 'GYM_ENTRANCE' || token.startsWith('ENTRANCE_');
        
        const finalProfileId = isEntranceQr ? profileId : qrRecord.dataValues.profile_id;

        // Anti-spam: Check for recent attendance in the last 2 minutes
        const lastAttendance = await AttendanceModel.findOne({
            where: { profile_id: finalProfileId },
            order: [['check_in_time', 'DESC']]
        });

        if (lastAttendance) {
            const lastTime = new Date(lastAttendance.dataValues.check_in_time).getTime();
            const now = new Date().getTime();
            const diffMinutes = (now - lastTime) / (1000 * 60);

            if (diffMinutes < 2) {
                throw new BadRequestException('Entrada ya registrada recientemente. Esperá 2 minutos.');
            }
        }

        // Chequea si tiene la cuota al día
        const profile = await this.checkProfileOverdue(finalProfileId);

        // Sumar día marcado
        await profile.increment('marked_days', { by: 1 });

        // Recargar la instancia para que el "return" tenga el valor actualizado
        await profile.reload();

        const newAttendance: Optional<NewAttendance, any> = await this.collection.create({
            id: uuid(),
            profile_id: finalProfileId,
            check_in_time: new Date(),
            method
        })

        // Borrar QR solo si es de un usuario. Los de ENTRANCE se limpian por tiempo o se dejan para multi-uso?
        // El monitor regenera el suyo cada X tiempo. Para evitar spam de un solo QR, lo borramos igual o permitimos multi-uso?
        // Si lo borramos, el monitor mostrará uno inválido hasta que se refresque.
        // Mejor: no borrar si es ENTRANCE, confiar en la expiración.
        if (!isEntranceQr) {
            await qrRecord.destroy();
        }

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

    /**
     * Monitor check-in: used by the public gym monitor screen.
     * Supports QR_SCAN (validates token, finds linked profile) or DNI lookup.
     */
    public monitorEntry = async (payload: { token?: string; dni?: string; method: 'QR_SCAN' | 'DNI' }) => {
        const { token, dni, method } = payload;
        let profile: Model | null = null;

        if (method === 'QR_SCAN') {
            if (!token) throw new BadRequestException('El token QR es requerido');

            const qrRecord = await this.qrCollection.findOne({ where: { token } });
            if (!qrRecord) throw new NotFoundException('Código QR inválido');
            if (new Date() > qrRecord.dataValues.expires_at) throw new BadRequestException('El código QR expiró');

            const profileId = qrRecord.dataValues.profile_id;
            if (!profileId) throw new BadRequestException('Este QR no tiene un perfil asociado. Regenerá el QR desde tu cuenta.');

            // Anti-spam: Check for recent attendance
            const lastAttendance = await AttendanceModel.findOne({
                where: { profile_id: profileId },
                order: [['check_in_time', 'DESC']]
            });

            if (lastAttendance) {
                const lastTime = new Date(lastAttendance.dataValues.check_in_time).getTime();
                const now = new Date().getTime();
                const diffMinutes = (now - lastTime) / (1000 * 60);

                if (diffMinutes < 2) {
                    throw new BadRequestException('Entrada ya registrada recientemente. Esperá 2 minutos.');
                }
            }

            profile = await this.profileCollection.findByPk(profileId);
            if (!profile) throw new NotFoundException('No se encontró el perfil asociado al QR');
            if (profile.dataValues.billing_state !== 'OK') throw new BadRequestException('La cuota del alumno está vencida o pendiente');

            await profile.increment('marked_days', { by: 1 });
            await profile.reload();

            await this.collection.create({
                id: uuid(),
                profile_id: profileId,
                check_in_time: new Date(),
                method
            });

            await qrRecord.destroy();

            return {
                profile: {
                    name: profile.dataValues.name,
                    lastname: profile.dataValues.lastname,
                    marked_days: profile.dataValues.marked_days
                }
            };
        }

        if (method === 'DNI') {
            if (!dni) throw new BadRequestException('El DNI es requerido');

            profile = await this.profileCollection.findOne({ where: { dni } });
            if (!profile) throw new NotFoundException('No se encontró ningún alumno con ese DNI');
            if (profile.dataValues.billing_state !== 'OK') throw new BadRequestException('La cuota del alumno está vencida o pendiente');

            // Anti-spam: Check for recent attendance
            const lastAttendance = await AttendanceModel.findOne({
                where: { profile_id: profile.dataValues.id },
                order: [['check_in_time', 'DESC']]
            });

            if (lastAttendance) {
                const lastTime = new Date(lastAttendance.dataValues.check_in_time).getTime();
                const now = new Date().getTime();
                const diffMinutes = (now - lastTime) / (1000 * 60);

                if (diffMinutes < 2) {
                    throw new BadRequestException('Entrada ya registrada recientemente. Esperá 2 minutos.');
                }
            }

            await profile.increment('marked_days', { by: 1 });
            await profile.reload();

            await this.collection.create({
                id: uuid(),
                profile_id: profile.dataValues.id,
                check_in_time: new Date(),
                method
            });

            return {
                profile: {
                    name: profile.dataValues.name,
                    lastname: profile.dataValues.lastname,
                    marked_days: profile.dataValues.marked_days
                }
            };
        }

        throw new BadRequestException('Método de check-in inválido');
    };

    public getHistory = async (profileId?: string): Promise<Model[]> => {
        const where: any = {};
        if (profileId) where.profile_id = profileId;

        const history = await this.collection.findAll({
            where,
            order: [["check_in_time", "DESC"]]
        });

        return history;
    };

}

const attendanceService = new AttendanceService();
export default attendanceService;