import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { apiFetch } from "../../api/client";

export function SecurityPanel() {
    const [enabled, setEnabled] = useState<boolean | null>(null);
    const [setup, setSetup] = useState<{ uri: string; secret: string } | null>(null);
    const [code, setCode] = useState("");
    const [recovery, setRecovery] = useState<string[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        apiFetch("/api/2fa/status").then((r) => r.ok && r.json()).then((d) => d && setEnabled(d.enabled));
    }, []);

    async function start() {
        setError(null);
        const res = await apiFetch("/api/2fa/setup", { method: "POST" });
        if (res.ok) setSetup(await res.json());
        else setError("couldn't start setup");
    }

    async function confirm() {
        setError(null);
        const res = await apiFetch("/api/2fa/enable", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
        });
        if (!res.ok) { setError("wrong code, try the next one"); return; }
        setRecovery((await res.json()).recovery_codes);
        setSetup(null);
        setCode("");
        setEnabled(true);
    }

    return (
        <div className="admin-section">
            <div className="admin-header"><h2>SECURITY</h2></div>
            {error && <div className="admin-error">{error}</div>}

            {enabled === false && !setup && <button onClick={start}>set up two-factor login</button>}
            {enabled && !recovery && <div className="admin-count">two-factor login is on.</div>}

            {setup && (
                <div className="admin-inline-form">
                    <QRCodeSVG value={setup.uri} size={160} bgColor="#ffffff" fgColor="#000000" includeMargin />
                    <div>
                        <p className="admin-count">scan with your authenticator app, or type this key: <code>{setup.secret}</code></p>
                        <input placeholder="6-digit code" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} />
                        <button onClick={confirm}>confirm</button>
                    </div>
                </div>
            )}

            {recovery && (
                <div className="admin-error">
                    <strong>save these recovery codes now, they won't be shown again:</strong>
                    <pre>{recovery.join("\n")}</pre>
                    <button onClick={() => setRecovery(null)}>i saved them</button>
                </div>
            )}
        </div>
    );
}