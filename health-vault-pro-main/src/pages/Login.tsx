import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Wallet, Lock, ChevronRight } from "lucide-react";
import { useAppState } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login, addAuditEvent, incrementFailedPin, failedPinAttempts, triggerPanic } = useAppState();
  const navigate = useNavigate();
  const [step, setStep] = useState<"wallet" | "pin">("wallet");
  const [connecting, setConnecting] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const mockAddress = "0x7a3B...F29d";

  const connectWallet = async () => {
    setConnecting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setConnecting(false);
    setStep("pin");
  };

  const verifyPin = () => {
    if (pin === "1234") {
      addAuditEvent({ type: "LOGIN_SUCCESS", timestamp: new Date(), device: navigator.userAgent.slice(0, 30), location: "Local", status: "success" });
      login(mockAddress);
      navigate("/dashboard");
    } else {
      incrementFailedPin();
      setError("Invalid PIN");
      setPin("");
      addAuditEvent({ type: "LOGIN_FAILED", timestamp: new Date(), device: navigator.userAgent.slice(0, 30), location: "Local", status: "warning" });
      if (failedPinAttempts + 1 >= 3) {
        triggerPanic();
        addAuditEvent({ type: "PANIC_ALERT", timestamp: new Date(), device: navigator.userAgent.slice(0, 30), location: "Local", status: "danger", details: "3 failed PIN attempts" });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Health Record Wallet</h1>
          <p className="text-muted-foreground mt-1 text-sm">Decentralized • Secure • Verified</p>
        </div>

        <div className="glass-card-elevated p-8">
          {step === "wallet" ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-lg font-semibold">Connect Your Wallet</h2>
                <p className="text-sm text-muted-foreground">Link your MetaMask wallet to access your health records securely.</p>
              </div>

              <Button
                onClick={connectWallet}
                disabled={connecting}
                className="w-full h-12 text-base gap-2"
              >
                <Wallet className="w-5 h-5" />
                {connecting ? "Connecting..." : "Connect MetaMask"}
                {!connecting && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Button>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Your wallet address is used for authentication only. No transactions are initiated.</span>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-lg font-semibold">Enter Security PIN</h2>
                <p className="text-sm text-muted-foreground">
                  Wallet <span className="font-mono text-primary">{mockAddress}</span> connected
                </p>
              </div>

              <div className="space-y-3">
                <Input
                  type="password"
                  maxLength={4}
                  placeholder="Enter 4-digit PIN"
                  value={pin}
                  onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && pin.length === 4 && verifyPin()}
                  className="text-center text-2xl tracking-[0.5em] h-14"
                />
                {error && <p className="text-sm text-destructive text-center">{error}</p>}
                {failedPinAttempts > 0 && failedPinAttempts < 3 && (
                  <p className="text-xs text-warning text-center">{3 - failedPinAttempts} attempts remaining</p>
                )}
              </div>

              <Button onClick={verifyPin} disabled={pin.length !== 4} className="w-full h-12 text-base">
                Verify & Login
              </Button>

              <p className="text-xs text-muted-foreground text-center">Demo PIN: 1234</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
