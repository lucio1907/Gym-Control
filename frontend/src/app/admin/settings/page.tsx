"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import api from "@/lib/api";
import { User, Building2, Bell, Shield, Download, Trash2, Loader2, Save, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Tab = "PROFILE" | "GYM" | "NOTIFICATIONS" | "SECURITY";

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("PROFILE");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Admin Profile State
    const [adminProfile, setAdminProfile] = useState<any>(null);
    const [profileForm, setProfileForm] = useState({
        name: "",
        lastname: "",
        email: "",
        phone: "",
        dni: ""
    });

    // Settings State
    const [settingsForm, setSettingsForm] = useState({
        gym_name: "Gym Control",
        currency: "ARS",
        base_fee: "15000",
        notif_payment_reminder: true,
        notif_debt_alert: true,
        notif_routine_update: true
    });

    // Password State
    const [passwords, setPasswords] = useState({
        currentPass: "",
        newPass: ""
    });

    const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);

    const fetchData = async () => {
        try {
            const [profileRes, settingsRes] = await Promise.all([
                api.get("/profiles/me"),
                api.get("/settings")
            ]);

            const pData = profileRes.data.data;
            setAdminProfile(pData);
            setProfileForm({
                name: pData.name || "",
                lastname: pData.lastname || "",
                email: pData.email || "",
                phone: pData.phone || "",
                dni: pData.dni || ""
            });

            const sData = settingsRes?.data?.data;
            if (sData) {
                setSettingsForm({
                    gym_name: sData.gym_name || "Gym Control",
                    currency: sData.currency || "ARS",
                    base_fee: sData.base_fee?.toString() || "15000",
                    notif_payment_reminder: sData.notif_payment_reminder ?? true,
                    notif_debt_alert: sData.notif_debt_alert ?? true,
                    notif_routine_update: sData.notif_routine_update ?? true
                });
            }
        } catch (err) {
            console.error("Error fetching data", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const showMessage = (text: string, type: "success" | "error") => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!adminProfile) return;

        setIsSaving(true);
        try {
            await api.put(`/profiles/${adminProfile.id}`, profileForm);
            showMessage("Perfil actualizado correctamente.", "success");
            // Update local state just in case
            setAdminProfile({ ...adminProfile, ...profileForm });
        } catch (err: any) {
            console.error(err);
            showMessage(err.response?.data?.message || "Error al actualizar perfil.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.put("/settings", {
                ...settingsForm,
                base_fee: Number(settingsForm.base_fee)
            });
            showMessage("Ajustes guardados correctamente.", "success");
        } catch (err: any) {
            console.error(err);
            showMessage(err.response?.data?.message || "Error al guardar ajustes.", "error");
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
        setIsSaving(true);
        try {
            await api.put("/profiles/change-password", passwords);
            showMessage("Contraseña actualizada con éxito.", "success");
            setPasswords({ currentPass: "", newPass: "" });
        } catch (err: any) {
            console.error(err);
            showMessage(err.response?.data?.message || "Error al cambiar la contraseña.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: "PROFILE", label: "Mi Perfil", icon: User },
        { id: "GYM", label: "Gimnasio", icon: Building2 },
        { id: "NOTIFICATIONS", label: "Notificaciones", icon: Bell },
        { id: "SECURITY", label: "Seguridad", icon: Shield },
    ];

    return (
        <DashboardShell role="ADMIN">
            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-8"
            >
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter font-outfit uppercase italic leading-[0.9]">
                        Ajustes del <span className="text-rose-600">Sistema</span>
                    </h1>
                    <p className="text-neutral-500 font-bold tracking-[0.2em] uppercase text-[9px] md:text-[10px]">
                        Configuración global y preferencias de cuenta
                    </p>
                </div>
            </motion.header>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Navigation Sidebar */}
                <div className="w-full lg:w-64 shrink-0 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={cn(
                                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest text-left",
                                activeTab === tab.id
                                    ? "bg-rose-600/10 text-rose-500 border border-rose-500/20"
                                    : "bg-white/5 border border-transparent text-neutral-400 hover:text-white hover:bg-white/10"
                            )}
                        >
                            <tab.icon className="h-5 w-5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    <div className="glass-card rounded-[3rem] p-8 md:p-12 border-white/5 relative min-h-[500px]">

                        {/* Global Toast Message */}
                        <AnimatePresence>
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className={cn(
                                        "absolute top-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl flex items-center gap-3 font-bold text-xs uppercase tracking-widest shadow-2xl z-50 border",
                                        message.type === "success"
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                    )}
                                >
                                    {message.text}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {isLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="h-10 w-10 text-rose-600 animate-spin" />
                            </div>
                        ) : (
                            <AnimatePresence mode="wait">
                                {activeTab === "PROFILE" && (
                                    <motion.div
                                        key="PROFILE"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="mb-8">
                                            <h2 className="text-2xl font-black font-outfit uppercase tracking-tighter italic mb-2">Mi Perfil</h2>
                                            <p className="text-neutral-500 text-sm font-medium">Actualizá tus datos personales de administrador.</p>
                                        </div>

                                        <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Nombre</label>
                                                    <input
                                                        type="text"
                                                        className="input-premium"
                                                        value={profileForm.name}
                                                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Apellido</label>
                                                    <input
                                                        type="text"
                                                        className="input-premium"
                                                        value={profileForm.lastname}
                                                        onChange={(e) => setProfileForm({ ...profileForm, lastname: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Correo Electrónico</label>
                                                <input
                                                    type="email"
                                                    className="input-premium"
                                                    value={profileForm.email}
                                                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Teléfono</label>
                                                    <input
                                                        type="text"
                                                        className="input-premium"
                                                        value={profileForm.phone}
                                                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">DNI</label>
                                                    <input
                                                        type="text"
                                                        className="input-premium"
                                                        value={profileForm.dni}
                                                        onChange={(e) => setProfileForm({ ...profileForm, dni: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-6">
                                                <button
                                                    type="submit"
                                                    disabled={isSaving}
                                                    className="btn-premium px-8 py-4 text-[10px]"
                                                >
                                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Guardar Cambios</>}
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}

                                {activeTab === "GYM" && (
                                    <motion.div
                                        key="GYM"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="mb-8">
                                            <h2 className="text-2xl font-black font-outfit uppercase tracking-tighter italic mb-2">Configuración del Gimnasio</h2>
                                            <p className="text-neutral-500 text-sm font-medium">Parámetros generales de facturación y visualización.</p>
                                        </div>

                                        <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Nombre Comercial</label>
                                                <input
                                                    type="text"
                                                    className="input-premium text-white"
                                                    value={settingsForm.gym_name}
                                                    onChange={(e) => setSettingsForm({ ...settingsForm, gym_name: e.target.value })}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Moneda Principal</label>
                                                    <select
                                                        className="input-premium appearance-none text-white"
                                                        value={settingsForm.currency}
                                                        onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value as "ARS" | "USD" })}
                                                    >
                                                        <option value="ARS">ARS ($)</option>
                                                        <option value="USD">USD (US$)</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Cuota Base Por Defecto</label>
                                                    <input
                                                        type="number"
                                                        className="input-premium text-white"
                                                        value={settingsForm.base_fee}
                                                        onChange={(e) => setSettingsForm({ ...settingsForm, base_fee: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-6">
                                                <button
                                                    type="submit"
                                                    disabled={isSaving}
                                                    className="btn-premium px-8 py-4 text-[10px]"
                                                >
                                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Guardar Ajustes</>}
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}

                                {activeTab === "NOTIFICATIONS" && (
                                    <motion.div
                                        key="NOTIFICATIONS"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="mb-8">
                                            <h2 className="text-2xl font-black font-outfit uppercase tracking-tighter italic mb-2">Notificaciones Automáticas</h2>
                                            <p className="text-neutral-500 text-sm font-medium">Gestión de alertas y recordatorios para alumnos.</p>
                                        </div>

                                        <div className="space-y-4 max-w-2xl">
                                            {[
                                                { id: "notif_payment_reminder", title: "Recordatorio de Pago", desc: "Avisar 3 días antes del vencimiento.", checked: settingsForm.notif_payment_reminder },
                                                { id: "notif_debt_alert", title: "Alerta de Deuda", desc: "Enviar mail al día siguiente del vencimiento.", checked: settingsForm.notif_debt_alert },
                                                { id: "notif_routine_update", title: "Actualización de Rutina", desc: "Notificar cuando el admin edita un plan.", checked: settingsForm.notif_routine_update }
                                            ].map((notif) => (
                                                <div key={notif.id} className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                                    <div className="pr-4">
                                                        <h4 className="text-sm font-black text-white uppercase italic">{notif.title}</h4>
                                                        <p className="text-xs text-neutral-500 font-medium mt-1">{notif.desc}</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            checked={notif.checked}
                                                            onChange={(e) => setSettingsForm({ ...settingsForm, [notif.id]: e.target.checked })}
                                                        />
                                                        <div className="w-14 h-7 bg-neutral-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                                                    </label>
                                                </div>
                                            ))}

                                            <div className="pt-6">
                                                <button
                                                    type="button"
                                                    onClick={handleSaveSettings}
                                                    disabled={isSaving}
                                                    className="btn-premium px-8 py-4 text-[10px]"
                                                >
                                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Guardar Preferencias</>}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === "SECURITY" && (
                                    <motion.div
                                        key="SECURITY"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="mb-8">
                                            <h2 className="text-2xl font-black font-outfit uppercase tracking-tighter italic mb-2 text-rose-500">Zona de Seguridad</h2>
                                            <p className="text-neutral-500 text-sm font-medium">Contraseñas y gestión de datos sensibles.</p>
                                        </div>

                                        <div className="space-y-8 max-w-2xl">
                                            {/* Password Change */}
                                            <div className="p-8 rounded-3xl bg-white/5 border border-white/5">
                                                <h3 className="text-lg font-black uppercase italic mb-6">Cambiar Contraseña</h3>
                                                <form onSubmit={handleChangePassword} className="space-y-4">
                                                    <div className="space-y-2">
                                                        <input
                                                            type="password"
                                                            placeholder="Contraseña Actual"
                                                            className="input-premium"
                                                            value={passwords.currentPass}
                                                            onChange={(e) => setPasswords({ ...passwords, currentPass: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <input
                                                            type="password"
                                                            placeholder="Nueva Contraseña"
                                                            className="input-premium"
                                                            value={passwords.newPass}
                                                            onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                                                        />
                                                    </div>
                                                    <button type="submit" disabled={isSaving} className="px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest transition-colors mt-2">
                                                        {isSaving ? "ACTUALIZANDO..." : "ACTUALIZAR CLAVE"}
                                                    </button>
                                                </form>
                                            </div>

                                            {/* Danger Zone */}
                                            <div className="p-8 rounded-3xl bg-rose-500/5 border border-rose-500/20">
                                                <h3 className="text-lg font-black uppercase italic text-rose-500 mb-6">Acciones Peligrosas</h3>

                                                <div className="space-y-4">
                                                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pb-4 border-b border-rose-500/10">
                                                        <div>
                                                            <p className="text-sm font-bold text-white uppercase">Cerrar Sesión Activa</p>
                                                            <p className="text-xs text-neutral-500">Desconectar este dispositivo del sistema.</p>
                                                        </div>
                                                        <button
                                                            onClick={async () => {
                                                                await api.post("/profiles/logout");
                                                                window.location.href = "/";
                                                            }}
                                                            className="px-6 py-3 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors shrink-0 flex items-center gap-2"
                                                        >
                                                            <LogOut className="h-3 w-3" /> Salir
                                                        </button>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pt-2">
                                                        <div>
                                                            <p className="text-sm font-bold text-white uppercase">Exportar Base de Datos</p>
                                                            <p className="text-xs text-neutral-500">Descargar CSV de alumnos y pagos (Demo).</p>
                                                        </div>
                                                        <button
                                                            onClick={() => showMessage("La exportación de base de datos no está disponible en esta versión.", "error")}
                                                            className="px-6 py-3 rounded-xl border border-white/10 text-neutral-400 hover:text-white hover:border-white/30 text-[10px] font-black uppercase tracking-widest transition-colors shrink-0 flex items-center gap-2"
                                                        >
                                                            <Download className="h-3 w-3" /> Exportar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
