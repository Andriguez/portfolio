import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { useNavigate} from "react-router-dom";

export function LoginModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const res = await fetch("http://localhost:8000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ password }),
        });
        if (!res.ok) {
            setError("incorrect password.");
        } else {
            onOpenChange(false);
            navigate("/admin");
        }
        setLoading(false);
    }

    function handleCancel() {
        setPassword("");
        setError(null);
        setLoading(false);
        onOpenChange(false);
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
                            <button type="button" className="login-modal-cancel" onClick={handleCancel}>cancel</button>
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