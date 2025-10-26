import React, { createContext, useContext, useEffect, useState } from "react";

export type Complaint = {
  id: string;
  title: string;
  description?: string;
  image?: string; // data URL
  location?: string;
  status: "In Progress" | "Completed";
  createdAt: number;
  completedImage?: string;
};

type ComplaintsContextValue = {
  complaints: Complaint[];
  addComplaint: (c: Omit<Complaint, "id" | "createdAt" | "status">) => Complaint;
  markCompleted: (id: string, completedImage?: string) => void;
  clearAll?: () => void;
};

const ComplaintsContext = createContext<ComplaintsContextValue | undefined>(undefined);

const STORAGE_KEY = "swachh_complaints_v1";

export const ComplaintsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
    } catch (e) {}
  }, [complaints]);

  const addComplaint = (c: Omit<Complaint, "id" | "createdAt" | "status">) => {
    const newC: Complaint = {
      ...c,
      id: Math.random().toString(36).slice(2, 9),
      createdAt: Date.now(),
      status: "In Progress",
    };
    setComplaints((s) => [newC, ...s]);
    return newC;
  };

  const markCompleted = (id: string, completedImage?: string) => {
    setComplaints((s) => s.map((c) => (c.id === id ? { ...c, status: "Completed", completedImage } : c)));
  };

  const clearAll = () => setComplaints([]);

  return (
    <ComplaintsContext.Provider value={{ complaints, addComplaint, markCompleted, clearAll }}>
      {children}
    </ComplaintsContext.Provider>
  );
};

export const useComplaints = () => {
  const ctx = useContext(ComplaintsContext);
  if (!ctx) throw new Error("useComplaints must be used within ComplaintsProvider");
  return ctx;
};

export default ComplaintsProvider;
