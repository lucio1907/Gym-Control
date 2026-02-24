"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import api from "@/lib/api";
import { Dumbbell, Search, UserPlus, Edit2, Trash2, Filter, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import AddStudentModal from "@/components/AddStudentModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import FeedbackModal, { FeedbackType } from "@/components/FeedbackModal";

export default function AdminStudentsPage() {
    const router = useRouter();
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [studentToEdit, setStudentToEdit] = useState<any | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<any | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
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

    const fetchStudents = async () => {
        try {
            const res = await api.get("/profiles");
            // Backend uses 'user' role for students
            setStudents(res.data.data.filter((p: any) => p.rol === "user"));
        } catch (err) {
            console.error("Error fetching students", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();

        // Subscribe to real-time changes
        const profilesChannel = supabase
            .channel('public:profiles_list')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
                fetchStudents();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(profilesChannel);
        };
    }, []);

    const handleDeleteClick = (student: any) => {
        setStudentToDelete(student);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!studentToDelete) return;

        setIsDeleting(true);
        try {
            await api.delete(`/profiles/${studentToDelete.id}`);
            // List will auto-update via Supabase Realtime
            setIsDeleteModalOpen(false);
            setStudentToDelete(null);
        } catch (err) {
            console.error("Error deleting student", err);
            showFeedback("error", "Error de Eliminación", "No se pudo eliminar al alumno. Verificá tu conexión o intentá más tarde.");
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.lastname.toLowerCase().includes(search.toLowerCase()) ||
        s.dni.includes(search)
    );

    return (
        <DashboardShell role="ADMIN">
            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8"
            >
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter font-outfit uppercase italic leading-[0.9]">
                        Control de <span className="text-rose-600">Alumnos</span>
                    </h1>
                    <p className="text-neutral-500 font-bold tracking-[0.2em] uppercase text-[9px] md:text-[10px]">Gestión centralizada de perfiles y rutinas</p>
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn-premium px-8 py-4 text-[10px] tracking-[0.2em] flex items-center gap-4 shrink-0"
                >
                    <UserPlus className="h-5 w-5" />
                    NUEVO ALUMNO
                </button>
            </motion.header>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex-1 relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-600 group-focus-within:text-rose-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, apellido o DNI..."
                        className="input-premium pl-16 py-4 text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button className="glass px-6 rounded-2xl border-white/5 flex items-center justify-center gap-3 text-neutral-500 hover:text-white shrink-0 min-h-[56px] transition-all">
                    <Filter className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Filtros</span>
                </button>
            </div>

            <div className="glass-card rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border-white/5">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead className="border-b border-white/5 bg-white/[0.02]">
                            <tr className="font-outfit text-white uppercase tracking-widest text-[9px] md:text-[10px]">
                                <th className="px-8 py-8 font-black">Alumno</th>
                                <th className="px-6 py-8 font-black">DNI / Identificación</th>
                                <th className="px-6 py-8 font-black">Estado Pago</th>
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
                                        className="hover:bg-white/[0.01] transition-colors group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-11 w-11 rounded-full bg-neutral-900 border border-white/5 flex items-center justify-center font-black text-rose-500 text-xs uppercase italic shrink-0 ring-1 ring-white/5">
                                                    {student.name[0]}{student.lastname[0]}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs md:text-sm font-black uppercase tracking-tight truncate">{student.name} {student.lastname}</p>
                                                    <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest mt-1 italic truncate">{student.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 whitespace-nowrap">
                                            <p className="text-xs md:text-sm font-black font-outfit text-neutral-300">{student.dni}</p>
                                        </td>
                                        <td className="px-6 py-6 font-outfit">
                                            {(() => {
                                                const isExpired = new Date(student.expiration_day) < new Date();
                                                const isPending = student.billing_state !== "OK" || isExpired;

                                                return (
                                                    <div className={cn(
                                                        "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shrink-0",
                                                        !isPending ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                    )}>
                                                        {!isPending ? <CheckCircle2 className="h-2.5 w-2.5" /> : <AlertCircle className="h-2.5 w-2.5" />}
                                                        {!isPending ? "Vigente" : isExpired ? "Vencido" : "Pendiente"}
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 md:gap-3 transition-all">
                                                <button
                                                    onClick={() => router.push(`/admin/students/${student.id}/routine`)}
                                                    className="p-3 rounded-xl bg-white/5 hover:bg-rose-600/20 border border-white/5 hover:border-rose-600/30 text-neutral-500 hover:text-rose-500 transition-all shrink-0"
                                                    title="Rutina"
                                                >
                                                    <Dumbbell className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setStudentToEdit(student);
                                                        setIsAddModalOpen(true);
                                                    }}
                                                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-neutral-500 hover:text-white transition-all shrink-0"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(student)}
                                                    className="p-3 rounded-xl bg-white/5 hover:bg-rose-600/10 border border-white/5 hover:border-rose-600/20 text-neutral-500 hover:text-rose-500 transition-all shrink-0"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-24 text-center">
                                        <p className="text-neutral-500 font-black tracking-widest text-[10px] uppercase">Sin resultados en tu gimnasio.</p>
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

            <AddStudentModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setStudentToEdit(null);
                }}
                onSuccess={fetchStudents}
                student={studentToEdit}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setStudentToDelete(null);
                }}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                title="Eliminar Alumno"
                message={`¿Estás seguro de que deseas eliminar a ${studentToDelete?.name} ${studentToDelete?.lastname}? Esta acción limpiará su perfil y historial definitivamente.`}
            />

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
