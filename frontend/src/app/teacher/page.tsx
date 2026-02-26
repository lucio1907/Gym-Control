"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Dumbbell, Users, Activity, Loader2, AlertCircle, ArrowUpRight, Search, UserPlus, CheckCircle2, QrCode, CalendarClock, TrendingUp, ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import DashboardShell from "@/components/DashboardShell";
import FeedbackModal, { FeedbackType } from "@/components/FeedbackModal";

export default function TeacherDashboardPage() {
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeRoutines: 0,
        studentsWithoutRoutine: 0,
        recentAttendance: 0,
        updatedRoutines: 0,
        healthPercentage: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isClaiming, setIsClaiming] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [feedback, setFeedback] = useState<{
        isOpen: boolean;
        type: FeedbackType;
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: "success",
        title: "",
        message: ""
    });

    const router = useRouter();

    const showFeedback = useCallback((type: FeedbackType, title: string, message: string) => {
        setFeedback({ isOpen: true, type, title, message });
    }, []);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const meRes = await api.get("/profiles/me");
            setUser(meRes.data.data);

            const statsRes = await api.get("/profiles/teacher-stats");
            const teacherStats = statsRes.data.data;

            setStats({
                totalStudents: teacherStats.totalStudents,
                activeRoutines: teacherStats.updatedRoutines,
                studentsWithoutRoutine: teacherStats.studentsWithoutRoutine,
                recentAttendance: teacherStats.recentAttendance,
                updatedRoutines: teacherStats.updatedRoutines,
                healthPercentage: teacherStats.healthPercentage
            });
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim().length < 2) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const res = await api.get(`/profiles/search-students?query=${searchQuery}`);
                setSearchResults(res.data.data || []);
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleClaimStudent = async (studentId: string) => {
        setIsClaiming(true);
        try {
            // We can claim by DNI/Email or we can update the service to handle ID
            // Let's use the ID by finding the student in searchResults
            const student = searchResults.find(s => s.id === studentId);
            if (!student) return;

            await api.put("/profiles/claim-student", { identifier: student.dni || student.email });
            showFeedback("success", "Alumno Vinculado", `${student.name} ha sido asignado a tu cargo.`);
            setSearchQuery("");
            setSearchResults([]);
            fetchData();
        } catch (err: any) {
            showFeedback("error", "Error de Vinculación", err.response?.data?.message || "No se pudo vincular al alumno.");
        } finally {
            setIsClaiming(false);
        }
    };

    if (isLoading) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <Loader2 className="animate-spin text-rose-600 h-10 w-10" />
        </div>
    );

    return (
        <DashboardShell role="TEACHER" userName={user?.name}>
            <header className="mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-8"
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-rose-600/10 border border-rose-600/20 rounded-full text-[9px] font-black text-rose-500 uppercase tracking-widest">
                                Staff / Personal Trainer
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black font-outfit uppercase italic tracking-tighter leading-[0.85]">
                            Hola, <span className="text-rose-600">{user?.name}</span>
                        </h1>
                        <p className="text-neutral-500 font-bold uppercase tracking-[0.3em] text-[10px] ml-1">
                            Tu centro de control y seguimiento de alumnos
                        </p>
                    </div>
                </motion.div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <StatCard
                    title="Alumnos a Cargo"
                    value={stats.totalStudents}
                    icon={Users}
                    trend="Alumnos asignados"
                    description="Total de perfiles vinculados"
                    color="rose"
                    href="/teacher/students"
                />
                <StatCard
                    title="Jornadas Registradas"
                    value={Math.floor(user?.marked_days || 0)}
                    icon={Activity}
                    trend="Asistencia Staff"
                    description="Días marcados en el monitor"
                    color="rose"
                />

                {/* Claim Student Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card rounded-[2.5rem] p-8 border-white/5 bg-white/[0.02] flex flex-col justify-between relative overflow-visible"
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Vincular Alumno</p>
                            <UserPlus className="h-5 w-5 text-rose-500" />
                        </div>
                        <p className="text-[11px] font-bold text-neutral-400 uppercase leading-relaxed pr-8">
                            Buscá por nombre o DNI para vincularlo.
                        </p>
                    </div>

                    <div className="mt-6 relative z-50">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="..."
                                className="input-premium py-3 pl-12 text-xs"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 group-focus-within:text-rose-500 transition-colors" />
                            {isSearching && (
                                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-600 animate-spin" />
                            )}
                        </div>

                        {/* Autocomplete Results */}
                        <AnimatePresence>
                            {searchResults.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute left-0 right-0 mt-2 glass-card border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl max-h-60 overflow-y-auto custom-scrollbar"
                                >
                                    {searchResults.map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() => handleClaimStudent(s.id)}
                                            disabled={isClaiming}
                                            className="w-full flex flex-col items-start p-4 hover:bg-rose-600/10 border-b border-white/5 last:border-0 transition-colors group text-left"
                                        >
                                            <p className="text-xs font-black uppercase tracking-tight text-white group-hover:text-rose-500 transition-colors">
                                                {s.name} {s.lastname}
                                            </p>
                                            <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mt-1">
                                                DNI: {s.dni}
                                            </p>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                            <div className="absolute left-0 right-0 mt-2 glass-card border border-white/10 rounded-2xl p-4 z-50 shadow-2xl">
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-center">No se encontraron alumnos libres.</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Row 2: Analytics */}
                <StatCard
                    title="Engagement Semanal"
                    value={stats.recentAttendance}
                    icon={TrendingUp}
                    trend="Asistencia Alumnos"
                    description="Alumnos asistieron (últ. 7 días)"
                    color="rose"
                />
                <StatCard
                    title="Sin Rutina Activa"
                    value={stats.studentsWithoutRoutine}
                    icon={ClipboardList}
                    trend="Atención Necesaria"
                    description="Alumnos sin planes de entrenamiento"
                    color={stats.studentsWithoutRoutine > 0 ? "rose" : "neutral"}
                    href="/teacher/students"
                />
                <StatCard
                    title="Salud de Rutinas"
                    value={`${stats.healthPercentage}%`}
                    icon={CalendarClock}
                    trend="Actualización Mensual"
                    description="Rutinas al día (últ. 30 días)"
                    color="rose"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card rounded-[3rem] p-10 border-white/5 flex flex-col justify-between group overflow-hidden relative min-h-[300px]"
                >
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-700">
                        <Dumbbell className="h-40 w-40 text-rose-600 -rotate-12" />
                    </div>

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <h3 className="text-2xl font-black uppercase italic tracking-tight mb-4">Gestión de Alumnos</h3>
                            <p className="text-neutral-500 text-sm font-medium leading-relaxed max-w-sm mb-10">
                                Accedé a las rutinas de tus alumnos asignados. Podés crear, editar y notificar cambios directamente desde sus perfiles.
                            </p>
                        </div>
                        <Link
                            href="/teacher/students"
                            className="inline-flex items-center gap-4 bg-white/5 hover:bg-rose-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 hover:border-rose-600 group/btn self-start"
                        >
                            VER MI LISTA DE ALUMNOS
                            <ArrowUpRight className="h-4 w-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                        </Link>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card rounded-[2.5rem] p-8 border-white/5 bg-white/[0.01] flex items-center gap-8 group"
                    >
                        <div className="h-16 w-16 rounded-2xl bg-neutral-900 border border-white/5 flex items-center justify-center shrink-0 group-hover:border-rose-600/30 transition-colors">
                            <QrCode className="h-7 w-7 text-rose-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black uppercase italic tracking-tight mb-1">Monitor Staff</h3>
                            <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                Recordá marcar tu ingreso y salida en el monitor de la recepción para registrar tus jornadas.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="glass-card rounded-[2.5rem] p-8 border-white/5 bg-white/[0.01] flex items-center gap-8 group"
                    >
                        <div className="h-16 w-16 rounded-2xl bg-neutral-900 border border-white/5 flex items-center justify-center shrink-0 group-hover:border-rose-600/30 transition-colors">
                            <CheckCircle2 className="h-7 w-7 text-neutral-700 group-hover:text-rose-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black uppercase italic tracking-tight mb-1">Próximamente</h3>
                            <p className="text-neutral-600 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                Integración con calendario de clases y seguimiento de objetivos grupales.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            <FeedbackModal
                isOpen={feedback.isOpen}
                onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))}
                type={feedback.type}
                title={feedback.title}
                message={feedback.message}
            />
        </DashboardShell>
    );
}

function StatCard({ title, value, icon: Icon, trend, description, color, href }: any) {
    const Content = (
        <div className="flex items-start justify-between relative z-10">
            <div className="space-y-4">
                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl md:text-5xl font-black font-outfit italic tracking-tighter leading-none italic">{value}</h3>
                </div>
                <div>
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-rose-500 pt-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                        {trend}
                    </div>
                    <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest mt-2 ml-0.5">{description}</p>
                </div>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-900 border border-white/5 group-hover:border-rose-600/30 transition-colors ring-1 ring-white/5">
                <Icon className="h-6 w-6 text-rose-600 group-hover:scale-110 transition-transform" />
            </div>
        </div>
    );

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="glass-card rounded-[2.5rem] p-8 md:p-10 border-white/5 relative overflow-hidden group transition-all"
        >
            {href ? (
                <Link href={href}>
                    {Content}
                </Link>
            ) : (
                Content
            )}
        </motion.div>
    );
}

