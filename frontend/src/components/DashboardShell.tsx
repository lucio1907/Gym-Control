"use client";

import { useState } from "react";
import { Menu, X, Dumbbell, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import { useRouter } from "next/navigation";

interface DashboardShellProps {
    children: React.ReactNode;
    role?: "ADMIN" | "STUDENT";
    userName?: string;
}

export default function DashboardShell({ children, role = "STUDENT", userName }: DashboardShellProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();

    return (
        <div className="h-screen bg-[#050505] text-white flex overflow-hidden">
            {/* Desktop Sidebar (Permanent on LG+) */}
            <Sidebar role={role} userName={userName} />

            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Mobile Sidebar (Slide-in) */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
                    >
                        <Sidebar role={role} userName={userName} isMobile onMobileClose={() => setIsMobileMenuOpen(false)} />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Mobile Top Bar */}
                <header className="lg:hidden flex items-center justify-between p-4 glass border-b border-white/5 z-30">
                    <div className="flex items-center gap-2">
                        <Dumbbell className="h-6 w-6 text-rose-600" />
                        <span className="font-black text-lg tracking-tighter uppercase italic">
                            GYM <span className="text-rose-600">CONTROL</span>
                        </span>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 text-neutral-400"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </header>

                {/* Dynamic Background Glows */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-rose-900/5 blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-rose-900/5 blur-[120px]" />
                </div>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto px-4 py-8 md:px-8 md:py-12 lg:px-12 lg:py-16 selection:bg-rose-500/30 relative z-10">
                    <div className="max-w-[1600px] mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
