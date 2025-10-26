import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useComplaints } from "@/lib/complaints";
import { Camera, MapPin } from "lucide-react";

type UserPortalProps = {
  open: boolean;
  onClose: () => void;
};

const UserPortal: React.FC<UserPortalProps> = ({ open, onClose }) => {
  const { complaints, addComplaint } = useComplaints();
  const [view, setView] = useState<"submit" | "list">("submit");
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState<string | undefined>();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      alert("Please enter a complaint title");
      return;
    }
    addComplaint({ title, description, location, image });
    setTitle("");
    setDescription("");
    setLocation("");
    setImage(undefined);
    alert("Complaint submitted successfully!");
    setView("list");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">User Portal</DialogTitle>
          <DialogDescription>Submit and track your civic complaints</DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button variant={view === "submit" ? "default" : "outline"} onClick={() => setView("submit")}>
            Submit Complaint
          </Button>
          <Button variant={view === "list" ? "default" : "outline"} onClick={() => setView("list")}>
            My Complaints
          </Button>
        </div>

        {view === "submit" ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Complaint Title *</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Pothole on Main Street" />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue..." rows={3} />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <div className="flex gap-2">
                <MapPin className="w-5 h-5 text-muted-foreground mt-2" />
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Enter location manually" className="flex-1" />
              </div>
            </div>

            <div>
              <Label htmlFor="image">Upload Image</Label>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => document.getElementById("fileInput")?.click()} className="gap-2">
                  <Camera className="w-4 h-4" />
                  Choose Image
                </Button>
                <input id="fileInput" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                {image && <span className="text-sm text-muted-foreground">Image uploaded ✓</span>}
              </div>
              {image && (
                <div className="mt-2">
                  <img src={image} alt="Preview" className="w-32 h-32 object-cover rounded border" />
                </div>
              )}
            </div>

            <Button onClick={handleSubmit} className="w-full">Submit Complaint</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No complaints submitted yet.</p>
            ) : (
              complaints.map((c) => (
                <div key={c.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{c.title}</h4>
                      <p className="text-sm text-muted-foreground">{c.description}</p>
                      {c.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {c.location}
                        </p>
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${c.status === "Completed" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                      {c.status}
                    </div>
                  </div>
                  {c.image && (
                    <img src={c.image} alt="Issue" className="w-24 h-24 object-cover rounded" />
                  )}
                  {c.completedImage && (
                    <div className="mt-2">
                      <p className="text-xs text-green-400 mb-1">Work Completed:</p>
                      <img src={c.completedImage} alt="Completed" className="w-24 h-24 object-cover rounded border border-green-500/30" />
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

export default UserPortal;
