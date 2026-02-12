import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Filter } from "lucide-react";
import { useAppState, AuditEvent } from "@/context/AppContext";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusColors: Record<string, string> = {
  success: "badge-verified",
  warning: "badge-pending",
  danger: "badge-tampered",
};

const eventLabels: Record<string, string> = {
  LOGIN_SUCCESS: "Login Success",
  LOGIN_FAILED: "Login Failed",
  RECORD_UPLOAD: "Record Upload",
  QR_GENERATED: "QR Generated",
  RECORD_VERIFIED: "Record Verified",
  PANIC_ALERT: "Panic Alert",
  RECORD_SHARED: "Record Shared",
};

export default function SecurityHistory() {
  const { auditLog } = useAppState();
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? auditLog : auditLog.filter((e) => e.type === filter);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Security History</h1>
          <p className="text-muted-foreground text-sm mt-1">Forensic audit trail of all security events.</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-44 h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="LOGIN_SUCCESS">Login Success</SelectItem>
              <SelectItem value="LOGIN_FAILED">Login Failed</SelectItem>
              <SelectItem value="RECORD_UPLOAD">Record Upload</SelectItem>
              <SelectItem value="QR_GENERATED">QR Generated</SelectItem>
              <SelectItem value="PANIC_ALERT">Panic Alert</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Event</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Timestamp</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Device</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Location</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((event, i) => (
                <motion.tr
                  key={event.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border/50 last:border-0 hover:bg-muted/20"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {event.type === "PANIC_ALERT" && <ShieldAlert className="w-4 h-4 text-destructive" />}
                      <span className="font-medium">{eventLabels[event.type] || event.type}</span>
                    </div>
                    {event.details && <p className="text-xs text-muted-foreground mt-0.5">{event.details}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{format(event.timestamp, "MMM d, yyyy HH:mm")}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{event.device}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{event.location}</td>
                  <td className="px-5 py-3.5"><span className={statusColors[event.status]}>{event.status}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-border">
          {filtered.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{eventLabels[event.type]}</span>
                <span className={statusColors[event.status]}>{event.status}</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p>{format(event.timestamp, "MMM d, yyyy HH:mm")}</p>
                <p>{event.device}</p>
                <p>{event.location}</p>
                {event.details && <p className="text-foreground/70">{event.details}</p>}
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center text-muted-foreground text-sm">No events match the filter.</div>
        )}
      </div>
    </div>
  );
}
