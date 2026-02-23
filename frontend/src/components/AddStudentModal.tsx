"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, User, Mail, Phone, Lock, Hash } from "lucide-react";
import Modal from "./Modal";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { validateEmail, validatePassword, validateName, validatePhone, validateDNI } from "@/lib/validations";

interface AddStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    student?: any; // If provided, the modal acts as an Edit modal
}

export default function AddStudentModal({ isOpen, onClose, onSuccess, student }: AddStudentModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        name: student?.name || "",
        lastname: student?.lastname || "",
        email: student?.email || "",
        password: "gymcontrol123", // Default for new, not used for edit
        phone: student?.phone || "",
        dni: student?.dni || ""
    });

    // Reset form when student changes or modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: student?.name || "",
                lastname: student?.lastname || "",
                email: student?.email || "",
                password: "gymcontrol123",
                phone: student?.phone || "",
                dni: student?.dni || ""
            });
            setError(null);
            setFieldErrors({});
        }
    }, [isOpen, student]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});

        // Validations
        const errors: Record<string, string> = {};
        if (!validateName(formData.name)) errors.name = "Nombre inválido";
        if (!validateName(formData.lastname)) errors.lastname = "Apellido inválido";
        if (!validateEmail(formData.email)) errors.email = "Email inválido";
        if (!validatePhone(formData.phone)) errors.phone = "Mínimo 8 dígitos";
        if (!validateDNI(formData.dni)) errors.dni = "DNI inválido (7-8 dígitos)";

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setIsLoading(true);
        try {
            if (student) {
                // Edit mode
                const { password, ...updateData } = formData;
                await api.put(`/profiles/${student.id}`, updateData);
            } else {
                // Create mode
                await api.post("/profiles/register", formData);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || "Error al procesar la solicitud.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={student ? "Editar Alumno" : "Nuevo Ingreso"}
            className="max-w-xl"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* ... existing fields ... */}
                {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-rose-500 text-xs font-bold">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Nombre</label>
                        <div className="relative group/input">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 group-focus-within/input:text-rose-500 transition-colors" />
                            <input
                                placeholder="Lionel"
                                className={cn("input-premium pl-12 text-sm", fieldErrors.name && "border-rose-500/50 bg-rose-500/5")}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        {fieldErrors.name && <p className="text-[9px] text-rose-500 font-bold ml-1">{fieldErrors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Apellido</label>
                        <div className="relative group/input">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 group-focus-within/input:text-rose-500 transition-colors" />
                            <input
                                placeholder="Messi"
                                className={cn("input-premium pl-12 text-sm", fieldErrors.lastname && "border-rose-500/50 bg-rose-500/5")}
                                value={formData.lastname}
                                onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                            />
                        </div>
                        {fieldErrors.lastname && <p className="text-[9px] text-rose-500 font-bold ml-1">{fieldErrors.lastname}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Email</label>
                    <div className="relative group/input">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 group-focus-within/input:text-rose-500 transition-colors" />
                        <input
                            placeholder="goats10@gmail.com"
                            className={cn("input-premium pl-12 text-sm", fieldErrors.email && "border-rose-500/50 bg-rose-500/5")}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    {fieldErrors.email && <p className="text-[9px] text-rose-500 font-bold ml-1">{fieldErrors.email}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Teléfono</label>
                        <div className="relative group/input">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 group-focus-within/input:text-rose-500 transition-colors" />
                            <input
                                placeholder="3416000123"
                                className={cn("input-premium pl-12 text-sm", fieldErrors.phone && "border-rose-500/50 bg-rose-500/5")}
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        {fieldErrors.phone && <p className="text-[9px] text-rose-500 font-bold ml-1">{fieldErrors.phone}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">DNI</label>
                        <div className="relative group/input">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 group-focus-within/input:text-rose-500 transition-colors" />
                            <input
                                placeholder="10101010"
                                className={cn("input-premium pl-12 text-sm", fieldErrors.dni && "border-rose-500/50 bg-rose-500/5")}
                                value={formData.dni}
                                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                            />
                        </div>
                        {fieldErrors.dni && <p className="text-[9px] text-rose-500 font-bold ml-1">{fieldErrors.dni}</p>}
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
                                Completar Registro <Plus className="h-4 w-4" />
                            </span>
                        )}
                    </button>
                    <p className="text-[9px] text-center text-neutral-600 font-bold uppercase tracking-widest mt-4 leading-relaxed">
                        El alumno recibirá un correo de bienvenida con su plan activo.
                    </p>
                </div>
            </form>
        </Modal>
    );
}
