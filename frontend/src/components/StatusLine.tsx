import { useEffect, useState } from "react";

export function StatusLine({ booted }: { booted: boolean }) {
      const [uptimeSeconds, setUptimeSeconds] = useState(0);
      useEffect(() => { if (!booted) return; const i = setInterval(() => setUptimeSeconds(x => x + 1), 1000); return () => clearInterval(i); }, [booted]);
      return booted ? <div className="status-line">andi.sys — user: guest — uptime {formatUptime(uptimeSeconds)}</div> : null;
}

function formatUptime(total: number) {
        const h = Math.floor(total / 3600).toString().padStart(2, "0");
        const m = Math.floor((total % 3600) / 60).toString().padStart(2, "0");
        const s = Math.floor(total % 60).toString().padStart(2, "0");
        return `${h}:${m}:${s}`;
    }