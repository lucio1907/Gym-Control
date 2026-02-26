"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import DashboardShell from "@/components/DashboardShell";
import api from "@/lib/api";
import { Search, UserPlus, Edit2, Trash2, Filter, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import AddTeacherModal from "@/components/AddTeacherModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import FeedbackModal, { FeedbackType } from "@/components/FeedbackModal";

export default function AdminTeachersPage() {
    const [teachers, setTeachers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [teacherToEdit, setTeacherToEdit] = useState<any | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [teacherToDelete, setTeacherToDelete] = useState<any | null>(null);
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

    const showFeedback = useCallback((type: FeedbackType, title: string, message: string) => {
        setFeedback({ isOpen: true, type, title, message });
    }, []);

    const fetchTeachers = useCallback(async () => {
        try {
            const res = await api.get("/profiles");
            // Backend uses 'teacher' role for staff
            setTeachers(res.data.data.filter((p: any) => p.rol === "teacher"));
        } catch (err) {
            console.error("Error fetching teachers", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTeachers();

        // Subscribe to real-time changes
        const profilesChannel = supabase
            .channel('public:teachers_list')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
                fetchTeachers();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(profilesChannel);
        };
    }, [fetchTeachers]);

    const handleDeleteClick = useCallback((teacher: any) => {
        setTeacherToDelete(teacher);
        setIsDeleteModalOpen(true);
    }, []);

    const confirmDelete = useCallback(async () => {
        if (!teacherToDelete) return;

        setIsDeleting(true);
        try {
            await api.delete(`/profiles/${teacherToDelete.id}`);
            await fetchTeachers();
            setIsDeleteModalOpen(false);
            setTeacherToDelete(null);
            showFeedback("success", "Exito", "Profesor eliminado correctamente.");
        } catch (err) {
            console.error("Error deleting teacher", err);
            showFeedback("error", "Error", "No se pudo eliminar al profesor.");
        } finally {
            setIsDeleting(false);
        }
    }, [teacherToDelete, fetchTeachers, showFeedback]);

    const filteredTeachers = useMemo(() => {
        const query = search.toLowerCase();
        return teachers.filter(t =>
            t.name.toLowerCase().includes(query) ||
            t.lastname.toLowerCase().includes(query) ||
            t.dni.includes(query)
        );
    }, [teachers, search]);

    return (
        <DashboardShell role="ADMIN">
            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8"
            >
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter font-outfit uppercase italic leading-[0.9]">
                        Gestión de <span className="text-rose-600">Profesores</span>
                    </h1>
                    <p className="text-neutral-500 font-bold tracking-[0.2em] uppercase text-[9px] md:text-[10px]">Administración de staff técnico y entrenadores</p>
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn-premium px-8 py-4 text-[10px] tracking-[0.2em] flex items-center gap-4 shrink-0"
                >
                    <UserPlus className="h-5 w-5" />
                    NUEVO PROFESOR
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
                                <th className="px-8 py-8 font-black">Profesor</th>
                                <th className="px-6 py-8 font-black">Identificación</th>
                                <th className="px-6 py-8 font-black">Email</th>
                                <th className="px-6 py-8 font-black">Teléfono</th>
                                <th className="px-8 py-8 text-right font-black">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center">
                                        <Loader2 className="h-10 w-10 text-rose-600 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredTeachers.length > 0 ? (
                                filteredTeachers.map((teacher, idx) => (
                                    <motion.tr
                                        key={teacher.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="hover:bg-white/[0.01] transition-colors group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-11 w-11 rounded-full bg-neutral-900 border border-white/5 flex items-center justify-center font-black text-rose-500 text-xs uppercase italic shrink-0 ring-1 ring-white/5">
                                                    {teacher.name[0]}{teacher.lastname[0]}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs md:text-sm font-black uppercase tracking-tight truncate">{teacher.name} {teacher.lastname}</p>
                                                    <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest mt-1 italic leading-none">Profesor / Staff</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 whitespace-nowrap">
                                            <p className="text-xs md:text-sm font-black font-outfit text-neutral-300">{teacher.dni}</p>
                                        </td>
                                        <td className="px-6 py-6 whitespace-nowrap">
                                            <p className="text-xs font-medium text-neutral-400">{teacher.email}</p>
                                        </td>
                                        <td className="px-6 py-6 whitespace-nowrap">
                                            <p className="text-xs font-medium text-neutral-400">{teacher.phone}</p>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 md:gap-3 transition-all">
                                                <button
                                                    onClick={() => {
                                                        setTeacherToEdit(teacher);
                                                        setIsAddModalOpen(true);
                                                    }}
                                                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-neutral-500 hover:text-white transition-all shrink-0"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(teacher)}
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
                                    <td colSpan={5} className="py-24 text-center">
                                        <p className="text-neutral-500 font-black tracking-widest text-[10px] uppercase">No hay profesores registrados.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 border-t border-white/5 bg-white/[0.01] flex flex-col sm:flex-row items-center justify-between gap-6">
                    <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Mostrando {filteredTeachers.length} de {teachers.length} profesores</p>
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

            <AddTeacherModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setTeacherToEdit(null);
                }}
                onSuccess={() => fetchTeachers()}
                teacher={teacherToEdit}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setTeacherToDelete(null);
                }}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                title="Eliminar Profesor"
                message={`¿Estás seguro de que deseas eliminar a ${teacherToDelete?.name} ${teacherToDelete?.lastname}? Perderá acceso al sistema.`}
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
