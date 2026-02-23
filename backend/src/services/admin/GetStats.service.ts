import { Model, Op } from "sequelize";
import ProfileModel from "../../models/profiles.models";
import PaymentsModel from "../../models/payments.models";
import { BaseService } from "../BaseService.service";

class GetStatsService extends BaseService<Model> {
    constructor() {
        super(ProfileModel);
    }

    public getDashboardStats = async () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(now.getDate() + 7);

        // 1. Total Revenue (all completed payments) - Using this for the main card as requested
        const totalRevenueResult = await PaymentsModel.sum('amount', {
            where: { status: 'completed' }
        });
        const currentTotalRevenue = Number(totalRevenueResult) || 0;

        // 2. Revenue from Last Month (for comparison)
        const lastMonthRevenueResult = await PaymentsModel.sum('amount', {
            where: { 
                status: 'completed',
                payment_date: { [Op.between]: [startOfLastMonth, endOfLastMonth] }
            }
        });
        const lastMonthRevenue = Number(lastMonthRevenueResult) || 0;

        // 3. Revenue from Current Month (for projection)
        const currentMonthRevenueResult = await PaymentsModel.sum('amount', {
            where: { 
                status: 'completed',
                payment_date: { [Op.gte]: startOfMonth }
            }
        });
        const currentMonthRevenue = Number(currentMonthRevenueResult) || 0;

        // 4. Active Students (rol='user')
        const activeStudents = await ProfileModel.count({
            where: { rol: 'user' }
        });

        // 5. Students created last month
        const studentsLastMonth = await ProfileModel.count({
            where: {
                rol: 'user',
                createdAt: { [Op.lt]: startOfMonth }
            }
        });

        // 6. Pending Payments (State is pending/defeated OR expiration date has passed)
        const pendingPayments = await ProfileModel.count({
            where: {
                rol: 'user',
                [Op.or]: [
                    { billing_state: { [Op.in]: ['pending', 'defeated'] } },
                    { expiration_day: { [Op.lt]: now } }
                ]
            }
        });

        // 7. Recent Payments (Top 5)
        const recentPayments = await PaymentsModel.findAll({
            limit: 5,
            order: [['payment_date', 'DESC']],
            include: [{
                model: ProfileModel,
                as: 'profile',
                attributes: ['name', 'lastname'],
                paranoid: false // Include deleted students for historical names
            }]
        });

        // 8. Expiring Soon (next 7 days)
        const expiringSoon = await ProfileModel.count({
            where: {
                rol: 'user',
                expiration_day: {
                    [Op.between]: [now, sevenDaysFromNow]
                }
            }
        });

        // 9. Growth Calculations
        const revenueChange = lastMonthRevenue > 0 
            ? Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
            : currentMonthRevenue > 0 ? 100 : 0;
        
        const studentsChange = studentsLastMonth > 0
            ? Math.round(((activeStudents - studentsLastMonth) / studentsLastMonth) * 100)
            : activeStudents > 0 ? 100 : 0;

        // 10. Projection (simplified: current month revenue vs expected based on active students)
        // Assuming an average plan of $15000
        const expectedMonthlyRevenue = activeStudents * 15000;
        const projection = expectedMonthlyRevenue > 0
            ? Math.round((currentMonthRevenue / expectedMonthlyRevenue) * 100)
            : 0;

        // 11. Recent Logs
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
            projection: revenueChange // Using growth as base or just revenueChange
        };
    };
}

const getStatsService = new GetStatsService();
export default getStatsService;
