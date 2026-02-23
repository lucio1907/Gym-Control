"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import api from "@/lib/api";
import { Dumbbell, Plus, Trash2, ArrowLeft, Loader2, PlayCircle, Target, Clock, Weight, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function StudentRoutinePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const studentId = resolvedParams.id;
    const router = useRouter();

    const [student, setStudent] = useState<any>(null);
    const [routines, setRoutines] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [newExercise, setNewExercise] = useState({
        exercise: "",
        series: 3,
        reps: 12,
        rest_time: 60,
        load: 0
    });

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const studentRes = await api.get(`/profiles/${studentId}`);
                setStudent(studentRes.data.data);

                const routinesRes = await api.get(`/routines/profile/${studentId}`);
                setRoutines(routinesRes.data.data);
            } catch (err) {
                console.error("Error fetching student/routines");
            } finally {
                setIsLoading(false);
            }
        };
        fetchStudentData();
    }, [studentId]);

    const handleAddExercise = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newExercise.exercise) return;
        setIsSaving(true);
        try {
            const res = await api.post("/routines", {
                ...newExercise,
                profileId: parseInt(studentId)
            });
            setRoutines([...routines, res.data.data]);
            setNewExercise({ exercise: "", series: 3, reps: 12, rest_time: 60, load: 0 });
        } catch (err) {
            alert("Error al guardar el ejercicio.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteExercise = async (id: number) => {
        if (!confirm("¿Eliminar este ejercicio?")) return;
        try {
            await api.delete(`/routines/${id}`);
            setRoutines(routines.filter(r => r.id !== id));
        } catch (err) {
            alert("Error al eliminar.");
        }
    };

    if (isLoading) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <Loader2 className="animate-spin text-rose-600 h-10 w-10" />
        </div>
    );

    return (
        <DashboardShell role="ADMIN">
            <motion.header
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-12"
            >
                <button onClick={() => router.back()} className="flex items-center gap-2 text-neutral-500 hover:text-rose-500 transition-all font-black text-[9px] uppercase tracking-[0.3em] group mb-8">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Volver a alumnos
                </button>

                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter font-outfit uppercase italic leading-[0.9]">
                        Rutina <span className="text-rose-600 lowercase tracking-normal">Elite</span>
                    </h1>
                    <p className="text-neutral-500 font-bold tracking-[0.2em] uppercase text-[9px] md:text-[10px] flex flex-wrap items-center gap-3">
                        Programando para: <span className="text-white bg-white/5 px-4 py-1.5 rounded-full border border-white/5 truncate">{student?.name} {student?.lastname}</span>
                    </p>
                </div>
            </motion.header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 lg:gap-16 items-start">
                {/* New Exercise Form */}
                <div className="xl:col-span-4 2xl:col-span-4">
                    <div className="glass-card rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 border-white/5 sticky top-10">
                        <h3 className="text-xl font-black font-outfit uppercase tracking-tighter mb-10 italic flex items-center gap-3">
                            <Plus className="text-rose-600 h-6 w-6 shrink-0" />
                            Nuevo Paso
                        </h3>

                        <form className="space-y-6" onSubmit={handleAddExercise}>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1">Ejercicio / Misión</label>
                                <div className="relative group">
                                    <PlayCircle className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-600 group-focus-within:text-rose-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Ej: Sentadilla Hack"
                                        className="input-premium pl-16 py-3.5 text-sm"
                                        value={newExercise.exercise}
                                        onChange={(e) => setNewExercise({ ...newExercise, exercise: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1">Series</label>
                                    <input
                                        type="number"
                                        className="input-premium py-3.5 text-center font-black text-sm"
                                        value={newExercise.series}
                                        onChange={(e) => setNewExercise({ ...newExercise, series: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1">Reps</label>
                                    <input
                                        type="number"
                                        className="input-premium py-3.5 text-center font-black text-sm"
                                        value={newExercise.reps}
                                        onChange={(e) => setNewExercise({ ...newExercise, reps: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1">Descanso (s)</label>
                                    <input
                                        type="number"
                                        className="input-premium py-3.5 text-center font-black text-sm"
                                        value={newExercise.rest_time}
                                        onChange={(e) => setNewExercise({ ...newExercise, rest_time: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1">Carga (kg)</label>
                                    <input
                                        type="number"
                                        className="input-premium py-3.5 text-center font-black text-sm"
                                        value={newExercise.load}
                                        onChange={(e) => setNewExercise({ ...newExercise, load: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="btn-premium w-full py-4 text-[10px] tracking-[0.3em] mt-4"
                            >
                                {isSaving ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : "ASIGNAR AHORA"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Routine List */}
                <div className="xl:col-span-8 2xl:col-span-8 space-y-8 pb-10">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl md:text-2xl font-black font-outfit uppercase tracking-tighter italic flex items-center gap-4">
                            <span className="h-8 w-1 bg-rose-600 rounded-full" />
                            Plan Activo
                        </h3>
                        <div className="px-5 py-2 glass rounded-full border-white/5 text-[9px] font-black text-rose-500 uppercase tracking-[0.2em] leading-none shrink-0">
                            {routines.length} MISIONES
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <AnimatePresence mode="popLayout">
                            {routines.map((r, idx) => (
                                <motion.div
                                    key={r.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="glass rounded-[2rem] p-6 lg:p-8 border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group hover:border-white/10 transition-all overflow-hidden"
                                >
                                    <div className="flex items-center gap-6 min-w-0">
                                        <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-neutral-900 border border-white/5 flex items-center justify-center font-black text-rose-600 text-lg md:text-xl font-outfit italic shrink-0">
                                            {idx + 1}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-lg md:text-xl font-black uppercase italic tracking-tighter text-white group-hover:text-rose-500 transition-colors leading-none truncate">{r.exercise}</h4>
                                            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
                                                <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">{r.series} SERIES</span>
                                                <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">{r.reps} REPS</span>
                                                <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">{r.rest_time}S DESC.</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-8 border-t sm:border-t-0 sm:border-l border-white/5 pt-6 sm:pt-0 sm:pl-8 shrink-0">
                                        <div className="text-right">
                                            <p className="text-2xl font-black font-outfit leading-none italic">{r.load || '0'}<span className="text-[10px] ml-1 text-neutral-500 uppercase not-italic tracking-widest">kg</span></p>
                                            <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest mt-2 leading-none">Carga</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteExercise(r.id)}
                                            className="p-4 rounded-2xl bg-rose-500/5 hover:bg-rose-500/20 text-neutral-700 hover:text-rose-500 transition-all border border-transparent hover:border-rose-500/20 active:scale-90"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {routines.length === 0 && (
                            <div className="glass-card rounded-[3rem] p-16 md:p-24 flex flex-col items-center justify-center text-center">
                                <Dumbbell className="h-16 w-16 text-neutral-800 mb-8 animate-pulse" />
                                <h4 className="text-lg md:text-2xl font-black font-outfit uppercase italic tracking-tighter">Sin misiones asignadas</h4>
                                <p className="text-neutral-500 max-w-xs mt-4 font-medium text-sm leading-relaxed">Cargá ejercicios para personalizar su entrenamiento.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
