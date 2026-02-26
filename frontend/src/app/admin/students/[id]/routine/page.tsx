"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import api from "@/lib/api";
import { Dumbbell, Plus, Trash2, ArrowLeft, Loader2, PlayCircle, Save, CheckCircle2, LayoutDashboard, Send, ChevronRight, XCircle, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import FeedbackModal, { FeedbackType } from "@/components/FeedbackModal";

export default function StudentRoutinePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const studentId = resolvedParams.id;
    const router = useRouter();

    const [student, setStudent] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const [feedback, setFeedback] = useState<{
        isOpen: boolean;
        type: FeedbackType;
        title: string;
        message: string;
        onConfirm?: () => void;
    }>({
        isOpen: false,
        type: "success",
        title: "",
        message: ""
    });

    const showFeedback = (type: FeedbackType, title: string, message: string, onConfirm?: () => void) => {
        setFeedback({ isOpen: true, type, title, message, onConfirm });
    };

    const handleNotifyStudent = async () => {
        showFeedback(
            "confirm",
            "Notificar Alumno",
            "¿Deseás enviar una notificación por mail al alumno con su nueva rutina?",
            async () => {
                try {
                    setFeedback(prev => ({ ...prev, isOpen: false })); // Close confirm modal
                    setIsLoading(true);
                    await api.post(`/routines/notify/${studentId}`);
                    showFeedback("success", "Notificación Enviada", "¡El alumno ha sido notificado con éxito!");
                } catch (err) {
                    console.error(err);
                    showFeedback("error", "Error de Envío", "No se pudo enviar la notificación. Intentá de nuevo.");
                } finally {
                    setIsLoading(false);
                }
            }
        );
    };

    const DAYS_ORDER = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
    const normalize = (s: string) => s.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const sortDays = (daysObj: any) => {
        if (!daysObj) return [];
        return Object.keys(daysObj).sort((a, b) => {
            const indexA = DAYS_ORDER.indexOf(normalize(a));
            const indexB = DAYS_ORDER.indexOf(normalize(b));
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    };

    const [activeRoutine, setActiveRoutine] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [newRoutineName, setNewRoutineName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [selectedDay, setSelectedDay] = useState("Lunes");
    const [newDayName, setNewDayName] = useState("");
    const [isAddingDay, setIsAddingDay] = useState(false);
    const [viewState, setViewState] = useState<"HUB" | "NAMING" | "EDITOR">("NAMING");

    const [newExercise, setNewExercise] = useState({
        name: "",
        sets: "3",
        reps: "12",
        weight: "",
        notes: ""
    });

    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { }
    });

    const openDeleteModal = (title: string, message: string, onConfirm: () => void) => {
        setDeleteModal({ isOpen: true, title, message, onConfirm });
    };

    const closeDeleteModal = () => {
        if (!isSaving) {
            setDeleteModal(prev => ({ ...prev, isOpen: false }));
        }
    };

    const fetchStudentData = async () => {
        try {
            console.log("FETCHING DATA FOR STUDENT:", studentId);
            setIsLoading(true);
            const [studentRes, meRes] = await Promise.all([
                api.get(`/profiles/${studentId}`),
                api.get("/profiles/me")
            ]);
            setStudent(studentRes.data.data);
            setCurrentUser(meRes.data.data);

            const routinesRes = await api.get(`/routines/profile/${studentId}`);
            const routines = routinesRes.data.data || [];
            console.log("ROUTINES FETCHED:", routines);

            // Find the active one
            let active = routines.find((r: any) =>
                r.is_active === true ||
                r.is_active === 1 ||
                r.is_active === "true" ||
                r.is_active === "1"
            );

            // FALLBACK: If no active is found but routines EXIST, pick the first one
            if (!active && routines.length > 0) {
                console.warn("No explicitly active routine found, picking first as fallback.");
                active = routines[0];
            }

            console.log("FINAL ACTIVE ROUTINE:", active);
            setActiveRoutine(active || null);

            // CRITICAL: If any routine exists, we should show the HUB, not the NAMING screen
            setViewState(active ? "HUB" : "NAMING");
        } catch (err: any) {
            console.error("Critical error fetching data:", err);
            const msg = err.response?.data?.message || err.message || "Error inesperado al cargar los datos.";
            alert("No se pudieron cargar los datos del alumno: " + msg);
            setViewState("NAMING");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentData();
    }, [studentId]);

    const handleCreateInitialRoutine = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRoutineName.trim()) return;

        setIsCreating(true);
        try {
            const res = await api.post(`/routines/createRoutine/${studentId}`, {
                routine_name: newRoutineName,
                routine_content: {
                    title: newRoutineName,
                    days: {
                        "Lunes": []
                    }
                }
            });
            console.log("Routine created successfully:", res.data.data);
            setActiveRoutine(res.data.data);
            setSelectedDay("Lunes");
            setNewRoutineName("");
            setViewState("EDITOR"); // Go directly to editor after creation
        } catch (err: any) {
            console.error("Error creating routine", err);
            alert(err.response?.data?.message || "Error al crear la rutina.");
        } finally {
            setIsCreating(false);
        }
    };

    const handleSaveRoutine = async (updatedExercises: any[], day: string = selectedDay) => {
        setIsSaving(true);
        try {
            if (activeRoutine) {
                // Update existing
                await api.put(`/routines/updateRoutine/${activeRoutine.id}`, {
                    routine_content: {
                        ...activeRoutine.routine_content,
                        days: {
                            ...activeRoutine.routine_content.days,
                            [day]: updatedExercises
                        }
                    }
                });
            }

            // Refetch to stay in sync with DB state
            const routinesRes = await api.get(`/routines/profile/${studentId}`);
            console.log("Syncing after save. All routines:", routinesRes.data.data);
            const active = routinesRes.data.data.find((r: any) => r.is_active == true || r.is_active === 1 || r.is_active === "true");
            setActiveRoutine(active || null);
        } catch (err: any) {
            console.error("Error saving exercises", err);
            const msg = err.response?.data?.message || "Error al guardar los ejercicios.";
            alert(msg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddDay = async (e: React.FormEvent) => {
        e.preventDefault();
        const name = newDayName.trim();
        if (!name || !activeRoutine) return;

        const currentDays = activeRoutine.routine_content.days || {};
        if (currentDays[name]) {
            alert("Este día ya existe.");
            return;
        }

        setIsSaving(true);
        try {
            await api.put(`/routines/updateRoutine/${activeRoutine.id}`, {
                routine_content: {
                    ...activeRoutine.routine_content,
                    days: {
                        ...currentDays,
                        [name]: []
                    }
                }
            });
            const routinesRes = await api.get(`/routines/profile/${studentId}`);
            const active = routinesRes.data.data.find((r: any) => r.is_active == true || r.is_active === 1 || r.is_active === "true");
            setActiveRoutine(active || null);
            setSelectedDay(name);
            setNewDayName("");
            setIsAddingDay(false);
        } catch (err: any) {
            console.error(err);
            alert("Error al agregar el día.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteDay = async (dayToDelete: string) => {
        if (!activeRoutine) return;
        const days = { ...activeRoutine.routine_content.days };
        if (Object.keys(days).length <= 1) {
            alert("La rutina debe tener al menos un día.");
            return;
        }

        openDeleteModal(
            "Eliminar Día",
            `¿Estás seguro de que deseás eliminar el día "${dayToDelete}" y todos sus ejercicios?`,
            async () => {
                delete days[dayToDelete];
                setIsSaving(true);
                try {
                    await api.put(`/routines/updateRoutine/${activeRoutine.id}`, {
                        routine_content: { ...activeRoutine.routine_content, days }
                    });
                    const routinesRes = await api.get(`/routines/profile/${studentId}`);
                    const active = routinesRes.data.data.find((r: any) => r.is_active == true || r.is_active === 1 || r.is_active === "true");
                    setActiveRoutine(active || null);
                    setSelectedDay(Object.keys(days)[0]);
                } catch (err) {
                    console.error(err);
                    alert("Error al eliminar el día.");
                } finally {
                    setIsSaving(false);
                    closeDeleteModal();
                }
            }
        );
    };

    const handleAddExercise = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newExercise.name || !activeRoutine) return;

        const currentExercises = activeRoutine.routine_content.days[selectedDay] || [];
        const updatedExercises = [...currentExercises, newExercise];

        await handleSaveRoutine(updatedExercises);
        setNewExercise({ name: "", sets: "3", reps: "12", weight: "", notes: "" });
    };

    const handleDeleteExercise = async (idx: number) => {
        openDeleteModal(
            "Eliminar Ejercicio",
            "¿Estás seguro de que deseás eliminar este ejercicio? Esta acción es irreversible.",
            async () => {
                const currentExercises = activeRoutine.routine_content.days[selectedDay] || [];
                const updatedExercises = currentExercises.filter((_: any, i: number) => i !== idx);
                await handleSaveRoutine(updatedExercises);
                closeDeleteModal();
            }
        );
    };

    const handleDeleteRoutine = async () => {
        if (!activeRoutine) return;
        openDeleteModal(
            "Eliminar Rutina Completa",
            `¿Estás SEGURO de que querés eliminar COMPLETAMENTE la rutina "${activeRoutine.routine_name}"? Esta acción no se puede deshacer.`,
            async () => {
                setIsSaving(true);
                try {
                    await api.delete(`/routines/deleteRoutine/${activeRoutine.id}`);
                    // Reset state
                    setActiveRoutine(null);
                    setViewState("NAMING");
                    await fetchStudentData(); // Refresh list
                } catch (err: any) {
                    console.error("Error deleting routine:", err);
                    alert("No se pudo eliminar la rutina.");
                } finally {
                    setIsSaving(false);
                    closeDeleteModal();
                }
            }
        );
    };

    if (isLoading) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <Loader2 className="animate-spin text-rose-600 h-10 w-10" />
        </div>
    );

    const exercises = activeRoutine?.routine_content?.days?.GENERAL || [];

    return (
        <DashboardShell role={currentUser?.rol?.toUpperCase()} userName={currentUser?.name}>
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16"
            >
                <div className="flex flex-col gap-6">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-neutral-500 hover:text-rose-500 transition-all font-black text-[9px] uppercase tracking-[0.3em] group">
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        VOLVER A {currentUser?.rol === 'teacher' ? 'MIS ALUMNOS' : 'ALUMNOS'}
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-rose-600/10 border border-rose-600/20 rounded-full text-[9px] font-black text-rose-500 uppercase tracking-widest">
                                Gestión Elite
                            </span>
                            {activeRoutine && (
                                <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[9px] font-black text-neutral-500 uppercase tracking-widest">
                                    Plan Activo: {activeRoutine.routine_name}
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black font-outfit uppercase italic tracking-tighter leading-none">
                            Rutinas <span className="text-rose-600">Pro</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {viewState !== "HUB" && activeRoutine && (
                        <button
                            onClick={() => setViewState("HUB")}
                            className="bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 flex items-center gap-2"
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            CENTRO DE MANDO
                        </button>
                    )}
                    <button
                        onClick={() => router.push(currentUser?.rol === 'teacher' ? '/teacher/students' : '/admin/students')}
                        className="bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
                    >
                        VOLVER AL LISTADO
                    </button>
                    <button
                        onClick={handleNotifyStudent}
                        className="btn-premium flex items-center gap-3 px-8 py-4 text-[10px] font-black"
                    >
                        <Send className="h-4 w-4" />
                        NOTIFICAR ALUMNO
                    </button>
                </div>
            </motion.header>

            <div className="grid grid-cols-1 gap-10">
                <AnimatePresence mode="wait">
                    {viewState === "HUB" && activeRoutine ? (
                        <motion.div
                            key="hub-screen"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8"
                        >
                            {/* Current Plan Card */}
                            <div className="glass-card rounded-[3rem] p-10 border-white/5 text-center flex flex-col items-center group hover:border-rose-500/20 transition-all duration-500 relative">
                                <div className="p-6 rounded-3xl bg-neutral-900 border border-white/5 mb-8 group-hover:scale-110 transition-transform">
                                    <Dumbbell className="h-12 w-12 text-rose-600" />
                                </div>
                                <h2 className="text-2xl font-black uppercase italic tracking-tight mb-2">Gestionar Actual</h2>
                                <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-10">
                                    Plan: <span className="text-white">{activeRoutine.routine_name}</span>
                                </p>
                                <button
                                    onClick={() => setViewState("EDITOR")}
                                    className="btn-premium w-full py-5 text-[11px] tracking-[0.3em] flex items-center justify-center gap-4"
                                >
                                    VER Y EDITAR EJERCICIOS
                                    <ChevronRight className="h-5 w-5" />
                                </button>

                                <button
                                    onClick={handleDeleteRoutine}
                                    className="mt-6 text-[9px] font-black text-neutral-600 uppercase tracking-widest hover:text-rose-500 transition-colors flex items-center gap-2"
                                >
                                    <Trash2 className="h-3 w-3" />
                                    ELIMINAR ESTA RUTINA
                                </button>
                            </div>

                            {/* New Plan Card */}
                            <div className="glass-card rounded-[3rem] p-10 border-white/5 text-center flex flex-col items-center group hover:border-blue-500/20 transition-all duration-500 relative">
                                <div className="p-6 rounded-3xl bg-neutral-900 border border-white/5 mb-8 group-hover:scale-110 transition-transform text-blue-500">
                                    <Plus className="h-12 w-12" />
                                </div>
                                <h2 className="text-2xl font-black uppercase italic tracking-tight mb-2">Nuevo Plan</h2>
                                <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-10">
                                    Reemplazará la rutina actual
                                </p>
                                <button
                                    onClick={() => setViewState("NAMING")}
                                    className="bg-white/5 hover:bg-white/10 text-white w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all border border-white/5 flex items-center justify-center gap-4"
                                >
                                    BAUTIZAR NUEVA RUTINA
                                    <Plus className="h-5 w-5" />
                                </button>
                            </div>
                        </motion.div>
                    ) : (viewState === "NAMING" || !activeRoutine) ? (
                        <motion.div
                            key="naming-screen"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="max-w-2xl mx-auto w-full"
                        >
                            <div className="glass-card rounded-[3rem] p-12 md:p-20 text-center border-white/5 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-b from-rose-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                <Dumbbell className="h-20 w-20 text-rose-600 mx-auto mb-10 animate-bounce" />
                                <h2 className="text-3xl md:text-5xl font-black font-outfit uppercase italic tracking-tighter mb-6">
                                    Bautizar <span className="text-rose-600">Nueva Rutina</span>
                                </h2>
                                <p className="text-neutral-500 font-medium text-sm md:text-base mb-12 max-w-sm mx-auto leading-relaxed">
                                    Primero definí el nombre para este nuevo plan de entrenamiento.
                                </p>

                                <form onSubmit={handleCreateInitialRoutine} className="space-y-6">
                                    <input
                                        type="text"
                                        placeholder="Ej: Misión Hipertrofia 2026"
                                        className="input-premium py-5 text-center text-xl font-black uppercase tracking-widest placeholder:text-neutral-700"
                                        value={newRoutineName}
                                        onChange={(e) => setNewRoutineName(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={isCreating || !newRoutineName.trim()}
                                        className="btn-premium w-full py-5 text-[12px] tracking-[0.4em] flex items-center justify-center gap-4"
                                    >
                                        {isCreating ? <Loader2 className="animate-spin h-6 w-6" /> : (
                                            <>
                                                EMPEZAR A CARGAR EJERCICIOS
                                                <PlayCircle className="h-5 w-5" />
                                            </>
                                        )}
                                    </button>
                                </form>
                                {activeRoutine && (
                                    <button
                                        onClick={() => setViewState("HUB")}
                                        className="mt-8 text-[10px] font-black text-neutral-600 uppercase tracking-widest hover:text-white transition-colors"
                                    >
                                        CANCELAR Y VOLVER
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="editor-screen"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 xl:grid-cols-12 gap-10 lg:gap-16 items-start"
                        >
                            {/* New Exercise Form */}
                            <div className="xl:col-span-4">
                                <div className="glass-card rounded-[2.5rem] p-8 md:p-10 border-white/5 sticky top-10">
                                    <div className="mb-10">
                                        <div className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-2 italic">Rutina Activa</div>
                                        <h3 className="text-2xl font-black font-outfit uppercase tracking-tighter italic leading-none truncate">
                                            {activeRoutine.routine_name}
                                        </h3>
                                    </div>

                                    <h4 className="text-[11px] font-black font-outfit uppercase tracking-[0.2em] mb-8 text-white/40 flex items-center gap-3">
                                        <Plus className="h-4 w-4 text-rose-600" />
                                        Agregar Ejercicio
                                    </h4>

                                    <form className="space-y-6" onSubmit={handleAddExercise}>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1">Nombre</label>
                                            <div className="relative group">
                                                <PlayCircle className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-600 group-focus-within:text-rose-500 transition-colors" />
                                                <input
                                                    type="text"
                                                    placeholder="Ej: Press de Banca"
                                                    className="input-premium pl-16 py-3.5 text-sm"
                                                    value={newExercise.name}
                                                    onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1">Series</label>
                                                <input
                                                    type="text"
                                                    className="input-premium py-3.5 text-center font-black text-sm"
                                                    value={newExercise.sets}
                                                    onChange={(e) => setNewExercise({ ...newExercise, sets: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1">Reps</label>
                                                <input
                                                    type="text"
                                                    className="input-premium py-3.5 text-center font-black text-sm"
                                                    value={newExercise.reps}
                                                    onChange={(e) => setNewExercise({ ...newExercise, reps: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1">Carga / Peso</label>
                                            <input
                                                type="text"
                                                placeholder="Ej: 60kg o RPE 8"
                                                className="input-premium py-3.5 text-sm px-6"
                                                value={newExercise.weight}
                                                onChange={(e) => setNewExercise({ ...newExercise, weight: e.target.value })}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="btn-premium w-full py-4 text-[10px] tracking-[0.3em] mt-4 flex items-center justify-center gap-3"
                                        >
                                            {isSaving ? <Loader2 className="animate-spin h-5 w-5" /> : (
                                                <>
                                                    <Save className="h-4 w-4" />
                                                    SUMAR AL PLAN
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Routine List */}
                            <div className="xl:col-span-8 space-y-8 pb-10">
                                {/* Day Selector Tabs */}
                                <div className="flex flex-wrap items-center gap-3 mb-8">
                                    {activeRoutine.routine_content.days && sortDays(activeRoutine.routine_content.days).map((dayName) => (
                                        <div key={dayName} className="relative group/day">
                                            <button
                                                onClick={() => setSelectedDay(dayName)}
                                                className={cn(
                                                    "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                                    selectedDay === dayName
                                                        ? "bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-600/20"
                                                        : "bg-white/5 text-neutral-500 border-white/5 hover:border-white/10 hover:text-white"
                                                )}
                                            >
                                                {dayName}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDay(dayName)}
                                                className="absolute -top-2 -right-2 h-6 w-6 bg-neutral-900 border border-white/10 rounded-full flex items-center justify-center opacity-0 group-hover/day:opacity-100 hover:bg-rose-600 hover:text-white transition-all scale-75 group-hover/day:scale-100 text-neutral-400"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}

                                    {!isAddingDay ? (
                                        <button
                                            onClick={() => setIsAddingDay(true)}
                                            className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-white/5 text-rose-500 border border-dashed border-rose-500/30 hover:bg-rose-500/10 transition-all flex items-center gap-2"
                                        >
                                            <Plus className="h-4 w-4" />
                                            AGREGAR DÍA
                                        </button>
                                    ) : (
                                        <motion.form
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            onSubmit={handleAddDay}
                                            className="flex items-center gap-2 bg-neutral-900 p-1.5 rounded-2xl border border-white/10"
                                        >
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder="Ej: Martes"
                                                className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest px-4 focus:ring-0 text-white w-32"
                                                value={newDayName}
                                                onChange={(e) => setNewDayName(e.target.value)}
                                            />
                                            <button type="submit" className="p-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors">
                                                <CheckCircle2 className="h-4 w-4" />
                                            </button>
                                            <button type="button" onClick={() => setIsAddingDay(false)} className="p-2 text-neutral-500 hover:text-white transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </motion.form>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xl md:text-2xl font-black font-outfit uppercase tracking-tighter italic flex items-center gap-4">
                                        <span className="h-8 w-1 bg-rose-600 rounded-full" />
                                        Misiones: {selectedDay}
                                    </h3>
                                    <div className="px-5 py-2 glass rounded-full border-white/5 text-[9px] font-black text-rose-500 uppercase tracking-[0.2em] leading-none shrink-0">
                                        {(activeRoutine.routine_content.days[selectedDay] || []).length} EJERCICIOS
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <AnimatePresence mode="popLayout">
                                        {(activeRoutine.routine_content.days[selectedDay] || []).map((r: any, idx: number) => (
                                            <motion.div
                                                key={`${selectedDay}-${idx}`}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="glass rounded-[2rem] p-6 lg:p-8 border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group hover:border-white/10 transition-all overflow-hidden"
                                            >
                                                <div className="flex items-center gap-6 min-w-0">
                                                    <div className="h-12 w-12 rounded-2xl bg-neutral-900 border border-white/5 flex items-center justify-center font-black text-rose-600 text-lg font-outfit italic shrink-0">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="text-lg md:text-xl font-black uppercase italic tracking-tighter text-white group-hover:text-rose-500 transition-colors leading-none truncate">{r.name}</h4>
                                                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
                                                            <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">{r.sets} SERIES</span>
                                                            <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">{r.reps} REPS</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between sm:justify-end gap-8 border-t sm:border-t-0 sm:border-l border-white/5 pt-6 sm:pt-0 sm:pl-8 shrink-0">
                                                    <div className="text-right">
                                                        <p className="text-2xl font-black font-outfit leading-none italic">{r.weight || '--'}</p>
                                                        <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest mt-2 leading-none">Carga</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteExercise(idx)}
                                                        className="p-4 rounded-2xl bg-rose-500/5 hover:bg-rose-500/20 text-neutral-700 hover:text-rose-500 transition-all border border-transparent hover:border-rose-500/20 active:scale-90"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {(!activeRoutine.routine_content.days[selectedDay] || activeRoutine.routine_content.days[selectedDay].length === 0) && (
                                        <div className="glass-card rounded-[3rem] p-16 md:p-24 flex flex-col items-center justify-center text-center">
                                            <Dumbbell className="h-16 w-16 text-neutral-800 mb-8 animate-pulse" />
                                            <h4 className="text-lg md:text-2xl font-black font-outfit uppercase italic tracking-tighter">Día Vacío</h4>
                                            <p className="text-neutral-500 max-w-xs mt-4 font-medium text-sm leading-relaxed">Cargá el primer ejercicio para el día <b>{selectedDay}</b>.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <FeedbackModal
                isOpen={feedback.isOpen}
                onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))}
                type={feedback.type}
                title={feedback.title}
                message={feedback.message}
                onConfirm={feedback.onConfirm}
                isLoading={isLoading}
            />

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={deleteModal.onConfirm}
                title={deleteModal.title}
                message={deleteModal.message}
                isLoading={isSaving}
            />
        </DashboardShell>
    );
}
