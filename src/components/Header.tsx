import React from "react";
import { useComplaint } from "../context/ComplaintContext";
import { SupportedLanguage, UserRole, translations } from "../types";
import { Sun, Moon, Shield, LogIn, LogOut, Globe, UserCheck } from "lucide-react";

export const Header: React.FC = () => {
  const { 
    user, 
    language, 
    setLanguage, 
    darkMode, 
    setDarkMode, 
    activeRole, 
    simulateRoleChange, 
    isDemoMode,
    loginWithGoogle,
    logout
  } = useComplaint();

  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 bg-[#0F0F0F] border-b border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo & Info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-10 h-10 border border-white/10 bg-white/5 text-white/90">
              <Shield className="w-5 h-5 stroke-[1.25]" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-serif italic text-2xl tracking-tight leading-none text-white">
                {t.appTitle}
              </h1>
              <span className="text-[9px] uppercase tracking-[0.25em] text-white/40 mt-1">
                {isDemoMode ? "Administrative Simulator Layer" : "Data Integrity Control System"}
              </span>
            </div>
          </div>

          {/* Settings, Translation, Theme, Security Simulation, and Auth */}
          <div className="flex items-center space-x-6">
            {/* Language Selector */}
            <div className="relative flex items-center space-x-1.5 text-white/65 hover:text-white transition-opacity">
              <Globe className="w-4 h-4 text-white/40" />
              <select
                id="lang-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="bg-transparent text-xs font-mono uppercase tracking-wider border-none focus:ring-0 cursor-pointer pr-4 py-1 focus:outline-none focus:bg-[#0A0A0A]"
              >
                <option value="en" className="bg-[#0A0A0A] text-white">EN</option>
                <option value="es" className="bg-[#0A0A0A] text-white">ES</option>
                <option value="fr" className="bg-[#0A0A0A] text-white">FR</option>
                <option value="ar" className="bg-[#0A0A0A] text-white">AR</option>
              </select>
            </div>

            {/* Role Simulator Switch */}
            <div className="flex items-center space-x-2 bg-white/5 px-2.5 py-1.5 border border-white/10">
              <span className="text-white/40 group relative">
                <UserCheck className="w-3.5 h-3.5" />
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-xs bg-zinc-950 text-white text-[10px] rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-md">
                  {t.rolesDisclaimer}
                </span>
              </span>
              <select
                id="role-simulator"
                value={activeRole}
                onChange={(e) => simulateRoleChange(e.target.value as UserRole)}
                className="bg-transparent text-[10px] font-mono tracking-wider uppercase py-0.5 px-1 focus:outline-none focus:ring-0 border-none cursor-pointer text-white"
              >
                <option value="Admin" className="bg-[#0A0A0A] text-white">{t.admin}</option>
                <option value="Agent" className="bg-[#0A0A0A] text-white">{t.agent}</option>
                <option value="Viewer" className="bg-[#0A0A0A] text-white">{t.viewer}</option>
              </select>
            </div>

            {/* Account Sign-In Block */}
            {user ? (
              <div className="flex items-center space-x-4 pl-4 border-l border-white/15">
                <div className="hidden md:block text-right">
                  <div className="text-[11px] font-mono text-white/80 max-w-[120px] truncate leading-none mb-1">
                    {user.displayName || "Agent"}
                  </div>
                  <div className="text-[9px] text-white/40 font-bold tracking-widest uppercase leading-none">
                    {activeRole}
                  </div>
                </div>
                <button
                  id="auth-logout"
                  onClick={logout}
                  className="p-1.5 border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="auth-login"
                onClick={loginWithGoogle}
                className="flex items-center space-x-2 px-3.5 py-1.5 bg-white text-black hover:bg-[#E5E5E5] text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Google Sign-In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
