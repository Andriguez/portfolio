import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export function InfoDialog({ open, onOpenChange, title, children }: {
    open: boolean; onOpenChange: (open: boolean) => void; title: string; children: ReactNode;
}) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="login-modal-overlay" />
                <Dialog.Content className="login-modal-content info-modal-content" aria-describedby={undefined}>
                    <div className="info-modal-header">
                        <Dialog.Title className="login-modal-title">{title}</Dialog.Title>
                        <Dialog.Close className="info-modal-close" aria-label="close"><X size={14} /></Dialog.Close>
                    </div>
                    <div className="info-modal-body themed-scrollbar">{children}</div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}