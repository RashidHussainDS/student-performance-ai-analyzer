import React from 'react';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Sparkles,
  Compass,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'students'
  | 'analytics'
  | 'insights'
  | 'recommendations'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  supportFlagCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  supportFlagCount,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'students' as NavTab,
      label: 'Students',
      icon: Users,
      badge: null,
    },
    {
      id: 'analytics' as NavTab,
      label: 'Performance Analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'insights' as NavTab,
      label: 'AI Insights',
      icon: Sparkles,
      badge: 'Gemini',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
    },
    {
      id: 'recommendations' as NavTab,
      label: 'Study Recommendations',
      icon: Compass,
      badge: supportFlagCount > 0 ? `${supportFlagCount}` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'reports' as NavTab,
      label: 'Reports',
      icon: FileText,
      badge: null,
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside
      className={`no-print relative bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 z-30 shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Nav Items */}
      <div className="p-3 space-y-1.5">
        <div className="flex items-center justify-between px-2 py-2 mb-2 text-xs text-slate-400 font-semibold uppercase tracking-wider">
          {!isCollapsed && <span>Navigation</span>}
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-auto"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all relative group ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/20 to-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-950/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-cyan-400 rounded-r-full shadow-sm shadow-cyan-400" />
              )}
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />

              {!isCollapsed && (
                <span className="flex-1 text-left truncate">{item.label}</span>
              )}

              {!isCollapsed && item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Footer Info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        {!isCollapsed ? (
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[11px] text-slate-300">Client-Side Privacy Engine</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Calculations derived from live active dataset. No student records transmitted publicly.
            </p>
          </div>
        ) : (
          <div className="flex justify-center" title="Privacy Protected">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
        )}
      </div>
    </aside>
  );
};
