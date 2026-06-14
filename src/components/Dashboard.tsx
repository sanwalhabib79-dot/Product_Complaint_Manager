import React from "react";
import { useComplaint } from "../context/ComplaintContext";
import { translations } from "../types";
import { Users, Package, FileWarning, Hourglass, CheckCircle2, RotateCcw } from "lucide-react";

export const DashboardComp: React.FC = () => {
  const { complaints, customers, language } = useComplaint();
  const t = translations[language];

  // Calculations for KPI boards
  const totalCust = customers.length;
  
  // Unique Products based on unique model numbers
  const uniqueProducts = Array.from(new Set(complaints.map(c => `${c.productName}-${c.productModel}`))).length;
  
  // Total Company Complaints (where the complaint status is NOT pending)
  const totalCompanyComplaints = complaints.filter(c => c.status !== "Pending").length;
  
  const pendingCount = complaints.filter(c => c.status === "Pending").length;
  const completedCount = complaints.filter(c => c.status === "Completed").length;
  const returnedCount = complaints.filter(c => c.status === "Returned").length;

  // Status breakdown for graphs
  const statuses = ["Pending", "Sent to Company", "In Progress", "Completed", "Returned"] as const;
  const statusCounts = statuses.reduce((acc, status) => {
    acc[status] = complaints.filter(c => c.status === status).length;
    return acc;
  }, {} as Record<string, number>);

  // Product categories breakdown
  const categoryCounts = complaints.reduce((acc, comp) => {
    const cat = comp.productCategory || "Other";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5);

  const kpis = [
    {
      id: "stats-cust",
      title: t.totalCustomers,
      value: totalCust,
      icon: Users,
      color: "bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900/40 dark:text-indigo-400"
    },
    {
      id: "stats-prod",
      title: t.totalProducts,
      value: uniqueProducts,
      icon: Package,
      color: "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400"
    },
    {
      id: "stats-company",
      title: t.totalComplaints,
      value: totalCompanyComplaints,
      icon: FileWarning,
      color: "bg-sky-50 border-sky-100 text-sky-600 dark:bg-sky-950/20 dark:border-sky-900/40 dark:text-sky-400"
    },
    {
      id: "stats-pending",
      title: t.pendingComplaints,
      value: pendingCount,
      icon: Hourglass,
      color: "bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400"
    },
    {
      id: "stats-completed",
      title: t.completedComplaints,
      value: completedCount,
      icon: CheckCircle2,
      color: "bg-teal-50 border-teal-100 text-teal-600 dark:bg-teal-950/20 dark:border-teal-900/40 dark:text-teal-400"
    },
    {
      id: "stats-returned",
      title: t.returnedProducts,
      value: returnedCount,
      icon: RotateCcw,
      color: "bg-purple-50 border-purple-100 text-purple-600 dark:bg-purple-950/20 dark:border-purple-900/40 dark:text-purple-400"
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 border-b border-white/10 bg-[#0F0F0F]">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.id}
              id={kpi.id}
              className="flex flex-col p-6 border-r border-white/10 last:border-r-0 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center justify-between mb-3 text-white">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                  {kpi.title}
                </span>
                <Icon className="w-4 h-4 text-white/30 stroke-[1.25]" />
              </div>
              <span className="text-3xl font-serif text-white mt-1">
                {kpi.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts & Visualization Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Status distribution chart */}
        <div className="p-8 border border-white/10 bg-[#0F0F0F]">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-6 border-b border-white/5 pb-3">
            Complaint Action Status Distribution
          </h3>
          <div className="space-y-5">
            {statuses.map((status) => {
              const count = statusCounts[status] || 0;
              const percent = complaints.length > 0 ? (count / complaints.length) * 100 : 0;
              
              let barColor = "bg-amber-400";
              if (status === "Sent to Company") barColor = "bg-sky-400";
              if (status === "In Progress") barColor = "bg-white/60";
              if (status === "Completed") barColor = "bg-white";
              if (status === "Returned") barColor = "bg-purple-400";

              return (
                <div key={status} className="space-y-1.5 animate-fade-in">
                  <div className="flex justify-between text-xs font-mono text-white/70">
                    <span className="font-serif italic text-sm text-white/95">{status}</span>
                    <span className="text-white/40">
                      {count} ({percent.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full h-[3px] bg-white/5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-700 ease-out ${barColor}`}
                      style={{ width: `${percent || 1}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Product categories chart */}
        <div className="p-8 border border-white/10 bg-[#0F0F0F]">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-6 border-b border-white/5 pb-3">
            Top Faulty Product Categories
          </h3>
          {sortedCategories.length > 0 ? (
            <div className="space-y-5">
              {sortedCategories.map(([cat, count]) => {
                const total = complaints.length;
                const percent = total > 0 ? ((count as number) / total) * 100 : 0;
                return (
                  <div key={cat} className="space-y-1.5 animate-fade-in">
                    <div className="flex justify-between text-xs font-mono text-white/70">
                      <span className="font-serif italic text-sm text-white/95">{cat}</span>
                      <span className="text-white/40">
                        {count} {count === 1 ? "complaint" : "complaints"}
                      </span>
                    </div>
                    <div className="w-full h-[3px] bg-white/5 overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-700 ease-out"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 border border-dashed border-white/10 text-white/20">
              <Package className="w-8 h-8 mb-2 stroke-[1.25]" />
              <p className="text-xs uppercase tracking-wider">{t.noData}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
