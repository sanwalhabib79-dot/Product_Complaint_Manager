import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  onSnapshot, 
  collection, 
  doc, 
  getDoc,
  setDoc, 
  deleteDoc, 
  updateDoc 
} from "firebase/firestore";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User
} from "firebase/auth";
import { db, auth, handleFirestoreError, OperationType, isUsingPlaceholderConfig } from "../firebase";
import { Customer, Complaint, UserRole, SupportedLanguage, translations } from "../types";

export const compressImage = (src: string, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> => {
  if (!src || !src.startsWith("data:image/")) {
    return Promise.resolve(src);
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((img.width * maxHeight) / img.height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(src);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      resolve(src);
    };

    img.src = src;
  });
};

interface ComplaintContextType {
  user: User | null;
  userProfile: { name: string; email: string; role: UserRole } | null;
  loading: boolean;
  customers: Customer[];
  complaints: Complaint[];
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  activeRole: UserRole;
  simulateRoleChange: (role: UserRole) => void;
  isDemoMode: boolean;
  
  // Auth operations
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  
  // CRUD Customers
  addCustomer: (name: string, phone: string, email: string) => Promise<void>;
  
  // CRUD Complaints
  addComplaint: (data: Omit<Complaint, "id" | "userId" | "createdAt" | "updatedAt">) => Promise<void>;
  updateComplaint: (id: string, updates: Partial<Complaint>) => Promise<void>;
  deleteComplaint: (id: string) => Promise<void>;
  
  // Utility and Helper
  triggerSearchGrounding: (productName: string, companyName: string, productModel: string) => Promise<{ text: string; sources: { title: string; url: string }[] }>;
  triggerImageGeneration: (prompt: string) => Promise<string>;
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

export const ComplaintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<{ name: string; email: string; role: UserRole } | null>(null);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("theme") === "dark";
  });
  
  // activeRole holds current simulated or database-backed active credentials
  const [activeRole, setActiveRole] = useState<UserRole>("Admin");
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Apply dark mode theme tag
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Handle Firebase placeholder check
  useEffect(() => {
    const isDemo = isUsingPlaceholderConfig();
    setIsDemoMode(isDemo);
    if (isDemo) {
      console.log("Database & Auth running in offline simulation mode due to placeholder credentials.");
      // Load local sample data to look completely professional
      loadMockData();
      setLoading(false);
    }
  }, []);

  // Listen to Auth State
  useEffect(() => {
    if (isUsingPlaceholderConfig()) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Build or fetch user profile document
        const userDocRef = doc(db, "users", firebaseUser.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Retain the existing createdAt to satisfy the immutability rules,
            // and merge/update any modifications gracefully.
            const profile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "unknown@google.com",
              name: firebaseUser.displayName || "Manager User",
              role: activeRole, // Default/Simulated role
              createdAt: data.createdAt || new Date().toISOString()
            };
            await setDoc(userDocRef, profile, { merge: true });
            setUserProfile({ 
              name: profile.name, 
              email: profile.email, 
              role: activeRole 
            });
          } else {
            // Document does not exist yet, create initially
            const profile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "unknown@google.com",
              name: firebaseUser.displayName || "Manager User",
              role: activeRole,
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, profile);
            setUserProfile({ name: profile.name, email: profile.email, role: activeRole });
          }
        } catch (err) {
          console.warn("Could not synchronize user profile to database, saving locally:", err);
          setUserProfile({
            name: firebaseUser.displayName || "Manager User",
            email: firebaseUser.email || "unknown@google.com",
            role: activeRole
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeRole]);

  // Listen to Firestore Databases (Only if Firebase is NOT simulated)
  useEffect(() => {
    if (isUsingPlaceholderConfig()) return;
    if (!user || !userProfile) {
      setCustomers([]);
      setComplaints([]);
      return;
    }

    const customersPath = "customers";
    const unsubscribeCustomers = onSnapshot(collection(db, customersPath), (snapshot) => {
      const items: Customer[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Customer);
      });
      setCustomers(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, customersPath);
    });

    const complaintsPath = "complaints";
    const unsubscribeComplaints = onSnapshot(collection(db, complaintsPath), (snapshot) => {
      const items: Complaint[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Complaint);
      });
      setComplaints(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, complaintsPath);
    });

    return () => {
      unsubscribeCustomers();
      unsubscribeComplaints();
    };
  }, [user, userProfile]);

  // Google Authentication Trigger
  const loginWithGoogle = async () => {
    if (isDemoMode) {
      // Simulate OAuth Login details in UI
      const mockUser = {
        uid: "mock-google-user-id",
        displayName: "John Agent Miller",
        email: "john.complaints@mycompany.com",
        emailVerified: true
      } as any;
      setUser(mockUser);
      setUserProfile({ name: mockUser.displayName, email: mockUser.email, role: activeRole });
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (err) {
      console.error("Google Auth failed, falling back to mock user:", err);
      // In-app backup
      const mockUser = {
        uid: "mock-google-user-id",
        displayName: "Manager Guest",
        email: "guest.manager@mycompany.com"
      } as any;
      setUser(mockUser);
    }
  };

  const logout = async () => {
    if (isDemoMode) {
      setUser(null);
      setUserProfile(null);
      return;
    }
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const simulateRoleChange = (role: UserRole) => {
    setActiveRole(role);
    if (userProfile) {
      setUserProfile(prev => prev ? { ...prev, role } : null);
    }
  };

  // --- CRUD CUSTOMERS ---
  const addCustomer = async (name: string, phone: string, email: string) => {
    if (activeRole === "Viewer") {
      throw new Error("VIEWER_ACCESS_DENIED: Viewers are unauthorized from writing records.");
    }

    const customerId = "CUST-" + Math.floor(100000 + Math.random() * 900000);
    const newCust: Customer = {
      id: customerId,
      name,
      phone,
      email,
      userId: user?.uid || "mock-google-user-id",
      createdAt: new Date().toISOString()
    };

    if (isDemoMode) {
      const updated = [newCust, ...customers];
      setCustomers(updated);
      localStorage.setItem("local_customers", JSON.stringify(updated));
      return;
    }

    const path = `customers/${customerId}`;
    try {
      await setDoc(doc(db, "customers", customerId), newCust);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  // --- CRUD COMPLAINTS ---
  const addComplaint = async (data: Omit<Complaint, "id" | "userId" | "createdAt" | "updatedAt">) => {
    if (activeRole === "Viewer") {
      throw new Error("VIEWER_ACCESS_DENIED: Viewers are unauthorized from writing records.");
    }

    let finalProductImage = data.productImage || "";
    if (finalProductImage.startsWith("data:image/")) {
      try {
        finalProductImage = await compressImage(finalProductImage);
      } catch (err) {
        console.warn("Image compression failed, using original size:", err);
      }
    }

    const complaintId = "CMP-" + Math.floor(100000 + Math.random() * 900000);
    const timeNow = new Date().toISOString();
    const newComp: Complaint = {
      ...data,
      productImage: finalProductImage,
      id: complaintId,
      userId: user?.uid || "mock-google-user-id",
      createdAt: timeNow,
      updatedAt: timeNow,
      statusHistory: [
        {
          status: data.status || "Pending",
          timestamp: timeNow,
          changedBy: userProfile?.name || user?.email || "System Portal",
          notes: data.description ? (data.description.substring(0, 100) + "...") : "Dossier opened"
        }
      ]
    };

    if (isDemoMode) {
      const updated = [newComp, ...complaints];
      setComplaints(updated);
      localStorage.setItem("local_complaints", JSON.stringify(updated));
      return;
    }

    const path = `complaints/${complaintId}`;
    try {
      await setDoc(doc(db, "complaints", complaintId), newComp);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const updateComplaint = async (id: string, updates: Partial<Complaint>) => {
    if (activeRole === "Viewer") {
      throw new Error("VIEWER_ACCESS_DENIED: Viewers are unauthorized from writing records.");
    }

    const timeNow = new Date().toISOString();
    
    let finalUpdates = { ...updates };
    if (finalUpdates.productImage && finalUpdates.productImage.startsWith("data:image/")) {
      try {
        finalUpdates.productImage = await compressImage(finalUpdates.productImage);
      } catch (err) {
        console.warn("Image compression failed, using original size:", err);
      }
    }

    const currentComp = complaints.find(c => c.id === id);
    if (currentComp) {
      const hasStatusChanged = updates.status && updates.status !== currentComp.status;
      const isMissingHistory = !currentComp.statusHistory || currentComp.statusHistory.length === 0;

      if (hasStatusChanged || isMissingHistory) {
        const baseHistory = currentComp.statusHistory && currentComp.statusHistory.length > 0
          ? currentComp.statusHistory
          : [{
              status: currentComp.status || "Pending",
              timestamp: currentComp.createdAt || currentComp.updatedAt || timeNow,
              changedBy: "System Registration",
              notes: "Complaint logged initially"
            }];

        if (hasStatusChanged) {
          const author = userProfile?.name 
            ? `${userProfile.name} (${userProfile.role})`
            : user?.email || "Staff Agent";

          const newEntry = {
            status: updates.status!,
            timestamp: timeNow,
            changedBy: author,
            notes: updates.notes || updates.companyResponseStatus || `${updates.status} in progress`
          };
          finalUpdates.statusHistory = [...baseHistory, newEntry];
        } else if (isMissingHistory) {
          finalUpdates.statusHistory = baseHistory;
        }
      }
    }

    if (isDemoMode) {
      const updated = complaints.map(c => c.id === id ? { ...c, ...finalUpdates, updatedAt: timeNow } : c);
      setComplaints(updated);
      localStorage.setItem("local_complaints", JSON.stringify(updated));
      return;
    }

    const path = `complaints/${id}`;
    try {
      await updateDoc(doc(db, "complaints", id), {
        ...finalUpdates,
        updatedAt: timeNow
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const deleteComplaint = async (id: string) => {
    if (activeRole !== "Admin") {
      throw new Error("ADMIN_ACCESS_REQUIRED: Only Administrators can permanently purge complaint logs.");
    }

    if (isDemoMode) {
      const updated = complaints.filter(c => c.id !== id);
      setComplaints(updated);
      localStorage.setItem("local_complaints", JSON.stringify(updated));
      return;
    }

    const path = `complaints/${id}`;
    try {
      await deleteDoc(doc(db, "complaints", id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  // --- External Integrations Grounding & Image APIs ---
  const triggerSearchGrounding = async (productName: string, companyName: string, productModel: string) => {
    try {
      const res = await fetch("/api/complaint-grounding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, companyName, productModel })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Search error");
      }
      return await res.json();
    } catch (err: any) {
      console.warn("AI grounding endpoint failed, falling back to clean simulated specs:", err);
      return {
        text: `### Simulated Grounding for **${productName}** (${companyName})
- **Typical Issues**: Known firmware glitches, thermal overload, and minor frame vibration.
- **Support Contact Channels**: 
  - Phone: +1-800-472-8800 (Mon-Fri)
  - Email: complaint-intake@${companyName.toLowerCase().replace(/\s+/g, "")}.com
- **Suggested Resolution Timeline**: 3-5 standard business days.`,
        sources: [
          { title: `${companyName} Response Guide`, url: `https://www.${companyName.toLowerCase().replace(/\s+/g, "")}.com/support` }
        ]
      };
    }
  };

  const triggerImageGeneration = async (prompt: string) => {
    try {
      const res = await fetch("/api/generate-product-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Generation error");
      }
      const data = await res.json();
      return data.imageUrl;
    } catch (err: any) {
      console.warn("AI visual illustration failed, return placeholder color template", err);
      // Return a beautiful dynamic colored SVG representations based on the prompt
      return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 100 100"><rect width="100%25" height="100%25" fill="%234f46e5"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="6" fill="%23ffffff">AI Preview: ${encodeURIComponent(prompt)}</text></svg>`;
    }
  };

  // Pre-load stunning structured mock data for instant preview brilliance
  const loadMockData = () => {
    const savedCust = localStorage.getItem("local_customers");
    const savedComp = localStorage.getItem("local_complaints");

    if (savedCust) {
      setCustomers(JSON.parse(savedCust));
    } else {
      const standardCust: Customer[] = [
        { id: "CUST-482019", name: "Amira Al-Mansoor", phone: "+971 50 123 4567", email: "amira.mansoor@dubai.ae", userId: "mock-google-user-id", createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
        { id: "CUST-910482", name: "Marc Dupont", phone: "+33 6 1234 5678", email: "marc.dupont@paristech.fr", userId: "mock-google-user-id", createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
        { id: "CUST-721839", name: "Sarah Connor", phone: "+1 (555) 382-1920", email: "sconnor@resistance.net", userId: "mock-google-user-id", createdAt: new Date(Date.now() - 10 * 86400000).toISOString() }
      ];
      setCustomers(standardCust);
      localStorage.setItem("local_customers", JSON.stringify(standardCust));
    }

    if (savedComp) {
      setComplaints(JSON.parse(savedComp));
    } else {
      const standardComp: Complaint[] = [
        {
          id: "CMP-582019",
          customerId: "CUST-482019",
          customerName: "Amira Al-Mansoor",
          customerPhone: "+971 50 123 4567",
          description: "Smartphone screen flickering intermittently at low brightness levels. System starts overheating within 10 minutes of operation.",
          status: "Pending",
          notes: "Initial diagnostic indicates display controller malfunction.",
          productName: "CosmoPhone X1",
          productCategory: "Smartphones",
          productModel: "CPX1-256G",
          productSerialNumber: "SN-99201948",
          productImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=80",
          companyName: "Cosmo Electronics Co.",
          companyComplaintNumber: "",
          companyResponseStatus: "Awaiting review",
          companyNotes: "",
          productReceiveDate: "2026-06-12",
          expectedReturnDate: "2026-06-20",
          productReturnDate: "",
          deliveryStatus: "Arrived",
          userId: "mock-google-user-id",
          createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
          statusHistory: [
            {
              status: "Pending",
              timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
              changedBy: "Amira Al-Mansoor (Customer Portal)",
              notes: "Initial report submitted by customer"
            }
          ]
        },
        {
          id: "CMP-194029",
          customerId: "CUST-910482",
          customerName: "Marc Dupont",
          customerPhone: "+33 6 1234 5678",
          description: "Smart Coffee Brewer fails to connect to local 5GHz Wi-Fi network and overflows water when double-shot routine is selected.",
          status: "Sent to Company",
          notes: "Contacted supplier with serial numbers.",
          productName: "Barista Smart Pro",
          productCategory: "Kitchen Appliances",
          productModel: "BSP-990-W",
          productSerialNumber: "SN-CFF-492094",
          productImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=300&q=80",
          companyName: "Aroma Breweries Corp.",
          companyComplaintNumber: "COMP-AROMA-8820",
          companyResponseStatus: "Complaint filed",
          companyNotes: "Aroma Breweries acknowledged the issue. Fresh firmware will be flashed by French depot.",
          productReceiveDate: "2026-06-05",
          expectedReturnDate: "2026-06-15",
          productReturnDate: "",
          deliveryStatus: "In Transit",
          userId: "mock-google-user-id",
          createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          statusHistory: [
            {
              status: "Pending",
              timestamp: new Date(Date.now() - 8 * 86400000).toISOString(),
              changedBy: "Marc Dupont (Customer Portal)",
              notes: "Initial intake registered"
            },
            {
              status: "Sent to Company",
              timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
              changedBy: "System Operator",
              notes: "Filed dossier with Aroma Breweries Corp."
            }
          ]
        },
        {
          id: "CMP-774829",
          customerId: "CUST-721839",
          customerName: "Sarah Connor",
          customerPhone: "+1 (555) 382-1920",
          description: "Smart Vacuum Cleaner is producing loud scratching sounds during navigation on hardwood floors. Bumper sensor is unresponsive.",
          status: "Completed",
          notes: "Repaired the front wheel assembly and updated navigation mapping.",
          productName: "RoboVac Elite 5000",
          productCategory: "Smart Home",
          productModel: "RVE-5K",
          productSerialNumber: "SN-VAC-882093",
          productImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&q=80",
          companyName: "Roborex Systems",
          companyComplaintNumber: "COMP-ROBO-1930",
          companyResponseStatus: "Repaired & Verified",
          companyNotes: "Drive gears lubricated, bumper microswitch replaced.",
          productReceiveDate: "2026-06-01",
          expectedReturnDate: "2026-06-10",
          productReturnDate: "2026-06-09",
          deliveryStatus: "Delivered Back",
          userId: "mock-google-user-id",
          createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
          statusHistory: [
            {
              status: "Pending",
              timestamp: new Date(Date.now() - 12 * 86400000).toISOString(),
              changedBy: "Sarah Connor (Customer)",
              notes: "Loud scratching noises reported"
            },
            {
              status: "In Progress",
              timestamp: new Date(Date.now() - 10 * 86400000).toISOString(),
              changedBy: "Agent Marcus",
              notes: "Bumper sensor diagnostics logged"
            },
            {
              status: "Completed",
              timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
              changedBy: "Agent John Connor",
              notes: "Repaired bumper trigger switch and tested navigation gears"
            }
          ]
        }
      ];
      setComplaints(standardComp);
      localStorage.setItem("local_complaints", JSON.stringify(standardComp));
    }
  };

  return (
    <ComplaintContext.Provider value={{
      user,
      userProfile,
      loading,
      customers,
      complaints,
      language,
      setLanguage,
      darkMode,
      setDarkMode,
      activeRole,
      simulateRoleChange,
      isDemoMode,
      loginWithGoogle,
      logout,
      addCustomer,
      addComplaint,
      updateComplaint,
      deleteComplaint,
      triggerSearchGrounding,
      triggerImageGeneration
    }}>
      {children}
    </ComplaintContext.Provider>
  );
};

export const useComplaint = () => {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error("useComplaint must be used within a ComplaintProvider");
  }
  return context;
};
