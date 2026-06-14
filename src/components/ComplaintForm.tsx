import React, { useState } from "react";
import { useComplaint, compressImage } from "../context/ComplaintContext";
import { translations, Complaint, Customer } from "../types";
import { 
  Sparkles, 
  Search, 
  Image as ImageIcon, 
  CornerDownRight, 
  ArrowRight, 
  UserPlus, 
  Save, 
  X,
  UploadCloud,
  FileSearch2
} from "lucide-react";

interface ComplaintFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const ComplaintForm: React.FC<ComplaintFormProps> = ({ onSuccess, onCancel }) => {
  const { 
    customers, 
    addCustomer, 
    addComplaint, 
    language,
    triggerSearchGrounding,
    triggerImageGeneration
  } = useComplaint();

  const t = translations[language];

  // Section states
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [showNewCustForm, setShowNewCustForm] = useState(false);
  
  // New Customer states
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");

  // Complaint Core fields
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Complaint["status"]>("Pending");
  const [notes, setNotes] = useState("");

  // Product fields
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("Consumer Electronics");
  const [productModel, setProductModel] = useState("");
  const [productSerialNumber, setProductSerialNumber] = useState("");
  const [productImage, setProductImage] = useState("");

  // Company fields
  const [companyName, setCompanyName] = useState("");
  const [complaintSentDate, setComplaintSentDate] = useState("");
  const [companyComplaintNumber, setCompanyComplaintNumber] = useState("");
  const [companyResponseStatus, setCompanyResponseStatus] = useState("Under Review");
  const [companyNotes, setCompanyNotes] = useState("");

  // Date management
  const [productReceiveDate, setProductReceiveDate] = useState("");
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [productReturnDate, setProductReturnDate] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("Arrived");

  // AI loading and output feedback states
  const [aiGroundingVal, setAiGroundingVal] = useState("");
  const [isGroundingLoading, setIsGroundingLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Form error notification
  const [errMessage, setErrMessage] = useState("");

  // Search grounding helper triggering
  const handleGroundingSearch = async () => {
    if (!productName || !companyName) {
      setErrMessage("Please enter Product Name and Company Name first to ground search details.");
      return;
    }
    setErrMessage("");
    setIsGroundingLoading(true);
    try {
      const result = await triggerSearchGrounding(productName, companyName, productModel);
      setAiGroundingVal(result.text);
      if (result.text && !companyNotes) {
        // Auto-fill company notes based on AI research response channels
        setCompanyNotes(`Official standard contact research details:\n${result.text.slice(0, 500)}...`);
      }
    } catch (err: any) {
      setErrMessage(err.message || "Failed search grounding.");
    } finally {
      setIsGroundingLoading(false);
    }
  };

  // AI visual template builder triggering
  const handleAILogoGenerate = async () => {
    if (!aiPrompt) {
      setErrMessage("Specify an illustration prompt first.");
      return;
    }
    setErrMessage("");
    setIsImageLoading(true);
    try {
      const base64 = await triggerImageGeneration(aiPrompt);
      setProductImage(base64);
    } catch (err: any) {
      setErrMessage(err.message || "AI logo building error.");
    } finally {
      setIsImageLoading(false);
    }
  };

  // Local File image picker handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const rawBase64 = reader.result as string;
        try {
          const compressed = await compressImage(rawBase64);
          setProductImage(compressed);
        } catch (err) {
          console.warn("Immediate compression failed, setting original", err);
          setProductImage(rawBase64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Create customized inline Customer first
  const handleInlineCustomerCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) {
      setErrMessage("Name and Phone are mandatory for customer registration.");
      return;
    }
    setErrMessage("");
    try {
      await addCustomer(newCustName, newCustPhone, newCustEmail);
      // Re-find target customer and auto-populate
      setShowNewCustForm(false);
      setNewCustName("");
      setNewCustPhone("");
      setNewCustEmail("");
    } catch (err: any) {
      setErrMessage(err.message || "Customer registration failed.");
    }
  };

  // Save full Complaint
  const handleFormSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setErrMessage("Please select an active complaint customer registration.");
      return;
    }
    if (!productName || !companyName || !description) {
      setErrMessage("Product, Company, and Complaint description details are strict requirements.");
      return;
    }

    const matchedCust = customers.find(c => c.id === selectedCustomerId);
    if (!matchedCust) {
      setErrMessage("Invalid customer link.");
      return;
    }

    setErrMessage("");
    try {
      await addComplaint({
        customerId: matchedCust.id,
        customerName: matchedCust.name,
        customerPhone: matchedCust.phone,
        description,
        status,
        notes,
        productName,
        productCategory,
        productModel,
        productSerialNumber,
        productImage,
        companyName,
        complaintSentDate,
        companyComplaintNumber,
        companyResponseStatus,
        companyNotes,
        productReceiveDate,
        expectedReturnDate,
        productReturnDate,
        deliveryStatus
      });
      onSuccess();
    } catch (err: any) {
      setErrMessage(err.message || "Failed to catalog complaint.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Alert Header */}
      {errMessage && (
        <div id="form-error-toast" className="p-4 bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 rounded-r-xl text-sm font-medium">
          {errMessage}
        </div>
      )}

      {/* 1. Customer Section */}
      <div className="p-8 border border-white/10 bg-[#0F0F0F] transition-colors">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5 border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <span className="flex items-center justify-center w-7 h-7 border border-white/10 bg-white/5 text-white/50 text-[10px] font-mono">
              01
            </span>
            <h3 className="font-serif italic text-base text-white">{t.customerInfo}</h3>
          </div>

          <button
            id="toggle-inline-customer"
            type="button"
            onClick={() => setShowNewCustForm(!showNewCustForm)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 border border-white/10 hover:border-white text-white text-[9px] font-mono uppercase tracking-widest bg-transparent transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{showNewCustForm ? "Select Existing" : t.addCustomer}</span>
          </button>
        </div>

        {showNewCustForm ? (
          <form id="inline-customer-form" onSubmit={handleInlineCustomerCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-white/40 mb-2">
                  {t.customerName} *
                </label>
                <input
                  id="inline-cust-name"
                  type="text"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-white/10 text-white text-[11px] font-mono tracking-wide focus:outline-none focus:border-white"
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-white/40 mb-2">
                  {t.phone} *
                </label>
                <input
                  id="inline-cust-phone"
                  type="text"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-white/10 text-white text-[11px] font-mono tracking-wide focus:outline-none focus:border-white"
                  placeholder="+1 (555) 019-3829"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-white/40 mb-2">
                  Email
                </label>
                <input
                  id="inline-cust-email"
                  type="email"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-white/10 text-white text-[11px] font-mono tracking-wide focus:outline-none focus:border-white"
                  placeholder="jane.smith@domain.com"
                />
              </div>
            </div>
            <button
              id="submit-inline-customer"
              type="submit"
              className="px-4 py-2 bg-white hover:bg-[#E5E5E5] text-black font-bold text-[10px] uppercase tracking-wider"
            >
              Add and Link Customer
            </button>
          </form>
        ) : (
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-white/40 mb-2">
              Select Customer for Complaint Dossier *
            </label>
            <select
              id="customer-selection"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-white/10 text-white text-[11px] font-mono tracking-wide focus:outline-none focus:border-white"
            >
              <option value="">-- Choose registered customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#0A0A0A]">
                  {c.name} ({c.phone}) - {c.id}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <form id="complaint-main-form" onSubmit={handleFormSubmission} className="space-y-6">
        {/* 2. Product Information */}
        <div className="p-8 border border-white/10 bg-[#0F0F0F] transition-colors">
          <div className="flex items-center space-x-3 mb-5 border-b border-white/10 pb-4">
            <span className="flex items-center justify-center w-7 h-7 border border-white/10 bg-white/5 text-white/50 text-[10px] font-mono">
              02
            </span>
            <h3 className="font-serif italic text-base text-white">{t.productInfo}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-white/40 mb-2">
                  {t.productName} *
                </label>
                <input
                  id="form-prod-name"
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-white/10 text-white text-[11px] font-mono tracking-wide focus:outline-none focus:border-white"
                  placeholder="e.g. Smart Kettle Pro"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-white/40 mb-2">
                    {t.model}
                  </label>
                  <input
                    id="form-prod-model"
                    type="text"
                    value={productModel}
                    onChange={(e) => setProductModel(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-white/10 text-white text-[11px] font-mono tracking-wide focus:outline-none focus:border-white"
                    placeholder="e.g. SK-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-white/40 mb-2">
                    {t.serialNumber}
                  </label>
                  <input
                    id="form-prod-serial"
                    type="text"
                    value={productSerialNumber}
                    onChange={(e) => setProductSerialNumber(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-white/10 text-white text-[11px] font-mono tracking-wide focus:outline-none focus:border-white"
                    placeholder="e.g. SN-883901"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-white/40 mb-2">
                  Category
                </label>
                <select
                  id="form-prod-category"
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-white/10 text-white text-[11px] font-mono tracking-wide focus:outline-none focus:border-white"
                >
                  <option value="Consumer Electronics" className="bg-[#0A0A0A]">Consumer Electronics</option>
                  <option value="Kitchen Appliances" className="bg-[#0A0A0A]">Kitchen Appliances</option>
                  <option value="Smart Home Appliances" className="bg-[#0A0A0A]">Smart Home Appliances</option>
                  <option value="Laptops & Computing" className="bg-[#0A0A0A]">Laptops & Computing</option>
                  <option value="Audio Equipment" className="bg-[#0A0A0A]">Audio Equipment</option>
                  <option value="Surgical/Tech Hardware" className="bg-[#0A0A0A]">Medical Hardware</option>
                </select>
              </div>
            </div>

            {/* Product Image Selection & AI Gen Panel */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-white/40 mb-2">
                  Product Illustration / Proof Image
                </label>
                {productImage ? (
                  <div className="relative w-full h-40 border border-white/10 bg-white/[0.02] flex items-center justify-center">
                    <img
                      src={productImage}
                      alt="Product Preview"
                      referrerPolicy="no-referrer"
                      className="object-contain max-h-full max-w-full"
                    />
                    <button
                      id="discard-image"
                      type="button"
                      onClick={() => setProductImage("")}
                      className="absolute top-2 right-2 p-1.5 bg-red-650 hover:bg-red-700 text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/10 cursor-pointer hover:bg-white/[0.02] transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-8 h-8 text-white/30 mb-2" />
                      <p className="text-[10px] font-mono uppercase tracking-wider text-white/50">
                        Upload Product Photo
                      </p>
                      <p className="text-[9px] text-white/30 mt-1 font-mono">
                        PNG, JPG, JPEG (Base64)
                      </p>
                    </div>
                    <input
                      id="file-upload-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* AI Product Image Generator Panel */}
              <div className="p-4 border border-white/5 bg-white/[0.02]">
                <div className="flex items-center space-x-1.5 text-white/80 font-mono text-[9px] uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-white/40" />
                  <span>{t.imageGen}</span>
                </div>
                <div className="flex space-x-2">
                  <input
                    id="ai-prompt-input"
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. Sleek black smart coffee maker with leaks"
                    className="flex-1 px-3 py-1.5 text-xs bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-white font-mono"
                  />
                  <button
                    id="ai-image-btn"
                    type="button"
                    onClick={handleAILogoGenerate}
                    disabled={isImageLoading}
                    className="px-4 py-1.5 bg-white text-black hover:bg-[#E5E5E5] font-bold text-[9px] uppercase tracking-wide transition-colors"
                  >
                    <span>{isImageLoading ? "GENING..." : t.generateMockup}</span>
                  </button>
                </div>
                <span className="block text-[9px] text-white/30 mt-2 font-mono">
                  {t.mockUpDisclaimer}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Company Support Search and details */}
        <div className="p-8 border border-white/10 bg-[#0F0F0F] transition-colors">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5 border-b border-white/10 pb-4">
            <div className="flex items-center space-x-3">
              <span className="flex items-center justify-center w-7 h-7 border border-white/10 bg-white/5 text-white/50 text-[10px] font-mono">
                03
              </span>
              <h3 className="font-serif italic text-base text-white">{t.companyInfo}</h3>
            </div>

            <button
              id="ai-grounding-search-btn"
              type="button"
              onClick={handleGroundingSearch}
              disabled={isGroundingLoading}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 border border-white/10 hover:border-white text-white text-[9px] font-mono uppercase tracking-widest bg-transparent transition-colors"
            >
              <FileSearch2 className="w-4 h-4 text-white/50" />
              <span>{isGroundingLoading ? "RESEARCHING..." : t.searchSupport}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-white/40 mb-2">
                  {t.companyName} *
                </label>
                <input
                  id="form-company-name"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-white/10 text-white text-[11px] font-mono tracking-wide focus:outline-none focus:border-white"
                  placeholder="e.g. Aero Brewing Corp"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-white/40 mb-2">
                    {t.sentDate}
                  </label>
                  <input
                    id="form-complaint-sent-date"
                    type="date"
                    value={complaintSentDate}
                    onChange={(e) => setComplaintSentDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-white/10 text-white text-[11px] font-mono tracking-wide focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-white/40 mb-2">
                    Company Docket/Complaint No
                  </label>
                  <input
                    id="form-company-complaint-no"
                    type="text"
                    value={companyComplaintNumber}
                    onChange={(e) => setCompanyComplaintNumber(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-white/10 text-white text-[11px] font-mono tracking-wide focus:outline-none focus:border-white"
                    placeholder="e.g. REC-8839-2026"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-white/40 mb-2">
                  Company Response Status
                </label>
                <input
                  id="form-company-response-status"
                  type="text"
                  value={companyResponseStatus}
                  onChange={(e) => setCompanyResponseStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-white/10 text-white text-[11px] font-mono tracking-wide focus:outline-none focus:border-white"
                  placeholder="e.g. In progress / Refund Approved"
                />
              </div>
            </div>

            {/* AI Grounding result or Custom company notes */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-white/40 mb-2">
                  Company Correspondence Notes
                </label>
                <textarea
                  id="form-company-notes"
                  value={companyNotes}
                  onChange={(e) => setCompanyNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 text-white text-[11px] font-mono tracking-wide focus:outline-none focus:border-white"
                  placeholder="Notes regarding discussions or emails with supplier..."
                />
              </div>

              {aiGroundingVal && (
                <div className="p-4 border border-amber-500/10 bg-amber-500/[0.02]">
                  <div className="text-amber-300 text-[10px] font-mono uppercase tracking-wider mb-2 flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Google Grounded Supplier Reference Data</span>
                  </div>
                  <p className="text-[11px] text-white/70 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto leading-relaxed">
                    {aiGroundingVal}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Complaint System description & status */}
        <div className="p-8 border border-white/10 bg-[#0F0F0F] transition-colors">
          <div className="flex items-center space-x-3 mb-5 border-b border-white/10 pb-4">
            <span className="flex items-center justify-center w-7 h-7 border border-white/10 bg-white/5 text-white/50 text-[10px] font-mono">
              04
            </span>
            <h3 className="font-serif italic text-base text-white">Complaint Logs & Progress</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-white/40 mb-2">
                  {t.description} *
                </label>
                <textarea
                  id="form-complaint-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 text-white text-[11px] font-mono tracking-wide focus:outline-none focus:border-white"
                  placeholder="Detail customer grievance, issues reported, and hardware anomalies..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-white/40 mb-2">
                  System Complaint Status
                </label>
                <select
                  id="form-complaint-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Complaint["status"])}
                  className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-white/10 text-white text-[11px] font-mono tracking-wide focus:outline-none focus:border-white"
                >
                  <option value="Pending" className="bg-[#0A0A0A]">Pending</option>
                  <option value="Sent to Company" className="bg-[#0A0A0A]">Sent to Company</option>
                  <option value="In Progress" className="bg-[#0A0A0A]">In Progress</option>
                  <option value="Completed" className="bg-[#0A0A0A]">Completed</option>
                  <option value="Returned" className="bg-[#0A0A0A]">Returned</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-white/40 mb-2">
                  General System Notes
                </label>
                <textarea
                  id="form-complaint-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-white/10 text-white text-[11px] font-mono tracking-wide focus:outline-none focus:border-white"
                  placeholder="Internal agent annotations..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* 5. Date Management & Delivery Status */}
        <div className="p-8 border border-white/10 bg-[#0F0F0F] transition-colors">
          <div className="flex items-center space-x-3 mb-5 border-b border-white/10 pb-4">
            <span className="flex items-center justify-center w-7 h-7 border border-white/10 bg-white/5 text-white/50 text-[10px] font-mono">
              05
            </span>
            <h3 className="font-serif italic text-base text-white">{t.dateMgmt}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-white/40 mb-2">
                {t.receiveDate}
              </label>
              <input
                id="form-receive-date"
                type="date"
                value={productReceiveDate}
                onChange={(e) => setProductReceiveDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-white/10 text-white text-[11px] font-mono tracking-wide focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-white/40 mb-2">
                {t.expectedReturnDate}
              </label>
              <input
                id="form-expected-return-date"
                type="date"
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-white/10 text-white text-[11px] font-mono tracking-wide focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-white/40 mb-2">
                {t.returnDate}
              </label>
              <input
                id="form-actual-return-date"
                type="date"
                value={productReturnDate}
                onChange={(e) => setProductReturnDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-white/10 text-white text-[11px] font-mono tracking-wide focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-white/40 mb-2">
                {t.deliveryStatus}
              </label>
              <select
                id="form-delivery-status"
                value={deliveryStatus}
                onChange={(e) => setDeliveryStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-white/10 text-white text-[11px] font-mono tracking-wide focus:outline-none focus:border-white"
              >
                <option value="Arrived" className="bg-[#0A0A0A]">Arrived (Awaiting Intake)</option>
                <option value="In Transit" className="bg-[#0A0A0A]">In Transit to Company Depot</option>
                <option value="Awaiting Parts" className="bg-[#0A0A0A]">Awaiting Parts/Diagnosis</option>
                <option value="Completed at Depot" className="bg-[#0A0A0A]">Completed at Depot</option>
                <option value="Awaiting Pickup" className="bg-[#0A0A0A]">Awaiting Customer Pickup</option>
                <option value="Delivered Back" className="bg-[#0A0A0A]">Delivered Back to Customer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Form controllers */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-white/10">
          <button
            id="cancel-complaint-btn"
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 text-[10px] font-mono uppercase tracking-widest text-white/50 hover:text-white border border-transparent hover:border-white/10 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            id="save-complaint-btn"
            type="submit"
            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-white text-black hover:bg-[#E5E5E5] font-bold text-[10px] uppercase tracking-widest transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{t.save}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
