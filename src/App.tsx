import React, { useState } from "react";
import { ComplaintProvider, useComplaint } from "./context/ComplaintContext";
import { Header } from "./components/Header";
import { DashboardComp } from "./components/Dashboard";
import { ComplaintForm } from "./components/ComplaintForm";
import { ComplaintDetailModal } from "./components/ComplaintDetailModal";
import { translations, Complaint, Customer } from "./types";
import { 
  Plus, 
  Search, 
  Users, 
  CheckCircle, 
  Calendar, 
  Sparkles, 
  Eye, 
  ShoppingBag, 
  Building2, 
  Clock,
  Briefcase
} from "lucide-react";

function MainAppContent() {
  const { 
    complaints, 
    customers, 
    language, 
    loading, 
    user, 
    activeRole,
    loginWithGoogle
  } = useComplaint();
  
  const t = translations[language];

  // UI Flow managers
  const [activeTab, setActiveTab] = useState<"complaints" | "customers">("complaints");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Global search query
  const [searchQuery, setSearchQuery] = useState("");

  // Filters
  const filteredComplaints = complaints.filter(c => {
    const s = searchQuery.toLowerCase();
    return (
      c.customerName.toLowerCase().includes(s) ||
      c.productName.toLowerCase().includes(s) ||
      c.companyName.toLowerCase().includes(s) ||
      c.productModel.toLowerCase().includes(s) ||
      c.productSerialNumber.toLowerCase().includes(s) ||
      c.id.toLowerCase().includes(s)
    );
  });

  const filteredCustomers = customers.filter(cust => {
    const s = searchQuery.toLowerCase();
    return (
      cust.name.toLowerCase().includes(s) ||
      cust.phone.toLowerCase().includes(s) ||
      cust.id.toLowerCase().includes(s) ||
      (cust.email && cust.email.toLowerCase().includes(s))
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A] text-white">
        <div className="w-8 h-8 border border-white/20 border-t-white animate-spin mb-4" />
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E5E5E5] font-sans antialiased selection:bg-white selection:text-black transition-colors duration-300">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 pb-24">
        
        {/* Core welcome banner / auth notice */}
        {!user ? (
          <div className="p-8 border border-white/10 bg-[#0F0F0F] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in">
            <div className="space-y-1.5">
              <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-white/60 stroke-[1.25]" />
                <span>Simulated Secure Workspace</span>
              </h2>
              <p className="text-xs text-white/50 leading-relaxed font-light">
                {t.authMessage}. Type prompts directly to design custom visual products.
              </p>
            </div>
            <button
              id="google-signin-hero"
              onClick={loginWithGoogle}
              className="px-6 py-2.5 bg-white hover:bg-[#E5E5E5] text-black font-extrabold text-[10px] uppercase tracking-widest transition-all"
            >
              <span>{t.anonymousLogin}</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border border-white/10 bg-[#0F0F0F] gap-4 text-xs">
            <span className="text-white/50 font-mono text-[10px] uppercase tracking-wider">
              Secure Agent Session: <strong className="text-white/80">{user.email}</strong>
            </span>
            <span className="flex items-center space-x-2 font-mono text-[9px] uppercase tracking-widest text-white/40">
              <Briefcase className="w-3.5 h-3.5 text-white/35" />
              <span>Privilege: <strong className="text-white/90">{activeRole}</strong></span>
            </span>
          </div>
        )}

        {/* Dashboard KPIs and Charts */}
        <DashboardComp />

        {/* Action Bar: Selection Filter Tabs & Add Complaint */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t border-white/10">
          
          {/* Navigation Tabs */}
          <div className="flex bg-[#0F0F0F] border border-white/10">
            <button
              id="tab-complaints"
              onClick={() => { setActiveTab("complaints"); setShowAddForm(false); }}
              className={`px-5 py-2.5 text-[10px] font-mono uppercase tracking-[0.15em] transition-all ${
                activeTab === "complaints" && !showAddForm
                  ? "bg-white text-black font-extrabold"
                  : "text-white/40 hover:text-white"
              }`}
            >
              Complaints Registry ({complaints.length})
            </button>
            <button
              id="tab-customers"
              onClick={() => { setActiveTab("customers"); setShowAddForm(false); }}
              className={`px-5 py-2.5 text-[10px] font-mono uppercase tracking-[0.15em] transition-all ${
                activeTab === "customers" && !showAddForm
                  ? "bg-white text-black font-extrabold"
                  : "text-white/40 hover:text-white"
              }`}
            >
              {t.customers} ({customers.length})
            </button>
          </div>

          {/* Combined Search Inputs and Addition Trigger */}
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 items-stretch">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 stroke-[1.25]" />
              <input
                id="search-input-box"
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#0F0F0F] border border-white/10 focus:outline-none focus:border-white text-xs text-white placeholder-white/20 font-mono tracking-wide"
              />
            </div>

            {activeRole !== "Viewer" && (
              <button
                id="trigger-add-form"
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center justify-center space-x-2 px-5 py-2 bg-white hover:bg-[#E5E5E5] text-black text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addComplaint}</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Display Screens */}
        {showAddForm ? (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif italic text-2xl tracking-tight text-white mb-2">
                Register New Customer Complaint
              </h3>
              <button
                id="close-add-form"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-white/10 hover:border-white/30 text-[10px] font-mono uppercase tracking-widest text-white/75 hover:text-white transition-colors cursor-pointer"
              >
                Back to Registry
              </button>
            </div>
            <ComplaintForm 
              onSuccess={() => { setShowAddForm(false); setActiveTab("complaints"); }} 
              onCancel={() => setShowAddForm(false)} 
            />
          </div>
        ) : activeTab === "complaints" ? (
          
          /* --- COMPLAINTS TABLE / GRID VIEW --- */
          filteredComplaints.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredComplaints.map((comp) => {
                
                // Muted aesthetic indicators aligned to status
                let statusLabelClass = "border-amber-500/30 text-amber-300 bg-amber-500/5";
                if (comp.status === "Sent to Company") statusLabelClass = "border-sky-500/30 text-sky-300 bg-sky-500/5";
                if (comp.status === "In Progress") statusLabelClass = "border-white/30 text-white bg-white/5";
                if (comp.status === "Completed") statusLabelClass = "border-white/50 text-white bg-white/10";
                if (comp.status === "Returned") statusLabelClass = "border-purple-500/30 text-purple-300 bg-purple-500/5";

                return (
                  <div
                    key={comp.id}
                    id={`complaint-card-${comp.id}`}
                    className="p-6 bg-[#0F0F0F] border border-white/10 hover:border-white/30 transition-all cursor-pointer relative group flex flex-col sm:flex-row gap-6"
                    onClick={() => setSelectedComplaint(comp)}
                  >
                    {/* Visual state line strip */}
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Left Column: Product Avatar & Details */}
                    {comp.productImage ? (
                      <div className="w-full sm:w-24 h-24 border border-white/10 overflow-hidden flex-shrink-0 bg-white/[0.02] p-1 flex items-center justify-center">
                        <img
                          src={comp.productImage}
                          alt="Product illustrative preview"
                          referrerPolicy="no-referrer"
                          className="object-contain max-h-full max-w-full"
                        />
                      </div>
                    ) : (
                      <div className="w-full sm:w-24 h-24 border border-white/10 overflow-hidden flex-shrink-0 bg-white/[0.02] flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-white/30 stroke-[1.25]" />
                      </div>
                    )}

                    {/* Core description data */}
                    <div className="flex-1 space-y-3.5">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div>
                          <span className="text-[9px] font-mono tracking-[0.2em] text-white/40 uppercase">
                            Docket ID: {comp.id}
                          </span>
                          <h4 className="font-serif italic text-lg text-white mt-1 leading-snug">
                            {comp.productName} <span className="text-white/40 font-sans not-italic text-xs">({comp.productModel || "Standard Model"})</span>
                          </h4>
                        </div>
                        <div className="flex gap-2.5 items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 border text-[9px] font-mono uppercase tracking-wider ${statusLabelClass}`}>
                            {comp.status}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 border border-white/5 bg-white/[0.02] text-[9px] font-mono text-white/50 uppercase tracking-wider">
                            {comp.deliveryStatus}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-white/60 leading-relaxed font-light line-clamp-2">
                        {comp.description}
                      </p>

                      <div className="flex flex-wrap gap-y-2 gap-x-6 text-[10px] text-white/40 font-mono tracking-wide pt-3 border-t border-white/5">
                        <span className="flex items-center space-x-2">
                          <Users className="w-3.5 h-3.5 text-white/20 stroke-[1.25]" />
                          <span>Customer: <strong className="text-white/70 font-sans font-medium">{comp.customerName}</strong></span>
                        </span>
                        <span className="flex items-center space-x-2">
                          <Building2 className="w-3.5 h-3.5 text-white/20 stroke-[1.25]" />
                          <span>Manufacturer: <strong className="text-white/70 font-sans font-medium">{comp.companyName}</strong></span>
                        </span>
                        {comp.expectedReturnDate && (
                          <span className="flex items-center space-x-2">
                            <Clock className="w-3.5 h-3.5 text-white/20 stroke-[1.25]" />
                            <span>Return Deadline: <strong className="text-white/70 font-sans font-medium">{comp.expectedReturnDate}</strong></span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* View Button */}
                    <div className="flex sm:flex-col justify-end items-end shrink-0 pl-2">
                      <button
                        id={`inspect-details-${comp.id}`}
                        type="button"
                        className="p-2 border border-white/10 hover:border-white hover:bg-white hover:text-black text-white/75 transition-colors"
                        title="Inspect full complaint details"
                      >
                        <Eye className="w-4 h-4 stroke-[1.25]" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-16 border border-dashed border-white/10 text-white/20">
              <CheckCircle className="w-8 h-8 mx-auto mb-4 stroke-[1.25] text-white/10" />
              <p className="text-xs uppercase tracking-wider">{t.noData}</p>
            </div>
          )
        ) : (
          
          /* --- CUSTOMERS DATABASE VIEW --- */
          filteredCustomers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              {filteredCustomers.map((cust) => {
                const customerComplaints = complaints.filter(c => c.customerId === cust.id);

                return (
                  <div
                    key={cust.id}
                    id={`customer-card-${cust.id}`}
                    className="p-6 bg-[#0F0F0F] border border-white/10 hover:border-white/30 transition-all space-y-5"
                  >
                    <div>
                      <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block">
                        Ref Code: {cust.id}
                      </span>
                      <h4 className="font-serif italic text-lg text-white mt-1">
                        {cust.name}
                      </h4>
                    </div>

                    <div className="space-y-2.5 text-xs font-mono text-white/60">
                      <p className="flex justify-between items-center border-b border-white/[0.02] pb-1.5Shared border-b border-dashed border-zinc-200">
                        <span className="text-white/45 uppercase tracking-wider text-[10px]">Phone:</span>
                        <strong className="text-white/80 font-sans font-medium">{cust.phone}</strong>
                      </p>
                      {cust.email && (
                        <p className="flex justify-between items-center border-b border-white/[0.02] pb-1.5">
                          <span className="text-white/45 uppercase tracking-wider text-[10px]">Email:</span>
                          <strong className="text-white/80 font-sans font-medium truncate max-w-[150px]">{cust.email}</strong>
                        </p>
                      )}
                      <p className="flex justify-between items-center">
                        <span className="text-white/45 uppercase tracking-wider text-[10px]">Joined:</span>
                        <span className="text-white/70">{new Date(cust.createdAt).toLocaleDateString()}</span>
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">Complaints Filed:</span>
                      <span className="inline-flex items-center px-3 py-0.5 border border-white/10 bg-white/5 text-white text-[10px] font-mono">
                        {customerComplaints.length}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-16 border border-dashed border-white/10 text-white/20">
              <Users className="w-8 h-8 mx-auto mb-4 stroke-[1.25] text-white/10" />
              <p className="text-xs uppercase tracking-wider">{t.noData}</p>
            </div>
          )
        )}
      </main>

      {/* Inspect Detail Modal overlay */}
      {selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onUpdated={() => { setSelectedComplaint(null); }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ComplaintProvider>
      <MainAppContent />
    </ComplaintProvider>
  );
}
