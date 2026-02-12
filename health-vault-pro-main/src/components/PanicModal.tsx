import { motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useAppState } from "@/context/AppContext";
import { Button } from "@/components/ui/button";

export default function PanicModal() {
  const { resetPanic } = useAppState();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-destructive/10 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border-2 border-destructive rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl panic-pulse"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-xl font-bold text-destructive mb-2">PANIC ALERT</h2>
        <p className="text-sm text-muted-foreground mb-1">Multiple failed PIN attempts detected.</p>
        <p className="text-xs text-muted-foreground mb-6">
          Device metadata and geolocation have been logged. This incident has been recorded in the forensic audit trail.
        </p>
        <Button variant="destructive" onClick={resetPanic} className="w-full gap-2">
          <X className="w-4 h-4" />
          Acknowledge & Reset
        </Button>
      </motion.div>
    </motion.div>
  );
}
