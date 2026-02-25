import { Model, Op, Optional } from "sequelize";
import { v4 as uuid } from "uuid";
import ProfileModel from "../../models/profiles.models";
import PaymentsModel from "../../models/payments.models";
import BadRequestException from "../../errors/BadRequestException";
import NotFoundException from "../../errors/NotFoundException";
import { hashPassword, comparePassword } from "../../utils/hashPassword.utils";
import jwtManagement from "../../utils/jwt.utils";
import { BaseService } from "../BaseService.service";

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
            occupancyRate: Math.min(Math.round((activeStudents / 100) * 100), 100),
            revenueChange,
            studentsChange,
            projection: revenueChange 
        };
    };
}

const adminService = new AdminService();
export default adminService;
