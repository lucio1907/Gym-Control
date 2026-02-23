"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import api from "@/lib/api";
import { User, Shield, Loader2, Save, Key, Mail, Phone, CreditCard, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    // Profile State
    const [profile, setProfile] = useState<any>(null);
    const [profileForm, setProfileForm] = useState({
        name: "",
        lastname: "",
        phone: "",
        dni: ""
    });

    // Password State
    const [passwords, setPasswords] = useState({
        currentPass: "",
        newPass: ""
    });

    const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);

    const fetchProfile = async () => {
        try {
            const res = await api.get("/profiles/me");
            const pData = res.data.data;
            setProfile(pData);
            setProfileForm({
                name: pData.name || "",
                lastname: pData.lastname || "",
                phone: pData.phone || "",
                dni: pData.dni || ""
            });
        } catch (err) {
            console.error("Error fetching profile data", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const showMessage = (text: string, type: "success" | "error") => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        setIsSaving(true);
        try {
            await api.put(`/profiles/${profile.id}`, profileForm);
            showMessage("Perfil actualizado correctamente.", "success");
            setProfile({ ...profile, ...profileForm });
        } catch (err: any) {
            console.error(err);
            showMessage(err.response?.data?.message || "Error al actualizar perfil.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwords.currentPass || !passwords.newPass) {
            showMessage("Completá ambos campos.", "error");
            return;
        }
        setIsSavingPassword(true);
        try {
            await api.put("/profiles/change-password", passwords);
            showMessage("Contraseña actualizada con éxito.", "success");
            setPasswords({ currentPass: "", newPass: "" });
        } catch (err: any) {
            console.error(err);
            showMessage(err.response?.data?.message || "Error al cambiar la contraseña.", "error");
        } finally {
            setIsSavingPassword(false);
        }
    };

    return (
        <DashboardShell role="STUDENT">
            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 lg:mb-16 mt-4 lg:mt-8"
            >
                <div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter font-outfit uppercase italic leading-[0.9]">
                        Mi <span className="text-rose-600">Perfil</span>
                    </h1>
                    <p className="text-neutral-500 font-bold tracking-[0.2em] uppercase text-[10px] sm:text-xs lg:text-sm mt-3 lg:mt-5 max-w-xl">
                        Gestioná tu cuenta y preferencias de acceso
                    </p>
                </div>
            </motion.header>

            {/* Global Toast Message */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={cn(
                            "fixed top-6 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl flex items-center gap-3 font-bold text-xs uppercase tracking-widest shadow-2xl z-50 border backdrop-blur-md",
                            message.type === "success"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        )}
                    >
                        {message.text}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-12">

                {/* User Info Card (Left Column) */}
                <div className="col-span-1 lg:col-span-4 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card rounded-[2.5rem] p-8 border-white/5 relative overflow-hidden group"
                    >
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-110"></div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="h-28 w-28 lg:h-32 lg:w-32 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border-4 border-white/5 flex items-center justify-center font-black text-3xl lg:text-4xl text-neutral-300 shadow-2xl mb-6 relative group-hover:border-rose-500/20 transition-colors">
                                {profile ? `${profile.name?.[0] || ""}${profile.lastname?.[0] || ""}` : <User className="h-10 w-10 text-neutral-500" />}

                                {profile?.rol === "admin" && (
                                    <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-rose-600 rounded-full border-4 border-[#09090b] flex items-center justify-center">
                                        <Shield className="h-4 w-4 text-white fill-white" />
                                    </div>
                                )}
                            </div>

                            <h2 className="text-2xl font-black font-outfit uppercase tracking-tighter w-full truncate">
                                {profile ? `${profile.name} ${profile.lastname}` : "Cargando..."}
                            </h2>
                            <p className="text-[10px] font-bold tracking-[0.2em] text-neutral-400 uppercase mt-2 bg-white/5 px-4 py-1.5 rounded-full inline-block">
                                {profile?.rol === "admin" ? "Administrador" : "Alumno General"}
                            </p>

                            <div className="w-full mt-8 pt-8 border-t border-white/5 text-left space-y-4">
                                <div className="flex items-center gap-4 group/item">
                                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover/item:bg-white/10 transition-colors">
                                        <Mail className="h-4 w-4 text-neutral-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Email (Solo Lectura)</p>
                                        <p className="text-sm font-medium text-white truncate">{profile?.email || "Cargando..."}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group/item">
                                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover/item:bg-rose-500/10 transition-colors">
                                        <CreditCard className="h-4 w-4 text-neutral-400 group-hover/item:text-rose-500 transition-colors" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Documento</p>
                                        <p className="text-sm font-mono tracking-wider text-white truncate">{profile?.dni || "Cargando..."}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Forms Area (Right Column) */}
                <div className="col-span-1 lg:col-span-8 space-y-8">

                    {/* Data Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-[2.5rem] lg:rounded-[3rem] p-8 lg:p-12 border-white/5 relative"
                    >
                        <div className="mb-8 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                                <User className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl lg:text-2xl font-black font-outfit uppercase tracking-tighter italic">Datos Personales</h3>
                                <p className="text-neutral-500 text-[10px] md:text-xs font-medium mt-1">Modificá tu información de contacto</p>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="py-20 flex justify-center">
                                <Loader2 className="h-10 w-10 text-rose-600 animate-spin" />
                            </div>
                        ) : (
                            <form onSubmit={handleSaveProfile} className="space-y-6 max-w-3xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-white">
                                            Nombre
                                        </label>
                                        <input
                                            type="text"
                                            className="input-premium w-full text-base py-4"
                                            value={profileForm.name}
                                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-white">
                                            Apellido
                                        </label>
                                        <input
                                            type="text"
                                            className="input-premium w-full text-base py-4"
                                            value={profileForm.lastname}
                                            onChange={(e) => setProfileForm({ ...profileForm, lastname: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-white">
                                            Teléfono
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                                            <input
                                                type="tel"
                                                className="input-premium w-full text-base py-4 pl-12"
                                                value={profileForm.phone}
                                                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-white">
                                            DNI / Documento
                                        </label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                                            <input
                                                type="text"
                                                className="input-premium w-full text-base py-4 pl-12 font-mono tracking-wider"
                                                value={profileForm.dni}
                                                onChange={(e) => setProfileForm({ ...profileForm, dni: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 sm:pt-8 flex justify-end border-t border-white/5 mt-8">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="btn-premium px-8 py-4 text-[10px] tracking-widest w-full sm:w-auto"
                                    >
                                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : <span className="flex items-center gap-2"><Save className="h-4 w-4" /> Guardar Cambios</span>}
                                    </button>
                                </div>
                            </form>
                        )}
                    </motion.div>

                    {/* Security Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card rounded-[2.5rem] lg:rounded-[3rem] p-8 lg:p-12 border-rose-500/10 bg-rose-500/[0.02]"
                    >
                        <div className="mb-8 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                                <Key className="h-5 w-5 text-rose-500" />
                            </div>
                            <div>
                                <h3 className="text-xl lg:text-2xl font-black font-outfit uppercase tracking-tighter italic text-white/90">Seguridad</h3>
                                <p className="text-neutral-500 text-[10px] md:text-xs font-medium mt-1">Protección de acceso a tu cuenta</p>
                            </div>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-6 max-w-3xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-black text-rose-500/60 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-rose-500">
                                        Contraseña Actual
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Ingresá tu clave actual"
                                        className="input-premium w-full text-base py-4 placeholder:text-neutral-600 focus:bg-rose-500/5 focus:border-rose-500/30"
                                        value={passwords.currentPass}
                                        onChange={(e) => setPasswords({ ...passwords, currentPass: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-black text-rose-500/60 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-rose-500">
                                        Nueva Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Ingresá tu nueva clave"
                                        className="input-premium w-full text-base py-4 placeholder:text-neutral-600 focus:bg-rose-500/5 focus:border-rose-500/30"
                                        value={passwords.newPass}
                                        onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 sm:pt-8 flex justify-end border-t border-rose-500/10 mt-8">
                                <button
                                    type="submit"
                                    disabled={isSavingPassword}
                                    className="px-8 py-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-rose-500/20 disabled:opacity-50 disabled:pointer-events-none w-full sm:w-auto"
                                >
                                    {isSavingPassword ? (
                                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                    ) : (
                                        <span className="flex items-center gap-2"><Key className="h-4 w-4" /> Actualizar Clave</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>

            </div>
        </DashboardShell>
    );
}
