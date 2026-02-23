"use client";

import { useState, Suspense } from "react";
import { Lock, Loader2, CheckCircle2, Dumbbell, AlertCircle, ArrowLeft } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { validatePassword } from "@/lib/validations";
import { cn } from "@/lib/utils";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const errors: Record<string, string> = {};
        if (!validatePassword(password)) errors.password = "Mínimo 8 caracteres";
        if (password !== confirmPassword) errors.confirmPassword = "Las contraseñas no coinciden";

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        if (!token) {
            setError("Token de recuperación no válido o inexistente.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setFieldErrors({});

        try {
            await api.post("/profiles/reset-password", {
                token,
                newPassword: password,
            });
            setIsSuccess(true);
            setTimeout(() => router.push("/"), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Error al restablecer la contraseña.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!token && !isSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card rounded-[2.5rem] p-12 text-center space-y-8"
            >
                <AlertCircle className="h-16 w-16 text-rose-500 mx-auto" />
                <div>
                    <h3 className="text-xl font-black text-white font-outfit uppercase">Enlace Inválido</h3>
                    <p className="text-neutral-500 text-sm mt-3 font-medium">
                        El enlace de recuperación ya no es válido o está incompleto.
                    </p>
                </div>
                <button onClick={() => router.push("/")} className="btn-premium w-full py-4 tracking-widest text-xs">
                    VOLVER AL INICIO
                </button>
            </motion.div>
        );
    }

    return (
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
                        className="space-y-8"
                        onSubmit={handleSubmit}
                    >
                        {error && (
                            <div className="flex items-start gap-4 rounded-2xl bg-rose-500/10 p-5 border border-rose-500/20">
                                <AlertCircle className="h-6 w-6 text-rose-500 shrink-0" />
                                <p className="text-sm font-semibold text-rose-100 leading-snug">{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <label className="text-xs font-black text-neutral-500 uppercase tracking-widest ml-1">
                                Nueva Contraseña
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-600 group-focus-within:text-rose-500 transition-colors" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className={cn(
                                        "input-premium pl-16",
                                        fieldErrors.password && "border-rose-500/50 bg-rose-500/5"
                                    )}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: "" });
                                    }}
                                />
                            </div>
                            {fieldErrors.password && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.password}</p>}
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-black text-neutral-500 uppercase tracking-widest ml-1">
                                Confirmar Contraseña
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-600 group-focus-within:text-rose-500 transition-colors" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className={cn(
                                        "input-premium pl-16",
                                        fieldErrors.confirmPassword && "border-rose-500/50 bg-rose-500/5"
                                    )}
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: "" });
                                    }}
                                />
                            </div>
                            {fieldErrors.confirmPassword && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.confirmPassword}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-premium w-full py-4 tracking-widest text-xs"
                        >
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "ACTUALIZAR CONTRASEÑA"}
                        </button>
                    </motion.form>
                ) : (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center text-center py-6"
                    >
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
                            <CheckCircle2 className="h-10 w-10 text-green-500" />
                        </div>
                        <h3 className="text-2xl font-black text-white font-outfit uppercase">¡Listo!</h3>
                        <p className="mt-4 text-neutral-400 font-medium">
                            Tu contraseña se actualizó con éxito. Redirigiendo...
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#050505] px-6 selection:bg-rose-500/30">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-rose-900/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-rose-900/10 blur-[120px]" />
            </div>

            <main className="z-10 w-full max-w-md">
                <div className="mb-10 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-600 to-rose-700 shadow-xl shadow-rose-600/20"
                    >
                        <Dumbbell className="h-8 w-8 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-black tracking-tight text-white font-outfit uppercase">
                        Nueva <span className="text-rose-600 text-glow">Clave</span>
                    </h1>
                </div>

                <Suspense fallback={
                    <div className="glass-card rounded-[2.5rem] p-16 flex flex-col items-center gap-6">
                        <Loader2 className="animate-spin text-rose-600 h-12 w-12" />
                        <p className="text-neutral-500 font-black tracking-widest text-[10px] uppercase">Preparando entorno...</p>
                    </div>
                }>
                    <ResetPasswordForm />
                </Suspense>

                <p className="mt-12 text-center text-[10px] font-black text-neutral-800 tracking-[0.4em] uppercase">
                    Gym Control © 2024
                </p>
            </main>
        </div>
    );
}
