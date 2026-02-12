import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { QrCode, Lock, Clock, ShieldCheck } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useAppState } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function QRShare() {
  const { records, addAuditEvent, incrementFailedPin, failedPinAttempts, triggerPanic } = useAppState();
  const [step, setStep] = useState<"pin" | "select" | "qr">("pin");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [selectedRecord, setSelectedRecord] = useState("");
  const [qrData, setQrData] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  const verifyPin = () => {
    if (pin === "1234") {
      setStep("select");
      setError("");
    } else {
      incrementFailedPin();
      setError("Invalid PIN");
      setPin("");
      if (failedPinAttempts + 1 >= 3) {
        triggerPanic();
        addAuditEvent({ type: "PANIC_ALERT", timestamp: new Date(), device: "Browser", location: "Local", status: "danger", details: "3 failed PIN attempts during QR share" });
      }
    }
  };

  const generateQR = () => {
    const token = crypto.randomUUID();
    const expiry = Date.now() + 15 * 60 * 1000;
    const payload = JSON.stringify({ recordId: selectedRecord, token, expiry });
    setQrData(btoa(payload));
    setTimeLeft(900);
    setStep("qr");
    addAuditEvent({ type: "QR_GENERATED", timestamp: new Date(), device: "Browser", location: "Local", status: "success", details: selectedRecord });
  };

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">QR Share</h1>
        <p className="text-muted-foreground text-sm mt-1">Generate a time-limited QR code to share a record securely.</p>
      </div>

      <div className="glass-card-elevated p-8 max-w-md">
        {step === "pin" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">PIN Verification Required</h2>
              <p className="text-sm text-muted-foreground mt-1">Enter your PIN to generate a sharing QR code.</p>
            </div>
            <Input
              type="password"
              maxLength={4}
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && pin.length === 4 && verifyPin()}
              className="text-center text-2xl tracking-[0.5em] h-14"
            />
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button onClick={verifyPin} disabled={pin.length !== 4} className="w-full">Verify</Button>
            <p className="text-xs text-muted-foreground text-center">Demo PIN: 1234</p>
          </motion.div>
        )}

        {step === "select" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="text-center">
              <ShieldCheck className="w-8 h-8 text-success mx-auto mb-2" />
              <h2 className="text-lg font-semibold">Select Record to Share</h2>
            </div>
            <Select value={selectedRecord} onValueChange={setSelectedRecord}>
              <SelectTrigger><SelectValue placeholder="Choose a record" /></SelectTrigger>
              <SelectContent>
                {records.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={generateQR} disabled={!selectedRecord} className="w-full gap-2">
              <QrCode className="w-4 h-4" />
              Generate QR Code
            </Button>
          </motion.div>
        )}

        {step === "qr" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-center">
            <div>
              <h2 className="text-lg font-semibold">Scan to Access Record</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {records.find((r) => r.id === selectedRecord)?.name}
              </p>
            </div>

            <div className="inline-block p-4 bg-card rounded-2xl border border-border">
              <QRCodeSVG value={qrData} size={200} level="H" />
            </div>

            <div className="flex items-center justify-center gap-2">
              <Clock className={`w-4 h-4 ${timeLeft < 60 ? "text-destructive" : "text-primary"}`} />
              <span className={`text-lg font-mono font-bold ${timeLeft < 60 ? "text-destructive" : "text-foreground"}`}>
                {timeLeft > 0 ? formatTime(timeLeft) : "Expired"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">This QR code expires in 15 minutes</p>

            <Button variant="outline" onClick={() => { setStep("select"); setQrData(""); }}>
              Generate New Code
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
