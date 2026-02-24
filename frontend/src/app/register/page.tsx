"use client";

import { useState } from "react";
import { User, Mail, Lock, Phone, CreditCard, Loader2, ArrowLeft, Dumbbell, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { validateEmail, validateDNI, validatePhone, validatePassword, validateName } from "@/lib/validations";

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        lastname: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        dni: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let { name, value } = e.target;

        // Numeric filtering for DNI and Phone
        if (name === "dni" || name === "phone") {
            value = value.replace(/\D/g, "");
        }

        setFormData({ ...formData, [name]: value });
        if (fieldErrors[name]) {
            setFieldErrors({ ...fieldErrors, [name]: "" });
        }
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!validateName(formData.name)) errors.name = "Mínimo 2 caracteres";
        if (!validateName(formData.lastname)) errors.lastname = "Mínimo 2 caracteres";
        if (!validateEmail(formData.email)) errors.email = "Correo inválido";
        if (!validateDNI(formData.dni)) errors.dni = "DNI inválido (7-8 dígitos)";
        if (!validatePhone(formData.phone)) errors.phone = "Mínimo 10 dígitos";
        if (!validatePassword(formData.password)) errors.password = "Mínimo 8 caracteres";

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = "Las contraseñas no coinciden";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setError(null);

        try {
            // Remove confirmPassword before sending to API
            const { confirmPassword, ...submitData } = formData;
            await api.post("/profiles/register", submitData);
            setIsSuccess(true);
            setTimeout(() => router.push("/"), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Error al crear la cuenta. Verificá los datos.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#050505] px-6 py-12 selection:bg-rose-500/30">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-rose-900/10 blur-[130px]" />
                <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-rose-900/10 blur-[130px]" />
            </div>

            <main className="z-10 w-full max-w-xl">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-10"
                >
                    <a href="/" className="flex items-center gap-2 text-neutral-500 hover:text-rose-500 transition-all font-bold text-xs uppercase tracking-widest group">
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Volver al inicio
                    </a>
                </motion.div>

                <div className="mb-10 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-600 to-rose-700 shadow-xl shadow-rose-600/20"
                    >
                        <Dumbbell className="h-8 w-8 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-black tracking-tight text-white font-outfit uppercase">
                        Unite al <span className="text-rose-600 text-glow">Equipo</span>
                    </h1>
                    <p className="mt-2 text-neutral-400 font-medium text-sm tracking-wide">
                        Tu transformación personal empieza hoy
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-[2.5rem] p-8 sm:p-12"
                >
                    <AnimatePresence mode="wait">
                        {!isSuccess ? (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                onSubmit={handleSubmit}
                            >
                                {error && (
                                    <div className="col-span-full flex items-start gap-4 rounded-2xl bg-rose-500/10 p-5 border border-rose-500/20">
                                        <AlertCircle className="h-6 w-6 text-rose-500 shrink-0" />
                                        <p className="text-sm font-semibold text-rose-100 leading-snug">{error}</p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Nombre</label>
                                    <div className="relative group/input">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-600 group-focus-within/input:text-rose-500 transition-colors" />
                                        <input
                                            name="name"
                                            placeholder="Juan"
                                            className={cn(
                                                "input-premium pl-12 py-3.5 text-sm",
                                                fieldErrors.name && "border-rose-500/50 bg-rose-500/5"
                                            )}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {fieldErrors.name && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Apellido</label>
                                    <div className="relative group/input">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-600 group-focus-within/input:text-rose-500 transition-colors" />
                                        <input
                                            name="lastname"
                                            placeholder="Pérez"
                                            className={cn(
                                                "input-premium pl-12 py-3.5 text-sm",
                                                fieldErrors.lastname && "border-rose-500/50 bg-rose-500/5"
                                            )}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {fieldErrors.lastname && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.lastname}</p>}
                                </div>

                                <div className="col-span-full space-y-2">
                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Email</label>
                                    <div className="relative group/input">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-600 group-focus-within/input:text-rose-500 transition-colors" />
                                        <input
                                            name="email"
                                            type="email"
                                            placeholder="juan@ejemplo.com"
                                            className={cn(
                                                "input-premium pl-16 py-3.5 text-sm",
                                                fieldErrors.email && "border-rose-500/50 bg-rose-500/5"
                                            )}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {fieldErrors.email && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">DNI</label>
                                    <div className="relative group/input">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-600 group-focus-within/input:text-rose-500 transition-colors" />
                                        <input
                                            name="dni"
                                            placeholder="12345678"
                                            className={cn(
                                                "input-premium pl-16 py-3.5 text-sm",
                                                fieldErrors.dni && "border-rose-500/50 bg-rose-500/5"
                                            )}
                                            onChange={handleChange}
                                            value={formData.dni}
                                        />
                                    </div>
                                    {fieldErrors.dni && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.dni}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Teléfono</label>
                                    <div className="relative group/input">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-600 group-focus-within/input:text-rose-500 transition-colors" />
                                        <input
                                            name="phone"
                                            placeholder="11 2233 4455"
                                            className={cn(
                                                "input-premium pl-16 py-3.5 text-sm",
                                                fieldErrors.phone && "border-rose-500/50 bg-rose-500/5"
                                            )}
                                            onChange={handleChange}
                                            value={formData.phone}
                                        />
                                    </div>
                                    {fieldErrors.phone && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.phone}</p>}
                                </div>

                                <div className="col-span-full space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Contraseña</label>
                                        <div className="relative group/input">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-600 group-focus-within/input:text-rose-500 transition-colors" />
                                            <input
                                                name="password"
                                                type="password"
                                                placeholder="Mínimo 8 caracteres"
                                                className={cn(
                                                    "input-premium pl-16 py-3.5 text-sm",
                                                    fieldErrors.password && "border-rose-500/50 bg-rose-500/5"
                                                )}
                                                onChange={handleChange}
                                                value={formData.password}
                                            />
                                        </div>
                                        {fieldErrors.password && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.password}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Confirmar Contraseña</label>
                                        <div className="relative group/input">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-600 group-focus-within/input:text-rose-500 transition-colors" />
                                            <input
                                                name="confirmPassword"
                                                type="password"
                                                placeholder="Repetí tu contraseña"
                                                className={cn(
                                                    "input-premium pl-16 py-3.5 text-sm",
                                                    fieldErrors.confirmPassword && "border-rose-500/50 bg-rose-500/5"
                                                )}
                                                onChange={handleChange}
                                                value={formData.confirmPassword}
                                            />
                                        </div>
                                        {fieldErrors.confirmPassword && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.confirmPassword}</p>}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn-premium col-span-full py-4 text-sm mt-4 tracking-[0.2em]"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                                    ) : (
                                        "CREAR MI CUENTA"
                                    )}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center text-center py-12"
                            >
                                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
                                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                                </div>
                                <h3 className="text-2xl font-black text-white font-outfit uppercase">¡Bienvenido al team!</h3>
                                <p className="mt-4 text-neutral-400 font-medium">
                                    Tu cuenta fue creada con éxito. Redirigiendo al login...
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                <p className="mt-12 text-center text-[10px] font-black text-neutral-800 tracking-[0.4em] uppercase">
                    Gym Control © 2024
                </p>
            </main>
        </div>
    );
}
