export type UserRole = "Admin" | "Agent" | "Viewer";

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  userId: string;
  createdAt: string;
}

export interface StatusHistoryEntry {
  status: "Pending" | "Sent to Company" | "In Progress" | "Completed" | "Returned";
  timestamp: string;
  changedBy: string;
  notes?: string;
}

export interface Complaint {
  id: string; // Auto-generated complaint ID
  customerId: string;
  customerName: string;
  customerPhone: string;
  description: string;
  status: "Pending" | "Sent to Company" | "In Progress" | "Completed" | "Returned";
  notes: string;
  statusHistory?: StatusHistoryEntry[];
  
  // Product info
  productName: string;
  productCategory: string;
  productModel: string;
  productSerialNumber: string;
  productImage?: string; // Base64 data url or path

  // Company info
  companyName: string;
  complaintSentDate?: string; // ISO format or string
  companyComplaintNumber: string;
  companyResponseStatus: string;
  companyNotes: string;

  // Date management
  productReceiveDate?: string;
  expectedReturnDate?: string;
  productReturnDate?: string;
  deliveryStatus: string; // e.g. "Arrived", "In Transit", "Delivered Back", "Awaiting Pickup"

  // System info
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type SupportedLanguage = "en" | "es" | "fr" | "ar";

export const translations = {
  en: {
    appTitle: "Product Complaint Manager",
    dashboard: "Dashboard",
    complaints: "Complaints",
    customers: "Customers",
    analytics: "Analytics",
    searchPlaceholder: "Search complaints, customers, companies...",
    totalCustomers: "Total Customers",
    totalProducts: "Total Products",
    totalComplaints: "Sent Complaints",
    pendingComplaints: "Pending Complaints",
    completedComplaints: "Completed Complaints",
    returnedProducts: "Returned Products",
    addComplaint: "Add Complaint",
    addCustomer: "Add Customer",
    customerInfo: "Customer Information",
    productInfo: "Product Information",
    companyInfo: "Company Information",
    dateMgmt: "Date & Delivery Management",
    status: "Status",
    notes: "Notes",
    searchGrounding: "AI Product & Contact Investigation",
    imageGen: "AI Image Mockup Generator",
    exportPdf: "Export PDF Report",
    printReceipt: "Print Receipt Receipt",
    darkMode: "Dark Mode",
    language: "Language",
    userRole: "User Session Role",
    admin: "Admin",
    agent: "Agent (Contributor)",
    viewer: "Viewer (Read Only)",
    customerName: "Customer Name",
    phone: "Phone Number",
    customerId: "Customer ID",
    productName: "Product Name",
    category: "Category",
    model: "Model",
    serialNumber: "Serial Number",
    companyName: "Company Name",
    sentDate: "Complaint Sent Date",
    complaintNo: "Company Complaint Number",
    responseStatus: "Response Status",
    companyNotes: "Company Update Notes",
    receiveDate: "Product Receive Date",
    expectedReturnDate: "Expected Return Date",
    returnDate: "Product Return Date",
    deliveryStatus: "Delivery Status",
    description: "Complaint Details",
    save: "Save Record",
    cancel: "Cancel",
    actions: "Actions",
    noData: "No entries found. Try adding a new complaint or customer representation.",
    allFieldsRequired: "Please fill out all high-integrity required fields.",
    generatedId: "Auto-generated ID",
    aiPrompt: "Describe the product mockup to generate...",
    generateMockup: "Generate AI Mockup",
    searchSupport: "Search Official Contact Channels & Faults",
    searchingAI: "Searching with Google Search Grounding...",
    generatingAI: "Generating high-quality graphic frame...",
    loading: "Loading profile database records...",
    anonymousLogin: "Google Sign-In Simulator",
    authMessage: "Access is secured with Firebase Google Authentication rules",
    mockUpDisclaimer: "*Using Imagen-4 and Gemini-3.1-flash-preview endpoints to create visual evidence assets.",
    rolesDisclaimer: "Change roles to simulate different user capabilities in the Firestore database."
  },
  es: {
    appTitle: "Gestor de Quejas de Productos",
    dashboard: "Panel Principal",
    complaints: "Reclamaciones",
    customers: "Clientes",
    analytics: "Analíticas",
    searchPlaceholder: "Buscar quejas, clientes, empresas...",
    totalCustomers: "Total de Clientes",
    totalProducts: "Productos Totales",
    totalComplaints: "Quejas Enviadas",
    pendingComplaints: "Quejas Pendientes",
    completedComplaints: "Quejas Completadas",
    returnedProducts: "Productos Devueltos",
    addComplaint: "Añadir Reclamación",
    addCustomer: "Añadir Cliente",
    customerInfo: "Información del Cliente",
    productInfo: "Información del Producto",
    companyInfo: "Información de la Compañía",
    dateMgmt: "Gestión de Fechas y Entregas",
    status: "Estado",
    notes: "Notas",
    searchGrounding: "Investigación de Productos por IA",
    imageGen: "Generador de Imágenes IA",
    exportPdf: "Exportar Reporte PDF",
    printReceipt: "Imprimir Recibo",
    darkMode: "Modo Oscuro",
    language: "Idioma",
    userRole: "Rol de Sesión",
    admin: "Administrador",
    agent: "Agente (Colaborador)",
    viewer: "Visor (Solo Lectura)",
    customerName: "Nombre del Cliente",
    phone: "Número de Teléfono",
    customerId: "ID de Cliente",
    productName: "Nombre del Producto",
    category: "Categoría",
    model: "Modelo",
    serialNumber: "Número de Serie",
    companyName: "Nombre de la Empresa",
    sentDate: "Fecha de Envío de Queja",
    complaintNo: "Número de Reclamo (Empresa)",
    responseStatus: "Estado de Respuesta",
    companyNotes: "Notas de la Empresa",
    receiveDate: "Fecha de Recepción",
    expectedReturnDate: "Fecha Estimada de Devolución",
    returnDate: "Fecha de Devolución Real",
    deliveryStatus: "Estado de la Entrega",
    description: "Detalle de la Queja",
    save: "Guardar Registro",
    cancel: "Cancelar",
    actions: "Acciones",
    noData: "No se encontraron registros. Intente crear una nueva reclamación.",
    allFieldsRequired: "Por favor complete todos los campos obligatorios.",
    generatedId: "ID Auto-generado",
    aiPrompt: "Describa la maqueta del producto a generar...",
    generateMockup: "Generar Maqueta de IA",
    searchSupport: "Buscar Canales de Soporte y Fallas",
    searchingAI: "Buscando en Google Search Grounding...",
    generatingAI: "Generando imagen de alta calidad...",
    loading: "Cargando base de datos...",
    anonymousLogin: "Simulador de Google Sign-In",
    authMessage: "El acceso está protegido por reglas de Firebase",
    mockUpDisclaimer: "*Usa Imagen-4 y Gemini-3.1 para generar activos visuales.",
    rolesDisclaimer: "Intercambie roles para simular diferentes privilegios en Firestore."
  },
  fr: {
    appTitle: "Gestionnaire des Plaintes Produits",
    dashboard: "Tableau de Bord",
    complaints: "Plaintes",
    customers: "Clients",
    analytics: "Analytiques",
    searchPlaceholder: "Rechercher plaintes, clients, compagnies...",
    totalCustomers: "Total Clients",
    totalProducts: "Total Produits",
    totalComplaints: "Plaintes Envoyées",
    pendingComplaints: "Plaintes En Attente",
    completedComplaints: "Plaintes Complétées",
    returnedProducts: "Produits Retournés",
    addComplaint: "Ajouter une Plainte",
    addCustomer: "Ajouter un Client",
    customerInfo: "Informations Client",
    productInfo: "Informations Produit",
    companyInfo: "Informations Compagnie",
    dateMgmt: "Gestion des Dates et Livraisons",
    status: "Statut",
    notes: "Notes",
    searchGrounding: "Recherche de Produits IA",
    imageGen: "Générateur d'Images IA",
    exportPdf: "Exporter en Rapport PDF",
    printReceipt: "Imprimer le Reçu",
    darkMode: "Mode Sombre",
    language: "Langue",
    userRole: "Rôle Session",
    admin: "Administrateur",
    agent: "Agent (Collaborateur)",
    viewer: "Observateur (Lecture Seule)",
    customerName: "Nom de Client",
    phone: "Téléphone",
    customerId: "ID Client",
    productName: "Nom du Produit",
    category: "Catégorie",
    model: "Modèle",
    serialNumber: "Numéro de Série",
    companyName: "Nom de la Compagnie",
    sentDate: "Date d'Envoi Plainte",
    complaintNo: "Numéro Plainte Compagnie",
    responseStatus: "Statut de Réponse",
    companyNotes: "Notes de la Compagnie",
    receiveDate: "Date de Réception",
    expectedReturnDate: "Date de Retour Estimée",
    returnDate: "Date de Retour Réelle",
    deliveryStatus: "Statut de Livraison",
    description: "Détails de la Plainte",
    save: "Enregistrer",
    cancel: "Annuler",
    actions: "Actions",
    noData: "Aucun enregistrement. Veuillez ajouter une plainte ou un client.",
    allFieldsRequired: "Veuillez remplir tous les champs obligatoires.",
    generatedId: "Auto-généré",
    aiPrompt: "Décrivez la maquette à générer...",
    generateMockup: "Générer la Maquette",
    searchSupport: "Rechercher Canaux de Support officiels",
    searchingAI: "Recherche en direct avec Google Search...",
    generatingAI: "Génération de l'image de haute qualité...",
    loading: "Chargement de la base de données...",
    anonymousLogin: "Simulateur Google Sign-In",
    authMessage: "L'accès est sécurisé avec les règles d'authentification Firebase",
    mockUpDisclaimer: "*Utilise Imagen-4 pour générer des preuves visuelles.",
    rolesDisclaimer: "Modifiez l'attribution des rôles pour simuler les accès."
  },
  ar: {
    appTitle: "مدير شكاوى المنتجات",
    dashboard: "لوحة التحكم",
    complaints: "الشكاوى",
    customers: "العملاء",
    analytics: "التحليلات",
    searchPlaceholder: "البحث عن شكاوى، عملاء، شركات...",
    totalCustomers: "إجمالي العملاء",
    totalProducts: "إجمالي المنتجات",
    totalComplaints: "الشكاوى المرسلة",
    pendingComplaints: "الشكاوى المعلقة",
    completedComplaints: "الشكاوى المكتملة",
    returnedProducts: "المنتجات المرتجعة",
    addComplaint: "إضافة شكوى",
    addCustomer: "إضافة عميل",
    customerInfo: "بيانات العميل",
    productInfo: "بيانات المنتج",
    companyInfo: "بيانات الشركة",
    dateMgmt: "إدارة التواريخ والتسليم",
    status: "الحالة",
    notes: "ملاحظات",
    searchGrounding: "البحث والتحقق الذكي (Google Grounding)",
    imageGen: "مولد نماذج الصور بالذكاء الاصطناعي",
    exportPdf: "تصدير تقرير PDF",
    printReceipt: "طباعة الوصل",
    darkMode: "الوضع الداكن",
    language: "اللغة",
    userRole: "دور جلسة المستخدم",
    admin: "مسؤول (Admin)",
    agent: "وكيل (Agent)",
    viewer: "مشاهد (Viewer)",
    customerName: "اسم العميل",
    phone: "رقم الهاتف",
    customerId: "رقم تعريف العميل",
    productName: "اسم المنتج",
    category: "فئة المنتج",
    model: "الموديل",
    serialNumber: "الرقم التسلسلي",
    companyName: "اسم الشركة",
    sentDate: "تاريخ إرسال الشكوى",
    complaintNo: "رقم شكوى الشركة",
    responseStatus: "حالة رد الشركة",
    companyNotes: "ملاحظات وتحديثات الشركة",
    receiveDate: "تاريخ استلام المنتج",
    expectedReturnDate: "تاريخ الإرجاع المتوقع",
    returnDate: "تاريخ الإرجاع الفعلي",
    deliveryStatus: "حالة التوصيل",
    description: "تفاصيل الشكوى",
    save: "حفظ السجل",
    cancel: "إلغاء",
    actions: "الإجراءات",
    noData: "لم يتم العثور على سجلات. أضف شكوى جديدة لبدء التشغيل.",
    allFieldsRequired: "يرجى تعبئة جميع الحقول المطلوبة لضمان سلامة البيانات.",
    generatedId: "رقم تم توليده تلقائياً",
    aiPrompt: "صف شكل المنتج المراد توليده بالذكاء الاصطناعي...",
    generateMockup: "توليد النموذج بالذكاء الاصطناعي",
    searchSupport: "البحث عن قنوات الدعم الرسمية والأعطال",
    searchingAI: "جاري البحث عبر محرك Google...",
    generatingAI: "جاري توليد الصورة الفنية للمنتج...",
    loading: "جاري تحميل سجلات قاعدة البيانات...",
    anonymousLogin: "محاكي تسجيل الدخول عبر Google",
    authMessage: "الوصول مؤمن بقواعد حماية Firestore وقواعد Firebase Auth",
    mockUpDisclaimer: "*يستخدم محرك Imagen-4 وبوابات Gemini-3.1 لإنشاء الأصول المرئية.",
    rolesDisclaimer: "قم بتغيير الأدوار لمحاكاة مستويات الأمان المختلفة في Firestore."
  }
};
