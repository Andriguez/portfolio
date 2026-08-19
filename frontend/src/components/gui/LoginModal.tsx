import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

export function LoginModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // TODO: replace with a real call once the backend exists, e.g.
        // const res = await fetch("/api/login", { method: "POST", body: JSON.stringify({ password }) });
        // the server sets an httpOnly cookie on success — never store a token in JS-readable storage
        await new Promise((r) => setTimeout(r, 500));
        setError("login isn't wired up yet — check back once the backend's live.");
        setLoading(false);
    }

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="login-modal-overlay" />
                <Dialog.Content className="login-modal-content">
                    <form onSubmit={handleSubmit}>
                        <div>
                            <input
                            type="password"
                            autoFocus
                            className="login-modal-input"
                            placeholder="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        </div>
                        <div className="login-modal-actions">
                            <button type="button" className="login-modal-cancel" onClick={() => onOpenChange(false)}>cancel</button>
                            <button type="submit" className="login-modal-submit" disabled={loading}>
                                {loading ? "checking..." : "log in"}
                            </button>
                        </div>
                    </form>
                    {error && <div className="login-modal-error">{error}</div>}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}