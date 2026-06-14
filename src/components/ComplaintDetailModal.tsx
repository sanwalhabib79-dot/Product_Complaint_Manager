import React, { useState } from "react";
import { useComplaint } from "../context/ComplaintContext";
import { Complaint, translations } from "../types";
import { 
  X, 
  Printer, 
  FileText, 
  Trash2, 
  Save, 
  Calendar, 
  Building, 
  User, 
  CheckCircle2, 
  Truck,
  AlertTriangle
} from "lucide-react";

interface ComplaintDetailModalProps {
  complaint: Complaint;
  onClose: () => void;
  onUpdated: () => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({ 
  complaint, 
  onClose, 
  onUpdated 
}) => {
  const { 
    updateComplaint, 
    deleteComplaint, 
    activeRole, 
    language 
  } = useComplaint();
  const t = translations[language];

  // Editable fields inside modal
  const [status, setStatus] = useState<Complaint["status"]>(complaint.status);
  const [notes, setNotes] = useState(complaint.notes);
  const [companyComplaintNumber, setCompanyComplaintNumber] = useState(complaint.companyComplaintNumber || "");
  const [companyResponseStatus, setCompanyResponseStatus] = useState(complaint.companyResponseStatus || "");
  const [companyNotes, setCompanyNotes] = useState(complaint.companyNotes || "");
  const [deliveryStatus, setDeliveryStatus] = useState(complaint.deliveryStatus || "Arrived");
  const [productReturnDate, setProductReturnDate] = useState(complaint.productReturnDate || "");

  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState("");

  const handleUpdate = async () => {
    if (activeRole === "Viewer") {
      setErrorText("VIEWER_ACCESS_DENIED: Viewers cannot modify logs.");
      return;
    }
    setSaving(true);
    setErrorText("");
    try {
      await updateComplaint(complaint.id, {
        status,
        notes,
        companyComplaintNumber,
        companyResponseStatus,
        companyNotes,
        deliveryStatus,
        productReturnDate
      });
      onUpdated();
    } catch (err: any) {
      setErrorText(err.message || "Failed updating details.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (activeRole !== "Admin") {
      setErrorText("ADMIN_ACCES_DENIED: Only system Administrators can remove logs.");
      return;
    }
    if (window.confirm("Are you sure you want to permanently delete this complaint dossier? This cannot be undone.")) {
      try {
        await deleteComplaint(complaint.id);
        onUpdated();
      } catch (err: any) {
        setErrorText(err.message || "Failed deleting complaint registry.");
      }
    }
  };

  const handlePrint = (type: "receipt" | "dossier") => {
    // Open a new printable context or invoke a print layout setup
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print physical receipts.");
      return;
    }

    const title = type === "receipt" ? "Product Complaint Receipt - Customer Docket" : "Complaint Dossier Investigation Report";
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #27272a; line-height: 1.5; }
            .header { border-bottom: 2px solid #e4e4e7; padding-bottom: 20px; margin-bottom: 30px; text-align: center; }
            .logo { font-size: 24px; font-weight: bold; color: #4f46e5; }
            .receipt-id { font-size: 14px; color: #71717a; margin-top: 5px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
            .section { border: 1px solid #e4e4e7; border-radius: 8px; padding: 20px; background-color: #fafafa; }
            .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a; border-bottom: 1px solid #e4e4e7; padding-bottom: 10px; margin-bottom: 15px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
            .row-label { font-weight: 600; color: #52525b; }
            .row-val { color: #18181b; }
            .desc-box { font-size: 14px; background: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
            .notes-box { font-size: 13px; font-style: italic; color: #52525b; border-left: 3px solid #6366f1; padding-left: 15px; margin-top: 15px; }
            .footer { text-align: center; margin-top: 60px; font-size: 11px; color: #a1a1aa; border-top: 1px solid #e4e4e7; padding-top: 20px; }
            .sign-section { display: flex; justify-content: space-between; margin-top: 50px; font-size: 14px; }
            .sign-line { border-top: 1px solid #71717a; width: 200px; text-align: center; padding-top: 5px; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">My Product Complaint Manager</div>
            <div class="receipt-id">Complaint ID: <strong>${complaint.id}</strong> | Registered on: ${new Date(complaint.createdAt).toLocaleDateString()}</div>
          </div>

          <div class="grid">
            <div class="section">
              <div class="section-title">Customer Information</div>
              <div class="row"><span class="row-label">Customer Name:</span><span class="row-val">${complaint.customerName}</span></div>
              <div class="row"><span class="row-label">Phone:</span><span class="row-val">${complaint.customerPhone}</span></div>
              <div class="row"><span class="row-label">Customer ID:</span><span class="row-val">${complaint.customerId}</span></div>
            </div>

            <div class="section">
              <div class="section-title">Faulty Product Information</div>
              <div class="row"><span class="row-label">Product Name:</span><span class="row-val">${complaint.productName}</span></div>
              <div class="row"><span class="row-label">Category:</span><span class="row-val">${complaint.productCategory}</span></div>
              <div class="row"><span class="row-label">Model:</span><span class="row-val">${complaint.productModel || "N/A"}</span></div>
              <div class="row"><span class="row-label">Serial Number:</span><span class="row-val">${complaint.productSerialNumber || "N/A"}</span></div>
            </div>
          </div>

          <div class="grid">
            <div class="section">
              <div class="section-title">Supplier/Company Info</div>
              <div class="row"><span class="row-label">Manufacturer:</span><span class="row-val">${complaint.companyName}</span></div>
              <div class="row"><span class="row-label">Docket No:</span><span class="row-val">${complaint.companyComplaintNumber || "Awaiting Intake"}</span></div>
              <div class="row"><span class="row-label">Sent Date:</span><span class="row-val">${complaint.complaintSentDate || "Pending"}</span></div>
              <div class="row"><span class="row-label">Response Status:</span><span class="row-val">${complaint.companyResponseStatus || "Pending Review"}</span></div>
            </div>

            <div class="section">
              <div class="section-title">Timeline & Intake</div>
              <div class="row"><span class="row-label">Receive Date:</span><span class="row-val">${complaint.productReceiveDate || "Pending"}</span></div>
              <div class="row"><span class="row-label">Expected Return:</span><span class="row-val">${complaint.expectedReturnDate || "Under evaluation"}</span></div>
              <div class="row"><span class="row-label">Actual Return:</span><span class="row-val">${complaint.productReturnDate || "Outstanding"}</span></div>
              <div class="row"><span class="row-label">Delivery Status:</span><span class="row-val">${complaint.deliveryStatus}</span></div>
            </div>
          </div>

          <div class="desc-box">
            <div style="font-weight: bold; margin-bottom: 10px;">Grievance & Fault Details:</div>
            <div>${complaint.description}</div>
            
            ${complaint.companyNotes ? `
              <div style="font-weight: bold; margin-top: 20px; margin-bottom: 10px;">Supplier Notes:</div>
              <div style="font-size: 13px; color: #52525b;">${complaint.companyNotes}</div>
            ` : ""}

            ${complaint.notes ? `
              <div class="notes-box">
                <strong>Internal Diagnostics Note:</strong><br/>
                ${complaint.notes}
              </div>
            ` : ""}
          </div>

          <div class="sign-section">
            <div class="sign-line">Intake Agent Signature</div>
            <div class="sign-line">Customer Signature</div>
          </div>

          <div class="footer">
            Generated via high-integrity diagnostic tracker. Authorized business copy.
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#0F0F0F] text-white border border-white/10 rounded-none shadow-2xl overflow-hidden transition-colors">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-mono bg-white/5 border border-white/10 text-white/50 uppercase tracking-widest">
                {complaint.id}
              </span>
              <span className="text-white/40 text-[10px] font-mono">| Registered: {new Date(complaint.createdAt).toLocaleDateString()}</span>
            </div>
            <h2 className="text-lg font-serif italic text-white mt-1.5">
              {complaint.productName} ({complaint.productModel || "Standard Model"})
            </h2>
          </div>
          <button
            id="close-modal-btn"
            onClick={onClose}
            className="p-1 border border-white/5 hover:border-white text-white/40 hover:text-white transition-all rounded-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto space-y-6">
          {errorText && (
            <div className="p-3 bg-red-950/20 border border-red-500/30 text-red-400 rounded-none text-xs font-mono flex items-center space-x-1">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorText}</span>
            </div>
          )}

          {/* Customer & Product quick split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <div className="p-5 border border-white/10 bg-white/[0.01] space-y-3">
              <div className="flex items-center space-x-2 text-white/80 text-[10px] font-mono uppercase tracking-widest">
                <User className="w-4 h-4 text-white/45" />
                <span>{t.customerInfo}</span>
              </div>
              <div className="space-y-1.5 text-xs font-mono text-white/60">
                <p>Name: <strong className="text-white">{complaint.customerName}</strong></p>
                <p>Phone: <strong className="text-white">{complaint.customerPhone}</strong></p>
                <p>Customer Ref ID: <span className="text-white font-semibold">{complaint.customerId}</span></p>
              </div>
            </div>

            <div className="p-5 border border-white/10 bg-white/[0.01] space-y-3">
              <div className="flex items-center space-x-2 text-white/80 text-[10px] font-mono uppercase tracking-widest">
                <Calendar className="w-4 h-4 text-white/45" />
                <span>Intake Timelines</span>
              </div>
              <div className="space-y-1.5 text-xs font-mono text-white/60">
                <p>Receive Date: <strong className="text-white">{complaint.productReceiveDate || "Outstanding"}</strong></p>
                <p>Expected Response Return: <strong className="text-white">{complaint.expectedReturnDate || "Under Diagnostic evaluation"}</strong></p>
                <p>Actual Return Date: <strong className="text-white">{complaint.productReturnDate || "Outstanding"}</strong></p>
              </div>
            </div>
          </div>

          {/* Grievance Details & Product Image Split */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <h4 className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/40">
                Customer Complaint Details
              </h4>
              <p className="p-5 bg-[#0A0A0A] text-xs text-white/80 whitespace-pre-wrap leading-relaxed border border-white/10 font-sans">
                {complaint.description}
              </p>
            </div>

            {/* Product visual preview block if exists */}
            {complaint.productImage && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/40">
                  Visual Assets Evidence
                </h4>
                <div className="w-full h-32 border border-white/10 bg-[#0A0A0A] flex items-center justify-center p-1.5">
                  <img
                    src={complaint.productImage}
                    alt="Complaint Evidence"
                    referrerPolicy="no-referrer"
                    className="object-contain max-h-full max-w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Visual Progress Timeline */}
          <div className="p-5 border border-white/10 bg-white/[0.01] space-y-4">
            <h4 className="text-[10px] font-mono text-white/80 uppercase tracking-widest flex items-center space-x-1.5 border-b border-white/5 pb-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span>Dossier Lifecycle Timeline</span>
            </h4>
            
            <div className="relative pl-6 border-l border-white/10 ml-3 space-y-6 py-1">
              {(complaint.statusHistory && complaint.statusHistory.length > 0
                ? complaint.statusHistory
                : [
                    {
                      status: "Pending" as const,
                      timestamp: complaint.createdAt,
                      changedBy: "System Registration",
                      notes: "Complaint logged initially"
                    }
                  ]).map((item, index) => {
                let statusColorClass = "bg-zinc-500/10 text-zinc-300 border-zinc-500/25";
                let dotColorClass = "bg-zinc-500 border-zinc-950";
                
                if (item.status === "Pending") {
                  statusColorClass = "bg-amber-500/15 text-amber-400 border-amber-500/30";
                  dotColorClass = "bg-amber-500 border-[#0F0F0F]";
                } else if (item.status === "Sent to Company") {
                  statusColorClass = "bg-[#1E293B] text-sky-400 border-sky-500/30";
                  dotColorClass = "bg-sky-400 border-[#0F0F0F]";
                } else if (item.status === "In Progress") {
                  statusColorClass = "bg-purple-500/15 text-purple-400 border-purple-500/30";
                  dotColorClass = "bg-purple-400 border-[#0F0F0F]";
                } else if (item.status === "Completed") {
                  statusColorClass = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
                  dotColorClass = "bg-emerald-500 border-[#0F0F0F]";
                } else if (item.status === "Returned") {
                  statusColorClass = "bg-zinc-500/15 text-zinc-300 border-zinc-500/30";
                  dotColorClass = "bg-zinc-300 border-[#0F0F0F]";
                }

                return (
                  <div key={index} className="relative group">
                    {/* Circle Pin on Line */}
                    <div className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 ${dotColorClass} transition-all duration-300`} />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center space-x-2.5">
                        <span className={`px-2 py-0.5 text-[9px] font-mono font-medium uppercase tracking-wider border ${statusColorClass}`}>
                          {item.status}
                        </span>
                        <span className="text-[10px] text-white/40 font-mono">
                          by <strong className="text-white/70">{item.changedBy}</strong>
                        </span>
                      </div>
                      
                      <span className="text-[10px] text-white/30 font-mono sm:text-right">
                        {new Date(item.timestamp).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short"
                        })}
                      </span>
                    </div>

                    {item.notes && (
                      <p className="mt-1.5 text-xs text-white/60 font-mono bg-white/[0.01] border border-white/5 px-2.5 py-1.5 leading-relaxed rounded-none max-w-2xl">
                        {item.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Editable Progression Controls (Admin & Agent Only) */}
          <div className="p-6 border border-white/10 bg-[#0A0A0A] space-y-5">
            <h4 className="text-[10px] font-mono text-white/80 uppercase tracking-widest flex items-center space-x-1.5 border-b border-white/5 pb-2">
              <CheckCircle2 className="w-4 h-4 text-white/50" />
              <span>Dossier Management & Progress Updates</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <label className="block text-white/40 text-[9px] uppercase tracking-wider mb-2">
                  System Complaint Status
                </label>
                <select
                  id="modal-status-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Complaint["status"])}
                  className="w-full px-3 py-2 border border-white/10 bg-[#0F0F0F] text-white focus:outline-none focus:border-white text-xs"
                >
                  <option value="Pending" className="bg-[#0F0F0F]">Pending</option>
                  <option value="Sent to Company" className="bg-[#0F0F0F]">Sent to Company</option>
                  <option value="In Progress" className="bg-[#0F0F0F]">In Progress</option>
                  <option value="Completed" className="bg-[#0F0F0F]">Completed</option>
                  <option value="Returned" className="bg-[#0F0F0F]">Returned</option>
                </select>
              </div>

              <div>
                <label className="block text-white/40 text-[9px] uppercase tracking-wider mb-2">
                  Delivery Progress Status
                </label>
                <select
                  id="modal-delivery-select"
                  value={deliveryStatus}
                  onChange={(e) => setDeliveryStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-white/10 bg-[#0F0F0F] text-white focus:outline-none focus:border-white text-xs"
                >
                  <option value="Arrived" className="bg-[#0F0F0F]">Arrived (Awaiting Intake)</option>
                  <option value="In Transit" className="bg-[#0F0F0F]">In Transit to Company Depot</option>
                  <option value="Awaiting Parts" className="bg-[#0F0F0F]">Awaiting Parts/Diagnosis</option>
                  <option value="Completed at Depot" className="bg-[#0F0F0F]">Completed at Depot</option>
                  <option value="Awaiting Pickup" className="bg-[#0F0F0F]">Awaiting Customer Pickup</option>
                  <option value="Delivered Back" className="bg-[#0F0F0F]">Delivered Back to Customer</option>
                </select>
              </div>

              <div>
                <label className="block text-white/40 text-[9px] uppercase tracking-wider mb-2">
                  Actual Return Date
                </label>
                <input
                  id="modal-return-date-input"
                  type="date"
                  value={productReturnDate}
                  onChange={(e) => setProductReturnDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-white/10 bg-[#0F0F0F] text-white focus:outline-none focus:border-white text-xs"
                />
              </div>
            </div>

            {/* Structured Company fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono pt-1">
              <div>
                <label className="block text-white/40 text-[9px] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Building className="w-3.5 h-3.5" />
                  <span>Company Complaint Number</span>
                </label>
                <input
                  id="modal-comp-number-input"
                  type="text"
                  value={companyComplaintNumber}
                  onChange={(e) => setCompanyComplaintNumber(e.target.value)}
                  placeholder="e.g. COMP-90401"
                  className="w-full px-3 py-2 border border-white/10 bg-[#0F0F0F] text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-white/40 text-[9px] uppercase tracking-wider mb-2">
                  Company Response Status Notes
                </label>
                <input
                  id="modal-response-status-input"
                  type="text"
                  value={companyResponseStatus}
                  onChange={(e) => setCompanyResponseStatus(e.target.value)}
                  placeholder="e.g. Approved / Pending diagnosis replacement"
                  className="w-full px-3 py-2 border border-white/10 bg-[#0F0F0F] text-white focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <div className="text-xs pt-1">
              <label className="block text-white/40 text-[9px] font-mono uppercase tracking-wider mb-2">
                Company Response Notes
              </label>
              <textarea
                id="modal-company-notes-textarea"
                value={companyNotes}
                onChange={(e) => setCompanyNotes(e.target.value)}
                rows={3}
                placeholder="Discussions/timeline updates with manufacturer..."
                className="w-full px-3 py-2 border border-white/10 bg-[#0F0F0F] text-white focus:outline-none focus:border-white text-xs font-mono"
              />
            </div>

            <div className="text-xs pt-1">
              <label className="block text-white/40 text-[9px] font-mono uppercase tracking-wider mb-2">
                Internal Agent Diagnostics Note
              </label>
              <textarea
                id="modal-agent-notes-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Annotation for other agents or technicians..."
                className="w-full px-3 py-2 border border-white/10 bg-[#0F0F0F] text-white focus:outline-none focus:border-white text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#0B0B0B] flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
          {/* Action-based Print/Receipt Buttons */}
          <div className="flex gap-2.5">
            <button
               id="print-receipt-btn"
               type="button"
               onClick={() => handlePrint("receipt")}
               className="inline-flex items-center space-x-1.5 px-3.5 py-2 border border-white/10 hover:border-white text-white text-[9px] font-mono uppercase tracking-widest bg-transparent transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-white/40" />
              <span>{t.printReceipt}</span>
            </button>
            <button
              id="export-pdf-btn"
              type="button"
              onClick={() => handlePrint("dossier")}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 border border-white/10 hover:border-white text-white text-[9px] font-mono uppercase tracking-widest bg-transparent transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-white/40" />
              <span>{t.exportPdf}</span>
            </button>
          </div>

          <div className="flex items-center space-x-3.5">
            {activeRole === "Admin" && (
              <button
                id="delete-complaint-btn"
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center space-x-1 px-3 py-2 text-red-400 hover:text-red-300 border border-red-500/25 hover:border-red-500 text-[9px] font-mono uppercase tracking-widest font-bold bg-transparent transition-all"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                <span>Delete</span>
              </button>
            )}

            <button
              id="save-modal-updates-btn"
              type="button"
              onClick={handleUpdate}
              disabled={saving}
              className="inline-flex items-center space-x-1.5 px-5 py-2 bg-white text-black hover:bg-[#E5E5E5] disabled:bg-white/40 text-[9px] font-mono uppercase tracking-widest font-bold transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Dossier Changes"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
