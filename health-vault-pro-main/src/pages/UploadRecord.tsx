import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, FileUp, ShieldCheck, Hash, Loader2 } from "lucide-react";
import { useAppState } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function UploadRecord() {
  const { addRecord, addAuditEvent } = useAppState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>("lab");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ hash: string; id: string } | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setResult(null); }
  };

  const computeHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const hash = await computeHash(file);
    await new Promise((r) => setTimeout(r, 1500)); // simulate blockchain tx

    const id = `rec-${Date.now()}`;
    addRecord({
      id,
      name: file.name.replace(/\.[^/.]+$/, ""),
      type: file.name.split(".").pop()?.toUpperCase() || "FILE",
      uploadDate: new Date(),
      hash,
      verified: true,
      lastVerified: new Date(),
      size: file.size > 1048576 ? `${(file.size / 1048576).toFixed(1)} MB` : `${(file.size / 1024).toFixed(0)} KB`,
      category: category as any,
    });

    addAuditEvent({ type: "RECORD_UPLOAD", timestamp: new Date(), device: "Browser", location: "Local", status: "success", details: file.name });
    setResult({ hash, id });
    setUploading(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Upload Record</h1>
        <p className="text-muted-foreground text-sm mt-1">Upload a medical file. Its SHA-256 hash will be stored on-chain.</p>
      </div>

      <div className="glass-card-elevated p-8 max-w-lg">
        {/* Drop Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/[0.02] transition-colors"
        >
          <FileUp className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium">{file ? file.name : "Click to select a file"}</p>
          <p className="text-xs text-muted-foreground mt-1">PDF, DICOM, JPEG, PNG — Max 50MB</p>
          <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.dicom" onChange={handleFile} />
        </div>

        {file && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lab">🧪 Lab Result</SelectItem>
                  <SelectItem value="prescription">💊 Prescription</SelectItem>
                  <SelectItem value="imaging">📷 Imaging</SelectItem>
                  <SelectItem value="report">📋 Report</SelectItem>
                  <SelectItem value="other">📄 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleUpload} disabled={uploading} className="w-full h-11 gap-2">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? "Hashing & Storing On-Chain..." : "Upload & Store Hash"}
            </Button>
          </motion.div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 rounded-lg bg-success/5 border border-success/20">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-success" />
              <span className="text-sm font-semibold text-success">Record Stored Successfully</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <Hash className="w-3 h-3 text-muted-foreground" />
                <span className="font-mono text-muted-foreground break-all">{result.hash}</span>
              </div>
              <p className="text-xs text-muted-foreground">Record ID: {result.id}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
