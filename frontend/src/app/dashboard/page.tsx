"use client";

import { useEffect, useState } from "react";
import { LogOut, LayoutDashboard, User, Calendar, CreditCard, Dumbbell, CheckCircle2, Loader2, AlertCircle, ChevronRight, Activity } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import DashboardShell from "@/components/DashboardShell";

export default function StudentDashboardPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [routines, setRoutines] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profileRes = await api.get("/profiles/me");
                const userData = profileRes.data.data;
                setProfile(userData);

                const routinesRes = await api.get(`/routines/profile/${userData.id}`);
                setRoutines(routinesRes.data.data);
            } catch (err: any) {
                if (err.response?.status === 401) {
                    router.push("/");
                } else {
                    setError("No pudimos sincronizar tus datos. Verificá tu conexión.");
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-6 px-6 text-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                    <Dumbbell className="h-12 w-12 text-rose-600" />
                </motion.div>
                <p className="text-neutral-500 font-black tracking-[0.3em] text-[10px] uppercase animate-pulse">Sincronizando Perfil...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="h-16 w-16 text-rose-500 mb-6" />
                <h2 className="text-2xl font-black text-white mb-2 uppercase font-outfit leading-none">Sincronización Fallida</h2>
                <p className="text-neutral-500 mb-8 max-w-xs text-sm">{error}</p>
                <button onClick={() => window.location.reload()} className="btn-premium px-10 py-4">REINTENTAR</button>
            </div>
        );
    }

    const stats = [
        { label: "Días Registrados", value: profile?.marked_days || "0", icon: CheckCircle2, color: "text-green-500" },
        { label: "Vencimiento", value: profile?.expiration_day ? new Date(profile.expiration_day).toLocaleDateString() : "N/D", icon: Calendar, color: "text-rose-500" },
        { label: "Membresía", value: profile?.billing_state === "OK" ? "ACTIVA" : "PENDIENTE", icon: CreditCard, color: profile?.billing_state === "OK" ? "text-blue-500" : "text-amber-500" },
    ];

    return (
        <DashboardShell role="STUDENT" userName={profile?.name}>
            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12"
            >
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter font-outfit uppercase italic leading-[0.9]">
                        ¡Hola, <span className="text-rose-600">{profile?.name}</span>! 👋
                    </h1>
                    <p className="text-neutral-500 font-bold tracking-[0.2em] uppercase text-[9px] md:text-[10px]">Es momento de romper tus límites</p>
                </div>
                <div className="flex items-center gap-4 glass p-3 md:p-4 rounded-full border-white/5 pr-6 max-w-fit">
                    <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 border border-white/10 flex items-center justify-center font-black text-white text-xl shadow-xl shadow-rose-600/20 shrink-0 capitalize">
                        {profile?.name?.[0]}{profile?.lastname?.[0]}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs md:text-sm font-black text-white uppercase tracking-wider truncate">{profile?.name} {profile?.lastname}</p>
                        <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mt-1">Alumno Elite</p>
                    </div>
                </div>
            </motion.header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card rounded-[2.5rem] p-8 border-white/5 group hover:border-rose-500/20 transition-all duration-500"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className={cn("p-4 rounded-2xl bg-neutral-900 border border-white/5", stat.color)}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <span className="text-2xl md:text-3xl font-black font-outfit tracking-tighter">{stat.value}</span>
                        </div>
                        <p className="text-[9px] md:text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] leading-none whitespace-nowrap">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="mt-16 sm:mt-24">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-xl md:text-2xl font-black font-outfit uppercase tracking-tight flex items-center gap-4 italic leading-none">
                        <span className="h-8 w-1 bg-rose-600 rounded-full shrink-0" />
                        Tu Plan de Batalla
                    </h2>
                    <button className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-400 shrink-0">Ver historial</button>
                </div>

                <AnimatePresence mode="wait">
                    {routines.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8">
                            {routines.map((routine: any, idx: number) => (
                                <motion.div
                                    key={routine.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="glass rounded-[2rem] p-8 border-white/5 hover:bg-white/[0.02] transition-colors relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Dumbbell className="h-16 w-16" />
                                    </div>
                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div className="min-w-0 pr-4">
                                            <h3 className="text-lg md:text-xl font-black text-rose-600 uppercase italic tracking-tighter leading-none truncate">{routine.exercise}</h3>
                                            <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mt-3">Objetivo Mensual</p>
                                        </div>
                                        <div className="text-[10px] font-black px-4 py-2 bg-rose-600/10 border border-rose-600/20 rounded-xl text-rose-500 tracking-widest shrink-0">
                                            {routine.series} X {routine.reps}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8 text-[10px] relative z-10">
                                        <div className="space-y-2">
                                            <p className="text-neutral-500 font-black uppercase tracking-widest">Descanso</p>
                                            <p className="text-white font-black text-base md:text-lg font-outfit leading-none">{routine.rest_time}s</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-neutral-500 font-black uppercase tracking-widest">Carga</p>
                                            <p className="text-white font-black text-base md:text-lg font-outfit leading-none">{routine.load || '--'} KG</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card rounded-[3rem] p-12 md:p-20 border-white/5 flex flex-col items-center justify-center text-center"
                        >
                            <div className="p-8 rounded-full bg-neutral-900 border border-white/5 mb-8 shadow-2xl shadow-black ring-1 ring-white/5">
                                <Dumbbell className="h-10 w-10 md:h-16 md:w-16 text-neutral-800" />
                            </div>
                            <h3 className="text-lg md:text-2xl font-black text-white font-outfit uppercase italic tracking-tight leading-none">Sin misiones asignadas</h3>
                            <p className="text-neutral-500 max-w-sm mt-4 font-medium leading-relaxed text-sm">Aún no se te han asignado rutinas. Consultá con tu instructor.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardShell>
    );
}
