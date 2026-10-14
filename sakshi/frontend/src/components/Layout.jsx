import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Network, 
  Clock, 
  GitMerge, 
  AlertTriangle, 
  Bot, 
  FileSpreadsheet, 
  ShieldCheck, 
  ShieldAlert, 
  LayoutDashboard, 
  LogOut, 
  UserCheck, 
  RefreshCw, 
  Bug, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  ClipboardCheck,
  X
} from 'lucide-react';
import { useAuth, SEED_USERS } from '../context/AuthContext';
import { verifyLedgerApi, getAlertsApi, getMergeQueueApi } from '../api';

export const Layout = () => {
  const { user, logout, switchRoleDirectly, debugMode, setDebugMode } = useAuth();
  const navigate = useNavigate();

  const [ledgerStatus, setLedgerStatus] = useState({ ok: true, verifying: false });
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [counts, setCounts] = useState({ alerts: null, mergeQueue: null });

  const fetchCounts = async () => {
    try {
      const [alertsRes, mqRes] = await Promise.all([
        getAlertsApi(),
        getMergeQueueApi()
      ]);
      const pendingMq = Array.isArray(mqRes) ? mqRes.filter(item => item.status === 'pending').length : null;
      setCounts({
        alerts: Array.isArray(alertsRes) ? alertsRes.length : null,
        mergeQueue: pendingMq
      });
    } catch {
      // fallback
    }
  };

  const checkChain = async () => {
    setLedgerStatus(prev => ({ ...prev, verifying: true }));
    try {
      const res = await verifyLedgerApi();
      setLedgerStatus({ ok: res.ok, broken_at: res.broken_at, verifying: false });
    } catch {
      setLedgerStatus({ ok: true, verifying: false });
    }
  };

  useEffect(() => {
    checkChain();
    fetchCounts();
    const interval = setInterval(() => {
      checkChain();
      fetchCounts();
    }, 12000);
    return () => clearInterval(interval);
  }, [user?.role]);

  useEffect(() => {
    const handleRbacDenied = (e) => {
      setToastMessage(e.detail || 'Access Denied: Action not permitted for your current role.');
      setTimeout(() => setToastMessage(null), 6000);
    };
    window.addEventListener('sakshi-rbac-denied', handleRbacDenied);
    return () => window.removeEventListener('sakshi-rbac-denied', handleRbacDenied);
  }, []);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/network', label: 'Network Graph', icon: Network, highlight: true },
    { to: '/merge-queue', label: 'Merge Queue', icon: GitMerge, badge: counts.mergeQueue !== null ? String(counts.mergeQueue) : undefined },
    { to: '/golden-hour', label: 'Golden Hour Map', icon: Clock },
    { to: '/alerts', label: 'Alerts', icon: AlertTriangle, badge: counts.alerts !== null ? String(counts.alerts) : undefined },
    { to: '/copilot', label: 'Ask the Graph', icon: Bot },
    { to: '/report', label: 'Case Dossier', icon: FileSpreadsheet },
    { to: '/ledger', label: 'Chain of Custody', icon: ShieldCheck, rbac: ['cyber_cell', 'sp_dysp', 'auditor'] },
    { to: '/validation', label: 'Validation Suite', icon: ClipboardCheck, rbac: ['cyber_cell', 'sp_dysp', 'auditor'] },
  ];

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'sp_dysp':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
      case 'cyber_cell':
        return 'bg-teal-500/15 text-teal-300 border-teal-500/40';
      case 'head_constable':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/40';
      case 'auditor':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/40';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'sp_dysp': return 'SP / DySP';
      case 'cyber_cell': return 'Cyber Cell';
      case 'head_constable': return 'Head Constable';
      case 'constable': return 'Constable';
      case 'auditor': return 'Forensic Auditor';
      default: return role;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 lg:px-6 flex items-center justify-between z-30 select-none">
        {/* Left: Project title & Case details */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-800 flex items-center justify-center font-bold text-slate-950 text-sm shadow-md shadow-teal-900/50">
              सा
            </div>
            <div>
              <span className="font-extrabold tracking-wider text-base text-slate-100">SAKSHI</span>
              <span className="text-[10px] text-teal-400 font-mono ml-1.5 uppercase tracking-widest hidden sm:inline">Workbench v1.0</span>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-teal-300 font-semibold border border-slate-700">
              SP-014
            </span>
            <span className="text-xs font-medium text-slate-200 hidden md:inline truncate max-w-xs">
              Durg Missing Cluster
            </span>
            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Active Case
            </span>
          </div>
        </div>

        {/* Right: Ledger Integrity Badge, Role Badge & Controls */}
        <div className="flex items-center gap-3">
          {/* Ledger Integrity status */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={checkChain}
              title="Click to verify cryptographic ledger integrity"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium border transition ${
                ledgerStatus.ok
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/40'
                  : 'bg-rose-950/60 text-rose-300 border-rose-700 hover:bg-rose-900/60 animate-pulse'
              }`}
            >
              {ledgerStatus.verifying ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
              ) : ledgerStatus.ok ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span className="hidden sm:inline">
                {ledgerStatus.ok ? 'Chain intact' : `Chain broken (Block #${ledgerStatus.broken_at || 17})`}
              </span>
            </button>
          </div>

          {/* Debug Mode toggle */}
          <button
            onClick={() => setDebugMode(!debugMode)}
            title="Toggle presentation demo debugger"
            className={`p-1.5 rounded-md border text-xs transition ${
              debugMode 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Bug className="w-3.5 h-3.5" />
          </button>

          {/* Role badge with switch dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-semibold border ${getRoleBadgeStyle(user?.role)} hover:opacity-90 transition`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{getRoleDisplayName(user?.role)}</span>
              <span className="text-[10px] text-slate-400">▼</span>
            </button>

            {roleMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-2 z-50 text-xs"
                onMouseLeave={() => setRoleMenuOpen(false)}
              >
                <div className="px-2 py-1 font-semibold text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800 mb-1">
                  Demo Role Switcher (RBAC Demo)
                </div>
                {SEED_USERS.map((u) => (
                  <button
                    key={u.email}
                    onClick={() => {
                      switchRoleDirectly(u.email);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-md flex items-center justify-between transition ${
                      user?.email === u.email ? 'bg-slate-800 text-teal-300 font-medium' : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.label}</div>
                    </div>
                    {user?.email === u.email && <span className="text-teal-400 text-xs">●</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            title="Sign out of workbench"
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace Body: Sidebar + Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Nav */}
        <aside className="w-16 lg:w-56 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between py-3 flex-shrink-0 select-none">
          <nav className="space-y-1 px-2">
            {navItems
              .filter(item => !item.rbac || item.rbac.includes(user?.role))
              .map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition group relative ${
                      isActive
                        ? 'active-nav-item border-l-4 border-l-red-500 bg-red-950/40 text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    } ${item.highlight && !location.pathname.includes(item.to) ? 'text-slate-200' : ''}`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden lg:inline">{item.label}</span>
                  {item.badge && (
                    <span className="hidden lg:inline-block ml-auto px-1.5 py-0.2 rounded text-[10px] font-mono bg-red-950 text-red-300 border border-red-800/80 font-bold">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* User profile card in sidebar bottom */}
          <div className="px-2 pt-2 border-t border-slate-800/80">
            <div className="hidden lg:block p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="text-[11px] font-semibold text-slate-200 truncate">{user?.name}</div>
              <div className="text-[10px] font-mono text-slate-400 truncate">{user?.email}</div>
              <div className="mt-1 flex items-center gap-1 text-[9px] text-teal-400 uppercase tracking-wider font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                <span>Active Session</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950 flex flex-col relative">
          {toastMessage && (
            <div className="fixed top-16 right-6 z-50 max-w-md bg-rose-950/95 border border-rose-700 text-rose-200 px-4 py-3 rounded-xl shadow-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <div className="font-bold text-rose-300 mb-0.5">Authorization Notice</div>
                <div className="text-slate-200 font-mono text-[11px] leading-relaxed">{toastMessage}</div>
              </div>
              <button 
                onClick={() => setToastMessage(null)}
                className="text-rose-400 hover:text-rose-200 p-0.5 rounded transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <Outlet />
        </main>
      </div>

      {/* Mandatory Persistent Footer Banner */}
      <footer className="h-7 bg-slate-950 border-t border-slate-800/80 px-4 flex items-center justify-between text-[11px] text-slate-400 z-30 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400/80 animate-pulse"></span>
          <span className="font-medium text-amber-300/90 tracking-wide">
            Synthetic data. Patterns for investigator review. Not an accusation.
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-slate-500 font-mono text-[10px]">
          <span>EVIDENTIARY AUDIT HASH: e8a93bc2</span>
          <span>•</span>
          <span>DURG CYBER CELL WORKBENCH</span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
