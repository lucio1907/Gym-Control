"use client";

import { LogOut, LayoutDashboard, User, Dumbbell, Activity, Users, CreditCard, Settings, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import api from "@/lib/api";

interface SidebarProps {
    role?: "ADMIN" | "STUDENT";
    userName?: string;
    isMobile?: boolean;
    onMobileClose?: () => void;
}

export default function Sidebar({ role = "STUDENT", userName, isMobile, onMobileClose }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        try {
            await api.post("/profiles/logout");
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            router.push("/");
        }
    };

    const studentLinks = [
        { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
        { label: "Mi Perfil", icon: User, href: "/profile" },
        { label: "Mi Progreso", icon: Activity, href: "/progress" },
    ];

    const adminLinks = [
        { label: "Resumen Hub", icon: LayoutDashboard, href: "/admin" },
        { label: "Alumnos", icon: Users, href: "/admin/students" },
        { label: "Pagos y Caja", icon: CreditCard, href: "/admin/payments" },
        { label: "Configuración", icon: Settings, href: "/admin/settings" },
    ];

    const activeLinks = role === "ADMIN" ? adminLinks : studentLinks;

    const navigate = (href: string) => {
        router.push(href);
        if (isMobile && onMobileClose) {
            onMobileClose();
        }
    };

    return (
        <aside className={cn(
            "h-screen sticky top-0 glass flex flex-col p-8 space-y-10 transition-all duration-300",
            isMobile ? "w-full border-r-0" : "w-72 border-r border-white/5 hidden lg:flex"
        )}>
            <div className="flex items-center justify-between gap-3 px-2">
                <div className="flex items-center gap-3">
                    <Dumbbell className="h-9 w-9 text-rose-600" />
                    <span className="font-black text-2xl tracking-tighter uppercase italic text-white leading-none">
                        GYM <span className="text-rose-600">CONTROL</span>
                    </span>
                </div>
                {isMobile && (
                    <button
                        onClick={onMobileClose}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 text-neutral-500 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            <nav className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
                <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] ml-4 mb-4">
                    {role === "ADMIN" ? "Administración" : "Panel de Alumno"}
                </p>
                {activeLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <button
                            key={link.href}
                            onClick={() => navigate(link.href)}
                            className={cn(
                                "flex items-center gap-4 w-full p-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all group relative overflow-hidden",
                                isActive
                                    ? "bg-rose-600/10 text-rose-500"
                                    : "text-neutral-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <link.icon className={cn("h-5 w-5", isActive ? "text-rose-500" : "group-hover:text-rose-500 transition-colors")} />
                            {link.label}
                            {isActive && (
                                <motion.div
                                    layoutId={isMobile ? "sidebar-active-mobile" : "sidebar-active-desktop"}
                                    className="absolute left-0 w-1 h-6 bg-rose-600 rounded-r-full"
                                />
                            )}
                        </button>
                    );
                })}
            </nav>

            <div className="pt-10 border-t border-white/5">
                <div className="mb-6 px-4">
                    <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest leading-none mb-1">Usuario Activo</p>
                    <p className="text-xs font-black text-white truncate italic">{userName || (role === 'ADMIN' ? 'Administrador' : 'Alumno')}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 w-full p-4 rounded-2xl text-neutral-600 hover:text-rose-500 transition-all font-black text-xs uppercase tracking-widest group"
                >
                    <LogOut className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
}
