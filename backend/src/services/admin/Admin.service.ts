import { Model, Op, Optional } from "sequelize";
import sequelizeConfig from "../../config/sequelize.config";
import { v4 as uuid } from "uuid";
import ProfileModel from "../../models/profiles.models";
import PaymentsModel from "../../models/payments.models";
import AttendanceModel from "../../models/attendance.models";
import PlanModel from "../../models/plans.models";
import BadRequestException from "../../errors/BadRequestException";
import NotFoundException from "../../errors/NotFoundException";
import { hashPassword, comparePassword } from "../../utils/hashPassword.utils";
import jwtManagement from "../../utils/jwt.utils";
import { BaseService } from "../BaseService.service";
import emailService from "../emails/email.service";
import SettingsModel from "../../models/settings.models";

interface AdminCreateBody {
    name: string;
    lastname: string;
    email: string;
    password: string;
    rol: "admin" | "user";
    phone: string;
    dni: string;
}

interface AdminLoginBody {
    email: string;
    password: string;
}

interface AdminUpdateBody {
    name?: string;
    lastname?: string;
    phone?: string;
}

class AdminService extends BaseService<Model> {
    constructor() {
        super(ProfileModel);
    }

    public create = async (body: AdminCreateBody) => {
        const { name, lastname, email, password, phone, dni } = body;

        const adminExists = await this.collection.findOne({ where: { email } });
        if (adminExists) throw new BadRequestException("This email is registered");

        const newAdminData: any = {
            id: uuid(),
            name,
            lastname,
            email,
            password: await hashPassword(password),
            rol: "admin",
            phone,
            dni,
        };

        const newAdmin = await this.collection.create(newAdminData);

        return {
            id: newAdmin.dataValues.id,
            name,
            lastname,
            email,
            role: "admin",
            phone,
            dni,
        };
    };

    public login = async (body: AdminLoginBody) => {
        const { email, password } = body;

        const admin = await this.collection.findOne({ where: { email, rol: 'admin' } });
        if (!admin) throw new NotFoundException('Admin not found');

        const isPasswordOk = await comparePassword(admin.dataValues.password, password);
        if (!isPasswordOk) throw new BadRequestException("Incorrect password");

        const infoForToken = {
            id: admin.dataValues.id,
            name: admin.dataValues.name,
            lastname: admin.dataValues.lastname,
            email: admin.dataValues.email,
            phone: admin.dataValues.phone,
            rol: admin.dataValues.rol,
        };

        const token = await jwtManagement.generateToken(infoForToken);
        return {
            user: {
                id: admin.dataValues.id,
                credentials: {
                    name: admin.dataValues.name,
                    lastname: admin.dataValues.lastname,
                    email: admin.dataValues.email,
                    role: admin.dataValues.rol
                },
                session: "active",
            },
            access_token: token,
            token_type: "Bearer",
        };
    };

    public update = async (id: string, body: AdminUpdateBody) => {
        const admin = await this.collection.findByPk(id);
        if (!admin) throw new NotFoundException("Admin not found");

        await admin.update(body);

        const { password, dni, billing_state, expiration_day, marked_days, ...adminData } = admin.toJSON();
        return adminData;
    };

    public delete = async (id: string) => {
        const admin = await this.collection.findByPk(id);
        if (!admin) throw new NotFoundException('Admin not found');
        await admin.destroy();
        return true;
    };

    public getAdmins = async () => {
        return await this.collection.findAll({ 
            where: { rol: 'admin' },
            attributes: { exclude: ['password'] } 
        });
    };

    public getDetailedAnalytics = async () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(now.getDate() - 14);

        // 1. Attendance Heatmap Data (Last 30 days)
        const attendanceRecords = await AttendanceModel.findAll({
            where: {
                check_in_time: { [Op.gte]: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
            },
            attributes: ['check_in_time']
        });

        const heatmap: Record<string, Record<number, number>> = {};
        const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
        
        days.forEach(day => {
            heatmap[day] = {};
            for (let i = 7; i <= 22; i++) heatmap[day][i] = 0; // Gym hours 7am - 10pm
        });

        attendanceRecords.forEach((rec: any) => {
            const date = new Date(rec.check_in_time);
            const day = days[date.getDay()];
            const hour = date.getHours();
            if (heatmap[day] && heatmap[day][hour] !== undefined) {
                heatmap[day][hour]++;
            }
        });

        // 2. Retention Analysis: "At-Risk" Students
        // Active students who haven't attended in 14 days
        const activeStudents = await ProfileModel.findAll({
            where: {
                rol: 'user',
                billing_state: 'OK',
                expiration_day: { [Op.gt]: now }
            },
            attributes: ['id', 'name', 'lastname', 'email', 'phone']
        });

        const atRiskStudents = [];
        for (const student of activeStudents) {
            const lastAttendance = await AttendanceModel.findOne({
                where: { profile_id: student.dataValues.id },
                order: [['check_in_time', 'DESC']]
            });

            if (!lastAttendance || new Date(lastAttendance.dataValues.check_in_time) < fourteenDaysAgo) {
                atRiskStudents.push({
                    id: student.dataValues.id,
                    name: `${student.dataValues.name} ${student.dataValues.lastname}`,
                    email: student.dataValues.email,
                    phone: student.dataValues.phone,
                    lastSeen: lastAttendance ? lastAttendance.dataValues.check_in_time : 'Nunca'
                });
            }
        }

        // 3. Financial Metrics & Projections
        const revenueByPlan = await PaymentsModel.findAll({
            attributes: [
                'concept',
                [sequelizeConfig.fn('SUM', sequelizeConfig.col('amount')), 'total'],
                [sequelizeConfig.fn('COUNT', sequelizeConfig.col('id')), 'count']
            ],
            where: { status: 'completed', payment_date: { [Op.gte]: startOfMonth } },
            group: ['concept']
        });

        const totalActive = activeStudents.length;
        const totalRevenueResult = await PaymentsModel.sum('amount', {
            where: { status: 'completed', payment_date: { [Op.gte]: startOfMonth } }
        });
        const monthlyRevenue = Number(totalRevenueResult) || 0;
        const arpu = totalActive > 0 ? Math.round(monthlyRevenue / totalActive) : 0;
        
        // 4. Net Growth (This Month)
        const registrations = await ProfileModel.count({
            where: { rol: 'user', createdAt: { [Op.gte]: startOfMonth } }
        });
        const expirations = await ProfileModel.count({
            where: { 
                rol: 'user', 
                expiration_day: { [Op.between]: [startOfMonth, now] },
                billing_state: { [Op.ne]: 'OK' }
            }
        });

        // 5. Delinquency Analysis (Morosidad)
        const userPlanCounts = await ProfileModel.findAll({
            where: { rol: 'user' },
            attributes: ['plan_id', [sequelizeConfig.fn('COUNT', sequelizeConfig.col('id')), 'count']],
            group: ['plan_id']
        });
        const plans = await PlanModel.findAll();
        const planPriceMap = new Map<string, number>(plans.map((p: any) => [p.id, Number(p.price)]));
        
        let expectedRevenue = 0;
        userPlanCounts.forEach((upc: any) => {
            const price = planPriceMap.get(upc.get('plan_id')) || 0;
            const count = Number(upc.get('count')) || 0;
            expectedRevenue += price * count;
        });

        return {
            heatmap,
            atRiskStudents: atRiskStudents.slice(0, 10), // Limit to top 10 for dashboard
            atRiskCount: atRiskStudents.length,
            growth: {
                registrations,
                expirations,
                net: registrations - expirations
            },
            financials: {
                monthlyRevenue,
                expectedRevenue,
                debt: Math.max(0, expectedRevenue - monthlyRevenue),
                arpu,
                revenueByPlan: revenueByPlan.map((r: any) => ({
                    name: r.get('concept'),
                    value: Number(r.get('total')),
                    count: Number(r.get('count'))
                }))
            },
            retentionRate: totalActive > 0 ? Math.round(((totalActive - atRiskStudents.length) / totalActive) * 100) : 0
        };
    };
    
    public getDashboardStats = async () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(now.getDate() + 7);

        const totalRevenueResult = await PaymentsModel.sum('amount', { where: { status: 'completed' } });
        const currentTotalRevenue = Number(totalRevenueResult) || 0;

        const lastMonthRevenueResult = await PaymentsModel.sum('amount', {
            where: { 
                status: 'completed',
                payment_date: { [Op.between]: [startOfLastMonth, endOfLastMonth] }
            }
        });
        const lastMonthRevenue = Number(lastMonthRevenueResult) || 0;

        const currentMonthRevenueResult = await PaymentsModel.sum('amount', {
            where: { 
                status: 'completed',
                payment_date: { [Op.gte]: startOfMonth }
            }
        });
        const currentMonthRevenue = Number(currentMonthRevenueResult) || 0;

        const activeStudents = await ProfileModel.count({ where: { rol: 'user' } });
        const studentsLastMonth = await ProfileModel.count({
            where: { rol: 'user', createdAt: { [Op.lt]: startOfMonth } }
        });

        const pendingPayments = await ProfileModel.count({
            where: {
                rol: 'user',
                [Op.or]: [
                    { billing_state: { [Op.in]: ['pending', 'defeated'] } },
                    { expiration_day: { [Op.lt]: now } }
                ]
            }
        });

        const recentPayments = await PaymentsModel.findAll({
            limit: 5,
            order: [['payment_date', 'DESC']],
            include: [{
                model: ProfileModel,
                as: 'profile',
                attributes: ['name', 'lastname'],
                paranoid: false 
            }]
        });

        const expiringSoon = await ProfileModel.count({
            where: {
                rol: 'user',
                expiration_day: { [Op.between]: [now, sevenDaysFromNow] }
            }
        });

        const revenueChange = lastMonthRevenue > 0 
            ? Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
            : currentMonthRevenue > 0 ? 100 : 0;
        
        const studentsChange = studentsLastMonth > 0
            ? Math.round(((activeStudents - studentsLastMonth) / studentsLastMonth) * 100)
            : activeStudents > 0 ? 100 : 0;

        const recentRegistrations = await ProfileModel.findAll({
            where: { rol: 'user' },
            limit: 3,
            order: [['createdAt', 'DESC']],
            attributes: ['name', 'lastname', 'createdAt']
        });

        const logs = [
            ...recentPayments.slice(0, 3).map((p: any) => ({
                type: 'PAGO',
                message: `Pago de ${p.profile?.name} registrado.`,
                time: p.payment_date,
                color: 'text-green-500',
                bg: 'bg-green-500/5',
                border: 'border-green-500/10'
            })),
            ...recentRegistrations.map((r: any) => ({
                type: 'ACCESO',
                message: `Nuevo alumno: ${r.name} ${r.lastname}.`,
                time: r.createdAt,
                color: 'text-rose-500',
                bg: 'bg-rose-500/5',
                border: 'border-rose-500/10'
            }))
        ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 4);

        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(now.getDate() - 14);

        const activeStudentRecords = await ProfileModel.findAll({
            where: {
                rol: 'user',
                billing_state: 'OK',
                expiration_day: { [Op.gt]: now }
            },
            attributes: ['id']
        });
        const activeStudentIds = activeStudentRecords.map(s => s.get('id') as string);

        const activeWhoAttendedCount = await AttendanceModel.count({
            distinct: true,
            col: 'profile_id',
            where: {
                profile_id: activeStudentIds,
                check_in_time: { [Op.gte]: fourteenDaysAgo }
            }
        });

        const atRiskCount = activeStudentIds.length - activeWhoAttendedCount;

        return {
            totalRevenue: currentTotalRevenue,
            activeStudents,
            pendingPayments,
            expiringSoon,
            recentPayments: recentPayments.map((p: any) => ({
                id: p.id,
                studentName: `${p.profile?.name} ${p.profile?.lastname}`,
                amount: p.amount,
                concept: p.concept,
                date: p.payment_date
            })),
            logs,
            atRiskCount,
            revenueChange,
            studentsChange,
            projection: revenueChange 
        };
    };

    public sendSegmentedEmail = async (planId: string, subject: string, template: string, data: any) => {
        const users = await ProfileModel.findAll({ where: { plan_id: planId, rol: "user" } });
        const [settings] = await SettingsModel.findOrCreate({ where: { id: "1" } });

        const results = {
            success: 0,
            failed: 0,
            total: users.length
        };

        for (const user of users) {
            try {
                await emailService.sendEmail(
                    user.dataValues.email,
                    subject,
                    template,
                    { name: user.dataValues.name, ...data },
                    (settings as any).gym_sender_name,
                    (settings as any).gym_email
                );
                results.success++;
            } catch (err) {
                console.error(`Error sending segmented email to ${user.dataValues.email}:`, err);
                results.failed++;
            }
        }

        return results;
    };

    public getAtRiskCSVReport = async () => {
        const now = new Date();
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(now.getDate() - 14);

        // Fetch at-risk students (same logic as analytics)
        const activeStudents = await ProfileModel.findAll({
            where: {
                rol: 'user',
                billing_state: 'OK',
                expiration_day: { [Op.gt]: now }
            },
            attributes: ['id', 'name', 'lastname', 'email', 'phone', 'dni']
        });

        const atRiskData = [];
        for (const student of activeStudents) {
            const lastAttendance = await AttendanceModel.findOne({
                where: { profile_id: student.dataValues.id },
                order: [['check_in_time', 'DESC']]
            });

            if (!lastAttendance || new Date(lastAttendance.dataValues.check_in_time) < fourteenDaysAgo) {
                atRiskData.push({
                    dni: student.dataValues.dni,
                    nombre: student.dataValues.name,
                    apellido: student.dataValues.lastname,
                    email: student.dataValues.email,
                    telefono: student.dataValues.phone,
                    ultima_visita: lastAttendance ? lastAttendance.dataValues.check_in_time.toISOString().split('T')[0] : 'Nunca'
                });
            }
        }

        // Generate CSV string
        const header = "DNI,Nombre,Apellido,Email,Telefono,Ultima Visita\n";
        const rows = atRiskData.map(s => 
            `${s.dni},"${s.nombre}","${s.apellido}","${s.email}","${s.telefono}",${s.ultima_visita}`
        ).join("\n");

        return header + rows;
    };
}

const adminService = new AdminService();
export default adminService;
