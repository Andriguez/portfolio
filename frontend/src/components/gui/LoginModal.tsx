import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { useNavigate} from "react-router-dom";
import { apiFetch } from "../../api/client";

export function LoginModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"password" | "code">("password");
    const [code, setCode] = useState("");

    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const isCode = step === "code"

        const res = await apiFetch(isCode ? "/api/login/totp" : "/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(isCode ? { code } : { password }),
        });
        setLoading(false);

        if (!res.ok) {
            if (res.status === 429) setError("too many attempts!");
            else setError(isCode ? "wrong code." : "incorrect password.");

            if(isCode && res.status === 401) { setStep("password"); setCode(""); }
            return;
        }

        const data = await res.json();
        if (data.needs_totp) { 
            setPassword("");
            setStep("code");
            return;
        }
        onOpenChange(false);
        navigate("/admin");
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
                            { 
                                step === "code" && (
                                    <input
                                    type="numeric"
                                    autoFocus
                                    autoComplete="one-time-code"
                                    className="login-modal-input"
                                    placeholder="code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    />
                                )}
                            {
                                step !== "code" && (
                                <input
                                    type="password"
                                    autoFocus
                                    className="login-modal-input"
                                    placeholder="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            )}
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