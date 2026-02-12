import { useState, createContext, useContext, ReactNode } from "react";

export interface AuditEvent {
  id: string;
  type: "LOGIN_SUCCESS" | "LOGIN_FAILED" | "RECORD_UPLOAD" | "QR_GENERATED" | "RECORD_VERIFIED" | "PANIC_ALERT" | "RECORD_SHARED";
  timestamp: Date;
  device: string;
  location: string;
  status: "success" | "warning" | "danger";
  details?: string;
}

export interface MedicalRecord {
  id: string;
  name: string;
  type: string;
  uploadDate: Date;
  hash: string;
  verified: boolean;
  lastVerified: Date;
  size: string;
  category: "lab" | "prescription" | "imaging" | "report" | "other";
}

interface AppState {
  isAuthenticated: boolean;
  walletAddress: string;
  records: MedicalRecord[];
  auditLog: AuditEvent[];
  failedPinAttempts: number;
  panicMode: boolean;
  login: (address: string) => void;
  logout: () => void;
  addRecord: (record: MedicalRecord) => void;
  addAuditEvent: (event: Omit<AuditEvent, "id">) => void;
  incrementFailedPin: () => void;
  resetFailedPin: () => void;
  triggerPanic: () => void;
  resetPanic: () => void;
}

const AppContext = createContext<AppState | null>(null);

export const useAppState = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
};

const mockRecords: MedicalRecord[] = [
  {
    id: "rec-001",
    name: "Complete Blood Count",
    type: "PDF",
    uploadDate: new Date("2025-01-15"),
    hash: "a3f2b8c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
    verified: true,
    lastVerified: new Date("2025-02-10"),
    size: "1.2 MB",
    category: "lab",
  },
  {
    id: "rec-002",
    name: "Chest X-Ray Report",
    type: "DICOM",
    uploadDate: new Date("2025-01-20"),
    hash: "b4c3d9e2f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1",
    verified: true,
    lastVerified: new Date("2025-02-08"),
    size: "4.8 MB",
    category: "imaging",
  },
  {
    id: "rec-003",
    name: "Prescription - Amoxicillin",
    type: "PDF",
    uploadDate: new Date("2025-02-01"),
    hash: "c5d4e0f3a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2",
    verified: true,
    lastVerified: new Date("2025-02-05"),
    size: "340 KB",
    category: "prescription",
  },
  {
    id: "rec-004",
    name: "Annual Health Checkup",
    type: "PDF",
    uploadDate: new Date("2024-12-10"),
    hash: "d6e5f1a4b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3",
    verified: false,
    lastVerified: new Date("2025-01-02"),
    size: "2.1 MB",
    category: "report",
  },
];

const mockAuditLog: AuditEvent[] = [
  { id: "evt-001", type: "LOGIN_SUCCESS", timestamp: new Date("2025-02-10T09:15:00"), device: "Chrome / macOS", location: "San Francisco, CA", status: "success" },
  { id: "evt-002", type: "RECORD_UPLOAD", timestamp: new Date("2025-02-10T09:20:00"), device: "Chrome / macOS", location: "San Francisco, CA", status: "success", details: "Complete Blood Count" },
  { id: "evt-003", type: "QR_GENERATED", timestamp: new Date("2025-02-10T09:25:00"), device: "Chrome / macOS", location: "San Francisco, CA", status: "success", details: "rec-001" },
  { id: "evt-004", type: "LOGIN_FAILED", timestamp: new Date("2025-02-09T14:30:00"), device: "Firefox / Windows", location: "Unknown", status: "warning" },
  { id: "evt-005", type: "RECORD_VERIFIED", timestamp: new Date("2025-02-08T11:00:00"), device: "Safari / iOS", location: "San Francisco, CA", status: "success", details: "Chest X-Ray Report" },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [records, setRecords] = useState<MedicalRecord[]>(mockRecords);
  const [auditLog, setAuditLog] = useState<AuditEvent[]>(mockAuditLog);
  const [failedPinAttempts, setFailedPinAttempts] = useState(0);
  const [panicMode, setPanicMode] = useState(false);

  const login = (address: string) => {
    setIsAuthenticated(true);
    setWalletAddress(address);
    setFailedPinAttempts(0);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setWalletAddress("");
  };

  const addRecord = (record: MedicalRecord) => setRecords((prev) => [record, ...prev]);

  const addAuditEvent = (event: Omit<AuditEvent, "id">) =>
    setAuditLog((prev) => [{ ...event, id: `evt-${Date.now()}` }, ...prev]);

  const incrementFailedPin = () => setFailedPinAttempts((p) => p + 1);
  const resetFailedPin = () => setFailedPinAttempts(0);
  const triggerPanic = () => setPanicMode(true);
  const resetPanic = () => { setPanicMode(false); setFailedPinAttempts(0); };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated, walletAddress, records, auditLog, failedPinAttempts, panicMode,
        login, logout, addRecord, addAuditEvent, incrementFailedPin, resetFailedPin, triggerPanic, resetPanic,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
