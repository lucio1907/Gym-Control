"use client";

import { useEffect, useState, useMemo } from "react";
import DashboardShell from "@/components/DashboardShell";
import api from "@/lib/api";
import { Loader2, Flame, CalendarDays, Dumbbell, Target, CheckCircle2, AlertTriangle, Clock, TrendingUp, QrCode, UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import { format, parseISO, subDays, differenceInDays, isSameDay, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AttendanceRecord {
    id: string;
    check_in_time: string;
    method: "MANUAL" | "QR_SCAN";
}

interface PaymentRecord {
    id: string;
    amount: number;
    payment_date: string;
    concept: string;
    status: "completed" | string;
}

// ─── Stat Card Component ───────────────────────────────────────────────────────
function StatCard({
    label,
    value,
    sub,
    icon: Icon,
    delay = 0,
    accent = false,
}: {
    label: string;
    value: string | number;
    sub?: string;
    icon: React.ElementType;
    delay?: number;
    accent?: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={cn(
                "glass-card rounded-[2.5rem] p-8 border-white/5 relative overflow-hidden group",
                accent && "border-rose-500/20 bg-rose-500/[0.03]"
            )}
        >
            <div className="absolute top-0 right-0 p-8 opacity-[0.07] group-hover:opacity-[0.15] transition-opacity pointer-events-none">
                <Icon className="h-24 w-24" />
            </div>
            <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-4">{label}</p>
                <h3 className={cn("text-5xl font-black font-outfit tracking-tighter mb-2", accent && "text-rose-500")}>
                    {value}
                </h3>
                {sub && <p className="text-xs text-neutral-400 font-medium">{sub}</p>}
            </div>
        </motion.div>
    );
}

// ─── Activity Heatmap (last 7 weeks × 7 days) ─────────────────────────────────
function ActivityHeatmap({ records }: { records: AttendanceRecord[] }) {
    const days = useMemo(() => {
        const today = startOfDay(new Date());
        return Array.from({ length: 49 }, (_, i) => subDays(today, 48 - i));
    }, []);

    const attendedSet = useMemo(
        () => new Set(records.map((r) => startOfDay(parseISO(r.check_in_time)).getTime())),
        [records]
    );

    const weekRows = useMemo(() => {
        const rows: Date[][] = [];
        for (let i = 0; i < 7; i++) {
            rows.push(days.filter((_, idx) => idx % 7 === i));
        }
        return rows;
    }, [days]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-[2.5rem] lg:rounded-[3rem] p-8 lg:p-12 border-white/5"
        >
            <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
                <div>
                    <h2 className="text-2xl font-black font-outfit uppercase tracking-tighter italic mb-1">
                        Actividad Reciente
                    </h2>
                    <p className="text-xs text-neutral-500 font-medium">Últimas 7 semanas de asistencia</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                    <span>Menos</span>
                    <div className="flex gap-1.5">
                        {["bg-white/5", "bg-rose-900/40", "bg-rose-700/60", "bg-rose-500"].map((c, i) => (
                            <div key={i} className={cn("h-4 w-4 rounded-md", c)} />
                        ))}
                    </div>
                    <span>Más</span>
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {weekRows.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-2">
                        {week.map((day, di) => {
                            const attended = attendedSet.has(day.getTime());
                            const isToday = isSameDay(day, new Date());
                            return (
                                <div
                                    key={di}
                                    title={`${format(day, "dd MMM yyyy", { locale: es })}${attended ? " · Asististe" : ""}`}
                                    className={cn(
                                        "h-8 w-8 rounded-lg transition-all cursor-default border",
                                        attended
                                            ? "bg-rose-500 border-rose-400/40 shadow-lg shadow-rose-500/20"
                                            : "bg-white/5 border-white/5 hover:bg-white/10",
                                        isToday && !attended && "border-rose-500/40"
                                    )}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProgressPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [attRes, payRes, profRes] = await Promise.all([
                    api.get("/attendance/history"),
                    api.get("/payments/history"),
                    api.get("/profiles/me"),
                ]);
                setAttendance(attRes.data.data || []);
                setPayments(payRes.data.data || []);
                setProfile(profRes.data.data || null);
            } catch (err) {
                console.error("Error loading progress data", err);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    // ── Derived stats ──────────────────────────────────────────────────────────
    const totalVisits = attendance.length;

    const visitsThisMonth = useMemo(() => {
        const now = new Date();
        return attendance.filter((r) => {
            const d = parseISO(r.check_in_time);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;
    }, [attendance]);

    const visitsThisWeek = useMemo(() => {
        const cutoff = subDays(new Date(), 7);
        return attendance.filter((r) => parseISO(r.check_in_time) >= cutoff).length;
    }, [attendance]);

    const currentStreak = useMemo(() => {
        if (!attendance.length) return 0;
        const sorted = [...attendance]
            .map((r) => startOfDay(parseISO(r.check_in_time)).getTime())
            .filter((v, i, a) => a.indexOf(v) === i)
            .sort((a, b) => b - a);

        let streak = 0;
        let expected = startOfDay(new Date()).getTime();
        for (const ts of sorted) {
            if (ts === expected) {
                streak++;
                expected = subDays(new Date(expected), 1).getTime();
            } else if (ts < expected) {
                break;
            }
        }
        return streak;
    }, [attendance]);

    const expirationInfo = useMemo(() => {
        if (!profile?.expiration_day) return null;
        const exp = new Date(profile.expiration_day);
        const diff = differenceInDays(exp, new Date());
        return { date: exp, daysLeft: diff };
    }, [profile]);

    const recentAttendance = useMemo(
        () =>
            [...attendance]
                .sort((a, b) => new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime())
                .slice(0, 8),
        [attendance]
    );

    const recentPayments = useMemo(
        () =>
            [...payments]
                .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
                .slice(0, 5),
        [payments]
    );

    if (isLoading) {
        return (
            <DashboardShell role="STUDENT">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-12 w-12 text-rose-600 animate-spin" />
                </div>
            </DashboardShell>
        );
    }

    return (
        <DashboardShell role="STUDENT">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 lg:mb-16 mt-4 lg:mt-8"
            >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter font-outfit uppercase italic leading-[0.9]">
                    Mi <span className="text-rose-600">Progreso</span>
                </h1>
                <p className="text-neutral-500 font-bold tracking-[0.2em] uppercase text-[10px] mt-3 lg:mt-5">
                    Historial de asistencias, pagos y estadísticas
                </p>
            </motion.header>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
                <StatCard label="Visitas Totales" value={totalVisits} sub="Desde el primer día" icon={Dumbbell} delay={0} />
                <StatCard label="Este Mes" value={visitsThisMonth} sub="Días entrenados" icon={CalendarDays} delay={0.05} />
                <StatCard label="Esta Semana" value={visitsThisWeek} sub="Últimos 7 días" icon={TrendingUp} delay={0.1} />
                <StatCard label="Racha Actual" value={`${currentStreak}d`} sub={currentStreak > 0 ? "¡Seguí así! 🔥" : "Empezá hoy"} icon={Flame} delay={0.15} accent />
            </div>

            {/* Heatmap */}
            <div className="mb-10">
                <ActivityHeatmap records={attendance} />
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">

                {/* Recent Attendance Log */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="col-span-1 lg:col-span-5 glass-card rounded-[2.5rem] p-8 border-white/5 flex flex-col"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                            <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black font-outfit uppercase tracking-tighter italic">Últimas Visitas</h3>
                            <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-widest mt-0.5">Registro de check-ins</p>
                        </div>
                    </div>

                    {recentAttendance.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                            <div className="h-16 w-16 rounded-3xl bg-white/5 flex items-center justify-center mb-4">
                                <Dumbbell className="h-7 w-7 text-neutral-500" />
                            </div>
                            <p className="text-sm font-black uppercase italic text-neutral-500">Sin visitas registradas</p>
                            <p className="text-xs text-neutral-600 mt-1">¡Vení al gym y empezá tu historial!</p>
                        </div>
                    ) : (
                        <ul className="space-y-3 flex-1">
                            {recentAttendance.map((rec, i) => (
                                <motion.li
                                    key={rec.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.28 + i * 0.04 }}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors"
                                >
                                    <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                                        {rec.method === "QR_SCAN" ? (
                                            <QrCode className="h-4 w-4 text-rose-400" />
                                        ) : (
                                            <UserCheck className="h-4 w-4 text-rose-400" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold text-white">
                                            {format(parseISO(rec.check_in_time), "EEEE, dd MMM", { locale: es })}
                                        </p>
                                        <p className="text-xs text-neutral-500 font-medium capitalize">
                                            {format(parseISO(rec.check_in_time), "HH:mm")} hs · {rec.method === "QR_SCAN" ? "Código QR" : "Manual"}
                                        </p>
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-full shrink-0">
                                        +1
                                    </span>
                                </motion.li>
                            ))}
                        </ul>
                    )}
                </motion.div>

                {/* Right Column: Membership + Payments */}
                <div className="col-span-1 lg:col-span-7 flex flex-col gap-8">

                    {/* Membership Status */}
                    {expirationInfo && (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className={cn(
                                "glass-card rounded-[2.5rem] p-8 border relative overflow-hidden",
                                expirationInfo.daysLeft <= 0
                                    ? "border-rose-500/30 bg-rose-500/[0.04]"
                                    : expirationInfo.daysLeft <= 5
                                        ? "border-amber-500/30 bg-amber-500/[0.04]"
                                        : "border-emerald-500/30 bg-emerald-500/[0.03]"
                            )}
                        >
                            <div className="flex items-center gap-5">
                                <div className={cn(
                                    "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0",
                                    expirationInfo.daysLeft <= 0 ? "bg-rose-500/20" : expirationInfo.daysLeft <= 5 ? "bg-amber-500/20" : "bg-emerald-500/20"
                                )}>
                                    <Target className={cn(
                                        "h-6 w-6",
                                        expirationInfo.daysLeft <= 0 ? "text-rose-500" : expirationInfo.daysLeft <= 5 ? "text-amber-400" : "text-emerald-400"
                                    )} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">Estado de Membresía</p>
                                    <p className="text-lg font-black font-outfit uppercase tracking-tighter">
                                        {expirationInfo.daysLeft <= 0
                                            ? "⚠️ Cuota Vencida"
                                            : expirationInfo.daysLeft <= 5
                                                ? `Vence en ${expirationInfo.daysLeft} días`
                                                : "✅ Activo"}
                                    </p>
                                    <p className="text-xs text-neutral-500 font-medium mt-1">
                                        Vencimiento: {format(expirationInfo.date, "dd 'de' MMMM 'de' yyyy", { locale: es })}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Payment History */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="glass-card rounded-[2.5rem] p-8 border-white/5 flex-1 flex flex-col"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black font-outfit uppercase tracking-tighter italic">Historial de Pagos</h3>
                                <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-widest mt-0.5">Últimas transacciones</p>
                            </div>
                        </div>

                        {recentPayments.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                                <p className="text-sm font-black uppercase italic text-neutral-500">Sin pagos registrados</p>
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {recentPayments.map((pay, i) => (
                                    <motion.li
                                        key={pay.id}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.38 + i * 0.04 }}
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors"
                                    >
                                        <div className={cn(
                                            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                                            pay.status === "completed" ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-amber-500/10 border border-amber-500/20"
                                        )}>
                                            {pay.status === "completed"
                                                ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                                : <AlertTriangle className="h-4 w-4 text-amber-400" />
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-white capitalize truncate">{pay.concept}</p>
                                            <p className="text-xs text-neutral-500 font-medium">
                                                {format(new Date(pay.payment_date), "dd MMM yyyy", { locale: es })}
                                            </p>
                                        </div>
                                        <p className="text-base font-black font-outfit text-rose-500 shrink-0">
                                            {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(Number(pay.amount))}
                                        </p>
                                    </motion.li>
                                ))}
                            </ul>
                        )}
                    </motion.div>

                </div>
            </div>
        </DashboardShell>
    );
}
