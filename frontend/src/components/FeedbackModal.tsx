"use client";

import { CheckCircle2, XCircle, HelpCircle, Loader2 } from "lucide-react";
import Modal from "./Modal";
import { cn } from "@/lib/utils";

export type FeedbackType = "success" | "error" | "confirm";

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    type: FeedbackType;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
}

export default function FeedbackModal({
    isOpen,
    onClose,
    onConfirm,
    type,
    title,
    message,
    confirmText = "Aceptar",
    cancelText = "Cancelar",
    isLoading = false
}: FeedbackModalProps) {
    const configs = {
        success: {
            icon: CheckCircle2,
            colorClass: "text-emerald-500",
            bgClass: "bg-emerald-500/10",
            borderClass: "border-emerald-500/20",
            buttonClass: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
        },
        error: {
            icon: XCircle,
            colorClass: "text-rose-500",
            bgClass: "bg-rose-500/10",
            borderClass: "border-rose-500/20",
            buttonClass: "bg-rose-600 hover:bg-rose-500 shadow-rose-600/20"
        },
        confirm: {
            icon: HelpCircle,
            colorClass: "text-blue-500",
            bgClass: "bg-blue-500/10",
            borderClass: "border-blue-500/20",
            buttonClass: "bg-rose-600 hover:bg-rose-500 shadow-rose-600/20" // Consistency with app primary action
        }
    };

    const config = configs[type];
    const Icon = config.icon;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} className="max-w-md">
            <div className="space-y-8">
                <div className={cn("flex items-start gap-4 p-6 rounded-3xl border", config.bgClass, config.borderClass)}>
                    <div className={cn("p-3 rounded-2xl", config.bgClass, config.colorClass)}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-bold text-white uppercase tracking-tight">Información</p>
                        <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                            {message}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    {type === "confirm" && (
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-neutral-400 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (onConfirm) {
                                onConfirm();
                            } else {
                                onClose();
                            }
                        }}
                        disabled={isLoading}
                        className={cn(
                            "flex-1 px-8 py-4 rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-3",
                            config.buttonClass
                        )}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
