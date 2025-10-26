import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useComplaints } from "@/lib/complaints";
import { Camera, MapPin, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type BMCPortalProps = {
  open: boolean;
  onClose: () => void;
};

const BMCPortal: React.FC<BMCPortalProps> = ({ open, onClose }) => {
  const { complaints, markCompleted } = useComplaints();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authId, setAuthId] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [completionImages, setCompletionImages] = useState<Record<string, string>>({});

  const handleLogin = async () => {
    try {
      const { data, error } = await supabase.rpc("verify_bmc_admin", {
        p_username: authId,
        p_password: authPassword,
      });
      if (error) throw error;
      if (data === true) {
        setIsAuthenticated(true);
        setAuthId("");
        setAuthPassword("");
      } else {
        alert("Invalid credentials");
      }
    } catch (e) {
      alert("Login failed. Please try again.");
    }
  };

  const handleImageUpload = (complaintId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCompletionImages((prev) => ({ ...prev, [complaintId]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleMarkCompleted = (complaintId: string) => {
    const image = completionImages[complaintId];
    if (!image) {
      alert("Please upload a proof image before marking as completed");
      return;
    }
    markCompleted(complaintId, image);
    setCompletionImages((prev) => {
      const updated = { ...prev };
      delete updated[complaintId];
      return updated;
    });
    alert("Complaint marked as completed!");
  };

  const handleDialogChange = (o: boolean) => {
    if (!o) {
      setIsAuthenticated(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">BMC/DMC Authority Portal</DialogTitle>
          <DialogDescription>Manage and resolve civic complaints</DialogDescription>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="authId">Authority ID</Label>
              <Input id="authId" value={authId} onChange={(e) => setAuthId(e.target.value)} placeholder="Enter your authority ID" />
            </div>
            <div>
              <Label htmlFor="authPassword">Password</Label>
              <Input id="authPassword" type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="Enter password" />
            </div>
            <Button onClick={handleLogin} className="w-full">Login</Button>
            <p className="text-xs text-muted-foreground text-center">Demo: ID <code>bmc-2025</code>, Password <code>123456</code></p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-semibold">All Complaints ({complaints.length})</h3>
              <Button variant="outline" size="sm" onClick={() => setIsAuthenticated(false)}>Logout</Button>
            </div>

            {complaints.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No complaints to display.</p>
            ) : (
              complaints.map((c) => (
                <div key={c.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{c.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                      {c.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                          <MapPin className="w-3 h-3" />
                          {c.location}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted: {new Date(c.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${c.status === "Completed" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                      {c.status}
                    </div>
                  </div>

                  {c.image && (
                    <div>
                      <p className="text-xs font-medium mb-1">Issue Image:</p>
                      <img src={c.image} alt="Issue" className="w-32 h-32 object-cover rounded border" />
                    </div>
                  )}

                  {c.status === "In Progress" && (
                    <div className="bg-muted/30 p-3 rounded space-y-2">
                      <Label className="text-sm font-medium">Upload Work Completion Proof:</Label>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById(`file-${c.id}`)?.click()}
                          className="gap-2"
                        >
                          <Camera className="w-4 h-4" />
                          Choose Image
                        </Button>
                        <input
                          id={`file-${c.id}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(c.id, e)}
                        />
                        {completionImages[c.id] && <span className="text-sm text-green-400">Image uploaded ✓</span>}
                      </div>
                      {completionImages[c.id] && (
                        <img src={completionImages[c.id]} alt="Completion proof" className="w-24 h-24 object-cover rounded border mt-2" />
                      )}
                      <Button onClick={() => handleMarkCompleted(c.id)} size="sm" className="gap-2 mt-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Mark as Completed
                      </Button>
                    </div>
                  )}

                  {c.status === "Completed" && c.completedImage && (
                    <div>
                      <p className="text-xs font-medium text-green-400 mb-1">Work Completed Image:</p>
                      <img src={c.completedImage} alt="Completed" className="w-32 h-32 object-cover rounded border border-green-500/30" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BMCPortal;
