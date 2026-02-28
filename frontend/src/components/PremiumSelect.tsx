"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
    id: string | number;
    label: string;
    sublabel?: string;
    icon?: React.ElementType;
}

interface PremiumSelectProps {
    options: Option[];
    value: string | number | undefined;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    className?: string;
}

export default function PremiumSelect({
    options,
    value,
    onChange,
    placeholder = "Seleccionar...",
    label,
    error,
    className
}: PremiumSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const selectedOption = options.find(opt => opt.id.toString() === value?.toString());

    const handleClose = useCallback(() => setIsOpen(false), []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                handleClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [handleClose]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === "Escape") handleClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, handleClose]);

    return (
        <div className={cn("space-y-2 relative w-full", className)} ref={containerRef}>
            {label && (
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "input-premium text-sm flex items-center justify-between group transition-all duration-300",
                    isOpen && "border-rose-500 ring-4 ring-rose-500/10",
                    error && "border-rose-500/50 bg-rose-500/5"
                )}
            >
                <div className="flex items-center gap-3 truncate">
                    {selectedOption ? (
                        <>
                            {selectedOption.icon && <selectedOption.icon className="h-4 w-4 text-rose-500" />}
                            <span className="text-white font-bold italic">{selectedOption.label}</span>
                        </>
                    ) : (
                        <span className="text-neutral-600 font-medium italic">{placeholder}</span>
                    )}
                </div>
                <ChevronDown className={cn(
                    "h-4 w-4 text-neutral-600 transition-transform duration-500 group-hover:text-rose-500",
                    isOpen && "rotate-180 text-rose-500"
                )} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 5, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.1 } }}
                        className="absolute z-[100] w-full mt-1 bg-[#0a0a0a] backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
                    >
                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-2">
                            {options.length > 0 ? (
                                options.map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => {
                                            onChange(option.id.toString());
                                            handleClose();
                                        }}
                                        className={cn(
                                            "w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 text-left group/opt",
                                            value?.toString() === option.id.toString()
                                                ? "bg-rose-600/10 border border-rose-500/20"
                                                : "hover:bg-white/5 border border-transparent"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {option.icon && (
                                                <div className={cn(
                                                    "h-8 w-8 rounded-xl flex items-center justify-center transition-colors",
                                                    value?.toString() === option.id.toString() ? "bg-rose-600/20" : "bg-white/5 group-hover/opt:bg-rose-600/10"
                                                )}>
                                                    <option.icon className={cn(
                                                        "h-4 w-4",
                                                        value?.toString() === option.id.toString() ? "text-rose-500" : "text-neutral-500"
                                                    )} />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className={cn(
                                                    "text-xs font-black uppercase italic tracking-tight truncate",
                                                    value?.toString() === option.id.toString() ? "text-rose-500" : "text-white group-hover/opt:text-rose-500"
                                                )}>
                                                    {option.label}
                                                </p>
                                                {option.sublabel && (
                                                    <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mt-0.5 truncate group-hover/opt:text-neutral-400">
                                                        {option.sublabel}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {value?.toString() === option.id.toString() && (
                                            <div className="h-6 w-6 rounded-full bg-rose-600 flex items-center justify-center animate-in zoom-in duration-300">
                                                <Check className="h-3 w-3 text-white" strokeWidth={4} />
                                            </div>
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="p-8 text-center space-y-2">
                                    <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest italic">Sin opciones disponibles</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <motion.p
                    initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                    className="text-[9px] text-rose-500 font-bold ml-1 mt-1 uppercase"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
}
