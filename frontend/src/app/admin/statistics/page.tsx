"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import DashboardShell from "@/components/DashboardShell";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend, Cell as ReCell, YAxis as ReYAxis
} from "recharts";
import {
    BarChart3, Users, Zap, AlertTriangle, TrendingUp, Calendar,
    Clock, DollarSign, ArrowUpRight, ArrowDownRight, UserMinus, Download
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const COLORS = ["#f43f5e", "#fb7185", "#fda4af", "#fecdd3", "#fff1f2"];

interface AnalyticsData {
    heatmap: Record<string, Record<number, number>>;
    atRiskStudents: any[];
    atRiskCount: number;
    growth: {
        registrations: number;
        expirations: number;
        net: number;
    };
    financials: {
        monthlyRevenue: number;
        expectedRevenue: number;
        debt: number;
        arpu: number;
        revenueByPlan: any[];
    };
    retentionRate: number;
}

const CustomAttendanceTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const hours = Object.entries(data)
            .filter(([k, v]) => !['day', 'manana', 'tarde', 'noche'].includes(k) && (v as number) > 0)
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]));

        const total = (data.manana || 0) + (data.tarde || 0) + (data.noche || 0);

        return (
            <div className="glass p-5 rounded-2xl border border-white/5 bg-black/95 shadow-2xl space-y-3 min-w-[200px]">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest italic">{label}</p>
                    <span className="text-[10px] font-black text-rose-500">{total} Alumnos</span>
                </div>
                {hours.length > 0 ? (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        {hours.map(([h, v]) => (
                            <div key={h} className="flex justify-between items-center group">
                                <span className="text-[9px] font-bold text-neutral-500 uppercase group-hover:text-neutral-300 transition-colors">{h}:00 hs</span>
                                <div className="flex items-center gap-2">
                                    <div className="h-1 w-8 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-rose-500" style={{ width: `${Math.min((Number(v) / 10) * 100, 100)}%` }} />
                                    </div>
                                    <span className="text-[10px] font-black text-white">{Number(v)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-[9px] font-bold text-neutral-600 italic uppercase">Sin registros de actividad</p>
                )}
                <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-tight pt-1">Flujo por hora detectado</p>
            </div>
        );
    }
    return null;
};

export default function StatisticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAnalytics = useCallback(async () => {
        try {
            const res = await api.get("/admins/analytics");
            setData(res.data.data);
        } catch (err) {
            console.error("Error fetching analytics:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleDownloadReport = async () => {
        try {
            const response = await api.get("/admins/reports/at-risk", {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const date = new Date().toISOString().split('T')[0];
            link.setAttribute('download', `alumnos_en_riesgo_${date}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Error downloading report:", err);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    // Format heatmap data for BarChart
    const heatmapData = useMemo(() => {
        if (!data?.heatmap) return [];
        const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
        return days.map(day => {
            const raw = data.heatmap[day] || {};
            const hours = Object.entries(raw);

            const manana = hours.filter(([h]) => parseInt(h) < 12).reduce((acc, [, v]) => acc + (v as number), 0);
            const tarde = hours.filter(([h]) => parseInt(h) >= 12 && parseInt(h) < 17).reduce((acc, [, v]) => acc + (v as number), 0);
            const noche = hours.filter(([h]) => parseInt(h) >= 17).reduce((acc, [, v]) => acc + (v as number), 0);

            return {
                day,
                manana,
                tarde,
                noche,
                ...raw
            };
        });
    }, [data]);

    // Peak hours calculation
    const peakHours = useMemo(() => {
        if (!data?.heatmap) return null;
        let max = 0;
        let peakDay = "";
        let peakHour = 0;

        Object.entries(data.heatmap).forEach(([day, hours]) => {
            Object.entries(hours).forEach(([hour, count]) => {
                if (count > max) {
                    max = count;
                    peakDay = day;
                    peakHour = parseInt(hour);
                }
            });
        });

        return { day: peakDay, hour: peakHour, count: max };
    }, [data]);

    if (isLoading) {
        return (
            <DashboardShell role="ADMIN">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 border-4 border-rose-600/20 border-t-rose-600 rounded-full animate-spin" />
                        <p className="text-neutral-500 font-bold animate-pulse uppercase tracking-widest text-xs">Analizando datos...</p>
                    </div>
                </div>
            </DashboardShell>
        );
    }

    return (
        <DashboardShell role="ADMIN">
            <div className="space-y-10 max-w-full overflow-x-hidden">
                {/* Header */}
                <header>
                    <h1 className="text-4xl font-black tracking-tightest uppercase italic flex items-center gap-4">
                        <BarChart3 className="h-10 w-10 text-rose-600" />
                        Estadísticas <span className="text-rose-600">de Negocio</span>
                    </h1>
                    <p className="text-neutral-400 font-medium mt-2 max-w-2xl italic">
                        Análisis profundo de rendimiento, retención y flujos de caja para la toma de decisiones estratégicas.
                    </p>
                </header>

                {/* Primary KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPICard
                        title="Tasa de Retención"
                        value={`${data?.retentionRate}%`}
                        icon={Zap}
                        color="text-emerald-500"
                        description="Alumnos con asistencia regular"
                    />
                    <KPICard
                        title="En Riesgo"
                        value={data?.atRiskCount || 0}
                        icon={AlertTriangle}
                        color="text-rose-500"
                        description="No asisten hace +14 días"
                    />
                    <KPICard
                        title="Ingreso por Alumno"
                        value={`$${data?.financials.arpu.toLocaleString()}`}
                        icon={DollarSign}
                        color="text-sky-500"
                        description="Ticket promedio (ARPU)"
                    />
                    <KPICard
                        title="Ingresos del Mes"
                        value={`$${data?.financials.monthlyRevenue.toLocaleString()}`}
                        icon={TrendingUp}
                        color="text-rose-500"
                        description="Caja acumulada (Bruto)"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Net Growth Chart */}
                    <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black uppercase italic flex items-center gap-3">
                                <Users className="h-6 w-6 text-rose-600" />
                                Crecimiento Neto
                            </h3>
                            <div className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                                (data?.growth.net || 0) >= 0 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                            )}>
                                {(data?.growth.net || 0) >= 0 ? "+" : ""}{data?.growth.net} este mes
                            </div>
                        </div>

                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { name: 'Altas', value: data?.growth.registrations || 0, fill: '#10b981' },
                                    { name: 'Bajas', value: data?.growth.expirations || 0, fill: '#f43f5e' }
                                ]}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10, fontWeight: 900 }} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: '#0b0b0b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem' }}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                            <div>
                                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Altas</p>
                                <p className="text-xl font-black text-emerald-500">+{data?.growth.registrations}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Bajas</p>
                                <p className="text-xl font-black text-rose-500">-{data?.growth.expirations}</p>
                            </div>
                        </div>
                    </div>

                    {/* Cash Flow / Delinquency */}
                    <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                        <h3 className="text-xl font-black uppercase italic flex items-center gap-3">
                            <DollarSign className="h-6 w-6 text-rose-600" />
                            Estado de Cobranza
                        </h3>

                        <div className="space-y-6">
                            <div className="relative pt-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Progreso de Recaudación</span>
                                    <span className="text-[10px] font-black text-white italic">
                                        {Math.round(((data?.financials.monthlyRevenue || 0) / (data?.financials.expectedRevenue || 1)) * 100)}%
                                    </span>
                                </div>
                                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(((data?.financials.monthlyRevenue || 0) / (data?.financials.expectedRevenue || 1)) * 100, 100)}%` }}
                                        className="h-full bg-gradient-to-r from-emerald-500 to-rose-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                    <div className="flex items-center gap-3">
                                        <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Cobrado</span>
                                    </div>
                                    <span className="text-sm font-black text-white">${data?.financials.monthlyRevenue.toLocaleString()}</span>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                                    <div className="flex items-center gap-3">
                                        <ArrowDownRight className="h-4 w-4 text-rose-500" />
                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Pendiente / Mora</span>
                                    </div>
                                    <span className="text-sm font-black text-white">${data?.financials.debt.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest text-center">Recaudación Total Esperada</p>
                                <p className="text-center text-xl font-black mt-1 italic text-white">${data?.financials.expectedRevenue.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Revenue by Plan Pie Chart */}
                    <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                        <h3 className="text-xl font-black uppercase italic flex items-center gap-3">
                            <DollarSign className="h-6 w-6 text-rose-600" />
                            Distribución de Planes
                        </h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={data?.financials.revenueByPlan}
                                    layout="vertical"
                                    margin={{ left: 20, right: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#666', fontSize: 10, fontWeight: 900 }}
                                        width={100}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0b0b0b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem' }}
                                        itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                                        cursor={{ fill: 'transparent' }}
                                        formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Ingresos']}
                                    />
                                    <Bar dataKey="value" name="Ingresos" radius={[0, 4, 4, 0]}>
                                        {data?.financials.revenueByPlan.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-3 pt-2">
                            {data?.financials.revenueByPlan.map((plan, idx) => (
                                <div key={idx} className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                        <span className="text-neutral-400 italic truncate max-w-[120px]">{plan.name}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-neutral-500">{plan.count} alumnos</span>
                                        <span className="text-white">${plan.value.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Attendance Heatmap Chart - Full Width Bottom Row */}
                <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black uppercase italic flex items-center gap-3">
                            <Clock className="h-6 w-6 text-rose-600" />
                            Mapa de Calor de Asistencia
                        </h3>
                        <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                            Últimos 30 días
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={heatmapData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12, fontWeight: 900 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12, fontWeight: 900 }} />
                                <Tooltip content={<CustomAttendanceTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />

                                <Bar dataKey="manana" name="Mañana" stackId="attendance" fill="#fda4af" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="tarde" name="Tarde" stackId="attendance" fill="#f43f5e" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="noche" name="Noche" stackId="attendance" fill="#9f1239" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Semantic Legend / Guide */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="h-3 w-3 rounded-full bg-[#fda4af]" />
                            <div>
                                <p className="text-[9px] font-black uppercase text-neutral-500 leading-none tracking-wider">Turno Mañana</p>
                                <p className="text-[8px] font-bold text-neutral-600 mt-1 uppercase tracking-tightest">07:00 hs - 11:00 hs</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-3 w-3 rounded-full bg-[#f43f5e]" />
                            <div>
                                <p className="text-[9px] font-black uppercase text-neutral-500 leading-none tracking-wider">Turno Tarde</p>
                                <p className="text-[8px] font-bold text-neutral-600 mt-1 uppercase tracking-tightest">12:00 hs - 16:00 hs</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-3 w-3 rounded-full bg-[#9f1239]" />
                            <div>
                                <p className="text-[9px] font-black uppercase text-neutral-500 leading-none tracking-wider">Turno Noche</p>
                                <p className="text-[8px] font-bold text-neutral-600 mt-1 uppercase tracking-tightest">17:00 hs - 22:00 hs</p>
                            </div>
                        </div>
                    </div>

                    {peakHours && (
                        <div className="p-4 rounded-3xl bg-rose-600/5 border border-rose-600/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-rose-600/20 flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-rose-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-neutral-500 leading-none">Punto Máximo</p>
                                    <p className="text-sm font-black italic mt-1">{peakHours.day} a las {peakHours.hour}:00hs</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-black text-rose-600 leading-none">{peakHours.count}</p>
                                <p className="text-[10px] font-black uppercase text-neutral-500">Asistencias</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* At-Risk Students List - Performance Optimized */}
                <div
                    className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-8"
                    style={{ contentVisibility: 'auto', containIntrinsicSize: '0 400px' } as any}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black uppercase italic flex items-center gap-3">
                                <UserMinus className="h-6 w-6 text-rose-600" />
                                Alumnos de Baja Actividad
                            </h3>
                            <p className="text-xs text-neutral-500 font-bold mt-1 uppercase tracking-wider">Top 10 alumnos con riesgo de abandono detectados por el sistema</p>
                        </div>
                        <button
                            onClick={handleDownloadReport}
                            className="px-5 py-2 rounded-2xl bg-rose-600/10 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all border border-rose-600/20 flex items-center gap-2"
                        >
                            Descargar Reporte <Download className="h-3 w-3" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {data?.atRiskStudents.map((student, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={student.id}
                                className="p-5 rounded-3xl bg-white/5 border border-white/5 group hover:border-rose-500/30 transition-all flex flex-col gap-3"
                            >
                                <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-rose-600/10 transition-colors">
                                    <Users className="h-5 w-5 text-neutral-500 group-hover:text-rose-500 transition-colors" />
                                </div>
                                <div>
                                    <p className="text-xs font-black italic text-white truncate">{student.name}</p>
                                    <p className="text-[9px] font-medium text-neutral-500 mt-1">{student.phone}</p>
                                </div>
                                <div className="mt-auto pt-3 border-t border-white/5">
                                    <p className="text-[8px] font-black uppercase text-rose-500">Última Asistencia</p>
                                    <p className="text-[10px] font-bold text-neutral-400 mt-0.5 whitespace-nowrap">
                                        {student.lastSeen === 'Nunca' ? 'Sin registros' : new Date(student.lastSeen).toLocaleDateString()}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardShell >
    );
}

function KPICard({ title, value, icon: Icon, color, description }: any) {
    return (
        <div className="glass p-6 rounded-3xl border border-white/5 space-y-4 hover:border-white/10 transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 rotate-12 group-hover:scale-[2] transition-transform">
                <Icon className={cn("h-16 w-16", color)} />
            </div>
            <div className="flex items-center justify-between relative z-10">
                <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center bg-current/10", color)}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            <div className="relative z-10">
                <p className="text-4xl font-black italic tracking-tighter">{value}</p>
                <p className="text-[10px] font-black text-neutral-200 uppercase tracking-widest mt-1 italic">{title}</p>
                <p className="text-[9px] font-bold text-neutral-600 mt-2 uppercase tracking-wider">{description}</p>
            </div>
        </div>
    );
}
