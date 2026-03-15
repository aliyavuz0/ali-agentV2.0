"use client";

import { MouseEvent } from "react";
import { UI_TEXT } from "../lib/constants";

interface SidebarProps {
  user: any;
  language: string;
  isOpen: boolean;
  history: any[];
  showSettings: boolean;
  openMenuId: string | null;
  t: Record<string, string>;
  onToggle: () => void;
  onSignOut: () => void;
  onToggleSettings: () => void;
  onLanguageToggle: () => void;
  onDeleteAll: () => void;
  onNewAnalysis: () => void;
  onLoadAnalysis: (item: any) => void;
  onDeleteItem: (e: MouseEvent, id: string) => void;
  onToggleMenu: (id: string) => void;
}

export default function Sidebar({
  user, language, isOpen, history, showSettings, openMenuId, t,
  onToggle, onSignOut, onToggleSettings, onLanguageToggle,
  onDeleteAll, onNewAnalysis, onLoadAnalysis, onDeleteItem, onToggleMenu,
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72 bg-[#0D0B08] border-r border-[#1A1610]
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:z-auto lg:transform-none
          ${isOpen ? "lg:translate-x-0" : "lg:-translate-x-full lg:w-0 lg:border-0 lg:overflow-hidden"}
        `}
      >
        <div className="w-72 h-full flex flex-col">
          {/* User profile */}
          <div className="p-4 border-b border-[#1A1610]">
            <div className="flex items-center gap-3">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt=""
                  className="w-9 h-9 rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-red-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {user.email?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#D4C8A0] truncate">
                  {user.user_metadata?.full_name || user.email}
                </p>
                <p className="text-[10px] text-[#605030] truncate">{user.email}</p>
              </div>
              <button
                onClick={onToggleSettings}
                className={`p-1.5 rounded-md transition-all flex-shrink-0 ${
                  showSettings
                    ? "bg-red-700/20 text-red-500"
                    : "text-[#605030] hover:bg-[#13110E] hover:text-[#D4C8A0]"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
              </button>
            </div>

            {/* Settings dropdown */}
            {showSettings && (
              <div className="mt-2 bg-[#0F0D0A] border border-[#1A1610] rounded-xl shadow-2xl p-2">
                <p className="text-[9px] font-bold text-[#504020] px-3 py-1 uppercase tracking-[2px] mb-1">
                  {t.preferences}
                </p>
                <div
                  onClick={onLanguageToggle}
                  className="flex items-center justify-between px-3 py-2.5 hover:bg-[#13110E] rounded-lg transition-colors cursor-pointer active:scale-[0.98]"
                >
                  <span className="text-xs text-[#D4C8A0]">Dil / Language</span>
                  <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2.5 py-0.5 rounded border border-red-500/20 uppercase">
                    {language}
                  </span>
                </div>
                <div className="h-px bg-[#1A1610] my-1" />
                <button
                  onClick={onDeleteAll}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
                    <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                  <span className="text-[11px] font-bold text-red-500">{t.clearHistory}</span>
                </button>
              </div>
            )}

            <button
              onClick={onSignOut}
              className="mt-3 w-full py-2 text-xs text-[#605030] hover:text-red-400 border border-[#1A1610] rounded-lg transition-colors cursor-pointer"
            >
              {t.signOut}
            </button>
          </div>

          {/* New analysis */}
          <div className="p-3">
            <button
              onClick={() => { onNewAnalysis(); if (window.innerWidth < 1024) onToggle(); }}
              className="w-full py-3 bg-red-700/20 border border-red-700/30 rounded-lg text-red-400 text-sm font-bold hover:bg-red-700/30 transition-colors cursor-pointer active:scale-[0.98]"
            >
              {t.newAnalysis}
            </button>
          </div>

          {/* History */}
          <div className="flex-1 overflow-y-auto px-3 pb-3">
            <p className="text-[10px] font-bold text-[#504020] tracking-widest mb-2 px-1 uppercase">
              {t.pastAnalyses}
            </p>
            {history.length === 0 ? (
              <p className="text-xs text-[#40382A] px-1 text-center mt-4 italic">
                {t.noAnalysis}
              </p>
            ) : (
              history.map((item) => {
                const scoreColor =
                  item.final_score >= 80 ? "#22C55E" : item.final_score >= 60 ? "#F59E0B" : "#EF4444";
                return (
                  <div
                    key={item.id}
                    className="relative w-full p-3 mb-1 rounded-lg hover:bg-[#13110E] transition-colors cursor-pointer group"
                    onClick={() => { onLoadAnalysis(item); if (window.innerWidth < 1024) onToggle(); }}
                  >
                    {/* Three-dot menu */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleMenu(item.id); }}
                      className="absolute top-3 right-2 p-1 hover:bg-[#1A1610] rounded-md opacity-0 group-hover:opacity-100 transition-all z-10"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#605030" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
                      </svg>
                    </button>

                    {openMenuId === item.id && (
                      <div className="absolute top-8 right-2 w-32 bg-[#0F0D0A] border border-[#1A1610] rounded-lg shadow-2xl z-50 overflow-hidden">
                        <button
                          onClick={(e) => onDeleteItem(e, item.id)}
                          className="w-full text-left px-3 py-2 text-[10px] font-bold text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                          {language === "TR" ? "SİL" : "DELETE"}
                        </button>
                      </div>
                    )}

                    <div className="flex justify-between items-center pr-6">
                      <span className="font-mono text-sm font-bold text-[#D4C8A0]">{item.ticker}</span>
                      <span className="font-mono text-sm font-bold" style={{ color: scoreColor }}>
                        {item.final_score?.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1 pr-6">
                      <span className="text-[10px] text-[#504020]">
                        {new Date(item.created_at).toLocaleDateString(language === "TR" ? "tr-TR" : "en-US")}
                      </span>
                      <span className="text-[10px] font-bold" style={{ color: scoreColor }}>
                        {item.verdict === "MUKEMMEL" ? (language === "TR" ? "MÜK" : "EXC")
                          : item.verdict === "KABULEDILEBILIR" ? (language === "TR" ? "KABUL" : "ACC")
                          : "RED"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
