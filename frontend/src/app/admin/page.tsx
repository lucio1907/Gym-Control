"use client";

import { useEffect, useState } from "react";
import { Dumbbell, CreditCard, Users, TrendingUp, ArrowUpRight, ArrowDownRight, Activity, Calendar, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { motion } from "framer-motion";
import DashboardShell from "@/components/DashboardShell";
import AddStudentModal from "@/components/AddStudentModal";
import ManualPaymentModal from "@/components/ManualPaymentModal";
import { supabase } from "@/lib/supabase";

export default function AdminDashboardPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modals state
    const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
    const [isManualPaymentOpen, setIsManualPaymentOpen] = useState(false);
    const [studentForPayment, setStudentForPayment] = useState<any | null>(null);

    const handleRegistrationSuccess = (newStudent?: any) => {
        fetchData();
        if (newStudent) {
            setStudentForPayment(newStudent);
            setIsManualPaymentOpen(true);
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const profileRes = await api.get("/profiles/me");
            const userRole = profileRes.data.data.rol;

            if (userRole !== "admin") {
                router.push(userRole === "teacher" ? "/teacher" : "/dashboard");
                return;
            }
            const statsRes = await api.get("/admins/stats");

            setProfile(profileRes.data.data);
            setStats(statsRes.data.data);
        } catch (err: any) {
            if (err.response?.status === 401) {
                router.push("/");
            } else {
                setError("Error crítico al cargar las métricas de administración.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Subscribe to real-time changes
        const profilesChannel = supabase
            .channel('public:profiles')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
                fetchData();
            })
            .subscribe();

        const paymentsChannel = supabase
            .channel('public:payments')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
                fetchData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(profilesChannel);
            supabase.removeChannel(paymentsChannel);
        };
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-6 px-6 text-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                    <Dumbbell className="h-12 w-12 text-rose-600" />
                </motion.div>
                <p className="text-neutral-500 font-black tracking-[0.3em] text-[10px] uppercase">Encriptando Datos Maestros...</p>
            </div>
        );
    }

    const metricCards = [
        { label: "Ingresos Mensuales", value: `$${stats?.totalRevenue.toLocaleString()}`, change: stats?.revenueChange, icon: CreditCard, color: "text-green-500" },
        { label: "Alumnos Activos", value: stats?.activeStudents, change: stats?.studentsChange, icon: Users, color: "text-rose-500" },
        { label: "Pagos Pendientes", value: stats?.pendingPayments, icon: AlertCircle, color: "text-amber-500" },
        { label: "Capacidad Global", value: `${stats?.occupancyRate}%`, icon: Activity, color: "text-blue-500" },
    ];

    return (
        <DashboardShell role="ADMIN" userName={profile?.name}>
            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter font-outfit uppercase italic leading-[1.1]">
                            Admin <span className="text-rose-600 underline underline-offset-8 decoration-white/5">Console</span>
                        </h1>
                        <p className="text-neutral-500 font-bold tracking-[0.2em] uppercase text-[9px] sm:text-[10px] flex items-center gap-3">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                            Sincronizado en Tiempo Real
                        </p>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 bg-white/[0.02] border border-white/5 p-4 rounded-3xl">
                        <div className="text-right hidden sm:block pr-6 border-r border-white/5">
                            <p className="text-[9px] font-black text-neutral-500 tracking-widest uppercase mb-1">Hoy</p>
                            <p className="text-xs font-black text-white uppercase italic">{new Date().toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                        </div>
                        <button className="btn-premium px-6 sm:px-8 text-[10px] tracking-widest py-3 shrink-0">
                            REPORTE
                        </button>
                    </div>
                </div>
            </motion.header>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
                {metricCards.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card rounded-[2rem] p-6 md:p-8 border-white/5 relative group overflow-hidden"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={cn("p-4 rounded-2xl bg-neutral-900 border border-white/5", card.color)}>
                                <card.icon className="h-5 w-5 md:h-6 md:w-6" />
                            </div>
                            {card.change !== undefined && (
                                <div className={cn(
                                    "flex items-center gap-1 text-[9px] md:text-[10px] font-black px-3 py-1.5 rounded-full",
                                    card.change > 0 ? "bg-green-500/10 text-green-500" : "bg-rose-500/10 text-rose-500"
                                )}>
                                    {card.change > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                    {Math.abs(card.change)}%
                                </div>
                            )}
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl md:text-3xl font-black font-outfit tracking-tighter leading-none">{card.value}</p>
                            <p className="text-[9px] md:text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] mt-3 whitespace-nowrap">{card.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 items-start">
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <h2 className="text-xl md:text-2xl font-black font-outfit uppercase tracking-tight flex items-center gap-4 italic mb-8">
                            <span className="h-8 w-1 bg-rose-600 rounded-full shrink-0" />
                            Operaciones
                        </h2>
                        <div className="grid grid-cols-1 min-[450px]:grid-cols-2 gap-6 font-outfit uppercase">
                            <button
                                onClick={() => setIsAddStudentOpen(true)}
                                className="glass rounded-[2rem] p-6 md:p-8 border-white/5 hover:border-rose-500/30 transition-all group text-left"
                            >
                                <Users className="h-8 w-8 text-rose-600 mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="text-base md:text-lg font-black tracking-tight mb-2 leading-none">Nuevo Ingreso</h3>
                                <p className="text-neutral-500 text-[9px] font-bold tracking-[0.2em] leading-relaxed">Registrar un nuevo alumno en la base</p>
                            </button>
                            <button
                                onClick={() => setIsManualPaymentOpen(true)}
                                className="glass rounded-[2rem] p-6 md:p-8 border-white/5 hover:border-green-500/30 transition-all group text-left"
                            >
                                <CreditCard className="h-8 w-8 text-green-500 mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="text-base md:text-lg font-black tracking-tight mb-2 leading-none">Cobro Manual</h3>
                                <p className="text-neutral-500 text-[9px] font-bold tracking-[0.2em] leading-relaxed">Registrar pago fuera de término</p>
                            </button>
                        </div>
                    </section>

                    <section className="glass-card rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 border-white/5">
                        <div className="flex items-center justify-between mb-10 text-white">
                            <h3 className="text-lg md:text-xl font-black font-outfit uppercase tracking-tighter italic leading-none">Ingresos Recientes</h3>
                            <Link href="/admin/payments" className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-400">Ver todos</Link>
                        </div>
                        <div className="space-y-4">
                            {stats?.recentPayments?.length > 0 ? (
                                stats.recentPayments.map((payment: any, i: number) => (
                                    <div key={payment.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/[0.02] transition-all border border-transparent hover:border-white/5 group">
                                        <div className="flex items-center gap-3 md:gap-4 min-w-0">
                                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-neutral-900 border border-white/5 flex items-center justify-center font-black text-[10px] text-neutral-400 shrink-0 capitalize italic">
                                                {payment.studentName.split(' ')[0][0]}{payment.studentName.split(' ').slice(-1)[0][0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs md:text-sm font-black uppercase tracking-tight truncate">{payment.studentName}</p>
                                                <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest truncate mt-1">{payment.concept}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 pl-4">
                                            <p className="text-xs md:text-sm font-black text-green-500">+${payment.amount.toLocaleString()}</p>
                                            <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest mt-1">
                                                {new Date(payment.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-neutral-600 font-bold uppercase tracking-[0.2em] text-[10px] py-12 italic border border-dashed border-white/5 rounded-3xl">Sin ingresos registrados</p>
                            )}
                        </div>
                    </section>
                </div>

                <div className="space-y-12">
                    <section>
                        <h2 className="text-xl md:text-2xl font-black font-outfit uppercase tracking-tight flex items-center gap-4 italic text-white mb-8">
                            Alertas Hub
                        </h2>
                        <div className="glass rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border-white/5 space-y-8">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Alumnos por Vencer</span>
                                    <span className="text-[10px] font-black text-rose-500 underline underline-offset-4 decoration-rose-500/30">{stats?.expiringSoon || 0} ESTA SEMANA</span>
                                </div>
                                <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden border border-white/5 p-0.5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(((stats?.expiringSoon || 0) / (stats?.activeStudents || 1)) * 100, 100)}%` }}
                                        className="h-full bg-rose-600 rounded-full"
                                    />
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/5 space-y-6">
                                <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest text-center italic">Logs de actividad</p>
                                <div className="space-y-3">
                                    {stats?.logs?.length > 0 ? (
                                        stats.logs.map((log: any, i: number) => (
                                            <div key={i} className={cn("p-4 rounded-xl md:rounded-2xl border transition-all hover:scale-[1.02]", log.bg, log.border)}>
                                                <p className={cn("text-[9px] font-black uppercase tracking-widest mb-1", log.color)}>{log.type}</p>
                                                <p className="text-[10px] font-medium text-white/60 leading-tight italic tracking-tight">{log.message}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-[9px] text-neutral-700 text-center uppercase tracking-widest py-4">Sin actividad reciente</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="glass-card rounded-[2rem] md:rounded-[2.5rem] p-8 border-white/5 text-center relative overflow-hidden group">
                        <TrendingUp className="h-10 w-10 text-rose-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="text-lg font-black font-outfit uppercase italic tracking-tighter shrink-0">Cobro Mensual</h3>
                        <p className="text-3xl font-black text-white mt-1 font-outfit">{stats?.projection || 0}%</p>
                        <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mt-2 leading-tight">Progreso vs recaudación bruta esperada</p>
                    </div>
                </div>
            </div>

            <AddStudentModal
                isOpen={isAddStudentOpen}
                onClose={() => setIsAddStudentOpen(false)}
                onSuccess={handleRegistrationSuccess}
            />

            <ManualPaymentModal
                isOpen={isManualPaymentOpen}
                onClose={() => {
                    setIsManualPaymentOpen(false);
                    setStudentForPayment(null);
                }}
                onSuccess={fetchData}
                initialStudent={studentForPayment}
            />
        </DashboardShell>
    );
}
