"use client";

import { useState, useEffect, useCallback } from "react";
import { Profile } from "@/types/profiles";
import { Loader2, CreditCard, Search, Calendar, DollarSign, Wallet } from "lucide-react";
import Modal from "./Modal";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface ManualPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialStudent?: Profile | null;
}

export default function ManualPaymentModal({ isOpen, onClose, onSuccess, initialStudent }: ManualPaymentModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [students, setStudents] = useState<Profile[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null);

    const [formData, setFormData] = useState({
        amount: "",
        concept: "Plan Mensual Musculación",
        date: new Date().toISOString().split('T')[0]
    });

    // Reset when modal opens with initial student
    useEffect(() => {
        if (isOpen && initialStudent) {
            setSelectedStudent(initialStudent);
        }
    }, [isOpen, initialStudent]);

    // Fetch default fee from settings
    useEffect(() => {
        if (isOpen && !selectedStudent && !initialStudent) {
            const fetchSettings = async () => {
                try {
                    const res = await api.get("/settings");
                    if (res.data.data.base_fee) {
                        setFormData(prev => ({
                            ...prev,
                            amount: res.data.data.base_fee.toString()
                        }));
                    }
                } catch (err) {
                    console.error("Error fetching settings", err);
                }
            };
            fetchSettings();
        }
    }, [isOpen, selectedStudent]);

    // Auto-fill from student's plan
    useEffect(() => {
        if (selectedStudent) {
            if (selectedStudent.plan) {
                setFormData(prev => ({
                    ...prev,
                    amount: selectedStudent.plan?.price.toString() || prev.amount,
                    concept: `Cuota Mensual - ${selectedStudent.plan?.name}` || prev.concept
                }));
            } else {
                // Fallback to default setting if no plan assigned
                const fetchSettings = async () => {
                    try {
                        const res = await api.get("/settings");
                        if (res.data.data.base_fee) {
                            setFormData(prev => ({
                                ...prev,
                                amount: res.data.data.base_fee.toString(),
                                concept: "Plan Mensual Musculación"
                            }));
                        }
                    } catch (err) {
                        console.error("Error fetching settings", err);
                    }
                };
                fetchSettings();
            }
        }
    }, [selectedStudent]);

    // Simple search effect
    useEffect(() => {
        if (!searchTerm) {
            setStudents([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setSearchLoading(true);
            try {
                // Fetch students matching search
                const res = await api.get("/profiles");
                const all = res.data.data;
                const filtered = all.filter((s: any) =>
                    s.rol === 'user' && (
                        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.dni.includes(searchTerm)
                    )
                );
                setStudents(filtered);
            } catch (err) {
                console.error("Search error", err);
            } finally {
                setSearchLoading(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) {
            setError("Seleccioná un alumno");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await api.post("/payments", {
                profile_id: selectedStudent.id,
                amount: parseFloat(formData.amount),
                concept: formData.concept,
                mp_payment_id: "MANUAL_" + Date.now(), // Generate a unique mock ID for manual payments
                payment_date: new Date(formData.date)
            });
            onSuccess();
            onClose();
            // Reset
            setSelectedStudent(null);
            setSearchTerm("");
            setFormData({
                amount: "",
                concept: "Plan Mensual Musculación",
                date: new Date().toISOString().split('T')[0]
            });
        } catch (err: any) {
            setError(err.response?.data?.message || "Error al registrar el pago.");
        } finally {
            setIsLoading(false);
        }
    }, [selectedStudent, formData, onSuccess, onClose]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Cobro Manual" className="max-w-xl">
            <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-rose-500 text-xs font-bold">
                        {error}
                    </div>
                )}

                {/* Student Selection */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Seleccionar Alumno</label>

                    {selectedStudent ? (
                        <div className="flex items-center justify-between p-4 rounded-3xl bg-rose-600/10 border border-rose-600/30 group">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-rose-600 flex items-center justify-center text-white font-black text-xs uppercase italic">
                                    {selectedStudent.name[0]}{selectedStudent.lastname[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-white uppercase italic">{selectedStudent.name} {selectedStudent.lastname}</p>
                                    <div className="flex gap-2 mt-0.5">
                                        <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">DNI: {selectedStudent.dni}</p>
                                        {selectedStudent.plan && (
                                            <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest border-l border-white/10 pl-2">
                                                Plan: {selectedStudent.plan.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedStudent(null)}
                                className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:text-white transition-colors"
                            >
                                Cambiar
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="relative group/input">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 group-focus-within/input:text-rose-500 transition-colors" />
                                <input
                                    placeholder="Buscar por Nombre, Apellido o DNI..."
                                    className="input-premium pl-12 text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500 animate-spin" />}
                            </div>

                            {students.length > 0 && (
                                <div className="max-h-[200px] overflow-y-auto rounded-3xl border border-white/5 bg-neutral-900/50 backdrop-blur-md p-2 space-y-1 scrollbar-hide">
                                    {students.map((s) => (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => setSelectedStudent(s)}
                                            className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 text-left transition-all border border-transparent hover:border-white/5"
                                        >
                                            <div className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 font-black text-[10px] uppercase italic shrink-0">
                                                {s.name[0]}{s.lastname[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-black text-white uppercase tracking-tight truncate">{s.name} {s.lastname}</p>
                                                <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest mt-0.5 truncate">DNI {s.dni}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Amount and Concept */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Monto ($)</label>
                        <div className="relative group/input">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 group-focus-within/input:text-rose-500 transition-colors" />
                            <input
                                type="number"
                                placeholder="15000"
                                className="input-premium pl-12 text-sm"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Fecha</label>
                        <div className="relative group/input">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 group-focus-within/input:text-rose-500 transition-colors z-20" />

                            {/* Native picker (Invisible but clickable) */}
                            <input
                                type="date"
                                className="absolute inset-0 w-full h-full opacity-0 z-30 cursor-pointer"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />

                            {/* Visual Display (Formatted as DD/MM/YYYY) */}
                            <div className="input-premium pl-12 text-sm text-neutral-300 flex items-center min-h-[52px]">
                                {formData.date ? new Date(formData.date + 'T00:00:00').toLocaleDateString('es-AR') : 'Seleccionar Fecha'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Concepto</label>
                    <div className="relative group/input">
                        <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 group-focus-within/input:text-rose-500 transition-colors" />
                        <input
                            placeholder="Plan Mensual Musculación"
                            className="input-premium pl-12 text-sm"
                            value={formData.concept}
                            onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                        />
                    </div>
                </div>

                <div className="pt-4 text-center">
                    <button
                        type="submit"
                        disabled={isLoading || !selectedStudent}
                        className="btn-premium w-full py-4 text-sm font-black tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                        ) : (
                            <span className="flex items-center justify-center gap-2 uppercase italic">
                                Registrar Pago <CreditCard className="h-4 w-4" />
                            </span>
                        )}
                    </button>
                    <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest mt-6 italic">
                        El estado del alumno se actualizará a "A día" automáticamente.
                    </p>
                </div>
            </form>
        </Modal>
    );
}
