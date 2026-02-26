"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import api from "@/lib/api";
import { Dumbbell, Search, Filter, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import FeedbackModal, { FeedbackType } from "@/components/FeedbackModal";

export default function TeacherStudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [role, setRole] = useState<"TEACHER" | "ADMIN">("TEACHER");
    const router = useRouter();

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

    const showFeedback = (type: FeedbackType, title: string, message: string) => {
        setFeedback({ isOpen: true, type, title, message });
    };

    const fetchStudents = useCallback(async () => {
        setIsLoading(true);
        try {
            // Get user info to confirm role
            const meRes = await api.get("/profiles/me");
            setRole(meRes.data.data.rol);

            // Fetch assigned students
            const res = await api.get("/profiles/assigned-students");
            setStudents(res.data.data || []);
        } catch (err) {
            console.error("Error fetching students:", err);
            showFeedback("error", "Error de Carga", "No se pudieron obtener tus alumnos asignados.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            const full = `${s.name} ${s.lastname} ${s.dni}`.toLowerCase();
            return full.includes(searchQuery.toLowerCase());
        });
    }, [students, searchQuery]);

    return (
        <DashboardShell role={role.toUpperCase() as any}>
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black font-outfit uppercase italic tracking-tighter leading-none">
                        Mis <span className="text-rose-600">Alumnos</span>
                    </h1>
                    <p className="text-neutral-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-4 ml-1">
                        Gestión de Alumnado Asignado
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 group-focus-within:text-rose-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="BUSCAR POR NOMBRE O DNI..."
                            className="input-premium pl-14 py-4 text-[10px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="glass-card rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border-white/5">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead className="border-b border-white/5 bg-white/[0.02]">
                            <tr className="font-outfit text-white uppercase tracking-widest text-[9px] md:text-[10px]">
                                <th className="px-8 py-8 font-black">Alumno</th>
                                <th className="px-6 py-8 font-black">Identificación</th>
                                <th className="px-6 py-8 font-black">Contacto</th>
                                <th className="px-8 py-8 text-right font-black">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="py-24 text-center">
                                        <Loader2 className="h-10 w-10 text-rose-600 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredStudents.length > 0 ? (
                                filteredStudents.map((student, idx) => (
                                    <motion.tr
                                        key={student.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={cn(
                                            "hover:bg-white/[0.01] transition-colors group",
                                            !student.has_active_routine && "bg-rose-600/[0.02]"
                                        )}
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "h-11 w-11 rounded-full flex items-center justify-center font-black text-xs uppercase italic shrink-0 ring-1",
                                                    student.has_active_routine
                                                        ? "bg-neutral-900 border border-white/5 text-rose-500 ring-white/5"
                                                        : "bg-rose-600/10 border border-rose-600/30 text-rose-600 ring-rose-600/20 animate-pulse"
                                                )}>
                                                    {student.name[0]}{student.lastname[0]}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs md:text-sm font-black uppercase tracking-tight truncate">{student.name} {student.lastname}</p>
                                                        {!student.has_active_routine && (
                                                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-600/10 border border-rose-600/20 text-[7px] font-black text-rose-500 uppercase tracking-widest shrink-0">
                                                                <AlertCircle className="h-2 w-2" />
                                                                Sin Rutina
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest mt-1 italic truncate">{student.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 whitespace-nowrap">
                                            <p className="text-xs md:text-sm font-black font-outfit text-neutral-300">{student.dni}</p>
                                        </td>
                                        <td className="px-6 py-6 whitespace-nowrap">
                                            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{student.phone || 'Sin teléfono'}</p>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 md:gap-3 transition-all">
                                                <button
                                                    onClick={() => router.push(`/admin/students/${student.id}/routine`)}
                                                    className={cn(
                                                        "p-3 rounded-xl border transition-all shrink-0 flex items-center gap-2 px-6 shadow-lg",
                                                        student.has_active_routine
                                                            ? "bg-white/5 hover:bg-rose-600/20 border-white/5 hover:border-rose-600/30 text-neutral-500 hover:text-rose-500"
                                                            : "bg-rose-600/10 border-rose-600/30 text-rose-500 hover:bg-rose-600 hover:text-white hover:border-rose-600 animate-bounce-subtle"
                                                    )}
                                                    title="Gestionar Rutina"
                                                >
                                                    <Dumbbell className="h-4 w-4" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest hidden md:inline">
                                                        {student.has_active_routine ? "Ver Rutina" : "Asignar Rutina"}
                                                    </span>
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-24 text-center">
                                        <p className="text-neutral-500 font-black tracking-widest text-[10px] uppercase">No tenés alumnos asignados actualmente.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 border-t border-white/5 bg-white/[0.01] flex flex-col sm:flex-row items-center justify-between gap-6">
                    <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Mostrando {filteredStudents.length} de {students.length} alumnos</p>
                    <div className="flex gap-4">
                        <button className="h-11 w-11 glass border-white/5 rounded-xl flex items-center justify-center text-neutral-600 hover:text-white transition-colors disabled:opacity-30" disabled>
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button className="h-11 w-11 glass border-white/5 rounded-xl flex items-center justify-center text-neutral-600 hover:text-white transition-colors disabled:opacity-30" disabled>
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
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
