import { motion } from "framer-motion";
import { FileText, ShieldCheck, ShieldX, Clock, Activity, Upload, QrCode } from "lucide-react";
import { useAppState, MedicalRecord } from "@/context/AppContext";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const categoryIcons: Record<string, string> = {
  lab: "🧪",
  prescription: "💊",
  imaging: "📷",
  report: "📋",
  other: "📄",
};

function RecordCard({ record, index }: { record: MedicalRecord; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card p-5 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{categoryIcons[record.category] || "📄"}</span>
          <div>
            <h3 className="font-semibold text-sm">{record.name}</h3>
            <p className="text-xs text-muted-foreground">{record.type} • {record.size}</p>
          </div>
        </div>
        {record.verified ? (
          <span className="badge-verified">
            <ShieldCheck className="w-3 h-3" />
            Verified
          </span>
        ) : (
          <span className="badge-tampered">
            <ShieldX className="w-3 h-3" />
            Unverified
          </span>
        )}
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Uploaded {format(record.uploadDate, "MMM d, yyyy")}
        </span>
        <span className="flex items-center gap-1">
          <Activity className="w-3 h-3" />
          Checked {format(record.lastVerified, "MMM d")}
        </span>
      </div>
      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-[10px] font-mono text-muted-foreground truncate">
          SHA-256: {record.hash}
        </p>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { records, auditLog } = useAppState();
  const verifiedCount = records.filter((r) => r.verified).length;
  const recentEvents = auditLog.slice(0, 3);

  const stats = [
    { label: "Total Records", value: records.length, icon: FileText, color: "text-primary" },
    { label: "Verified", value: verifiedCount, icon: ShieldCheck, color: "text-success" },
    { label: "Pending", value: records.length - verifiedCount, icon: ShieldX, color: "text-warning" },
    { label: "Events Today", value: recentEvents.length, icon: Activity, color: "text-accent" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your health records and security activity.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link to="/upload">
          <button className="glass-card px-4 py-2.5 flex items-center gap-2 text-sm font-medium text-primary hover:bg-primary/5 transition-colors">
            <Upload className="w-4 h-4" />
            Upload Record
          </button>
        </Link>
        <Link to="/qr-share">
          <button className="glass-card px-4 py-2.5 flex items-center gap-2 text-sm font-medium text-primary hover:bg-primary/5 transition-colors">
            <QrCode className="w-4 h-4" />
            Share via QR
          </button>
        </Link>
      </div>

      {/* Records */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Medical Records</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {records.map((record, i) => (
            <RecordCard key={record.id} record={record} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
