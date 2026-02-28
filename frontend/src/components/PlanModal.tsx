"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Plus, CheckCircle2, DollarSign, Type, AlignLeft } from "lucide-react";
import Modal from "./Modal";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface PlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    plan?: any; // If provided, the modal acts as an Edit modal
}

export default function PlanModal({ isOpen, onClose, onSuccess, plan }: PlanModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: plan?.name || "",
        price: plan?.price?.toString() || "",
        description: plan?.description || ""
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: plan?.name || "",
                price: plan?.price?.toString() || "",
                description: plan?.description || ""
            });
            setError(null);
        }
    }, [isOpen, plan]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.name || !formData.price) {
            setError("El nombre y el precio son obligatorios.");
            return;
        }

        setIsLoading(true);
        try {
            if (plan) {
                await api.put(`/plans/${plan.id}`, {
                    ...formData,
                    price: Number(formData.price)
                });
            } else {
                await api.post("/plans", {
                    ...formData,
                    price: Number(formData.price)
                });
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || "Error al guardar el plan.");
        } finally {
            setIsLoading(false);
        }
    }, [formData, plan, onSuccess, onClose]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={plan ? "Editar Membresía" : "Nueva Membresía"}
            className="max-w-md"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-rose-500 text-xs font-bold">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Nombre del Plan</label>
                    <div className="relative group/input">
                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 group-focus-within/input:text-rose-500 transition-colors" />
                        <input
                            placeholder="Ej: Plan Musculación"
                            className="input-premium pl-12 text-sm"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Precio Mensual</label>
                    <div className="relative group/input">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 group-focus-within/input:text-rose-500 transition-colors" />
                        <input
                            type="number"
                            placeholder="0.00"
                            className="input-premium pl-12 text-sm"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Descripción</label>
                    <div className="relative group/input">
                        <AlignLeft className="absolute left-4 top-4 h-4 w-4 text-neutral-600 group-focus-within/input:text-rose-500 transition-colors" />
                        <textarea
                            placeholder="¿Qué incluye este plan?"
                            className="input-premium pl-12 pt-4 text-sm min-h-[120px] resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-premium w-full py-4 text-sm font-black tracking-widest"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                        ) : (
                            <span className="flex items-center justify-center gap-2 uppercase italic">
                                {plan ? "Guardar Cambios" : "Crear Plan"}
                                {plan ? <CheckCircle2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            </span>
                        )}
                    </button>
                    <p className="text-[9px] text-center text-neutral-600 font-bold uppercase tracking-widest mt-4 leading-relaxed italic">
                        {plan ? "Los cambios se aplicarán a los nuevos cobros." : "El plan estará disponible para asignar a alumnos inmediatamente."}
                    </p>
                </div>
            </form>
        </Modal>
    );
}
