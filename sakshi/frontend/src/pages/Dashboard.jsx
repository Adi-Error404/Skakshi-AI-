import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  PhoneCall, 
  CreditCard, 
  AlertTriangle, 
  Network, 
  Clock, 
  GitMerge, 
  Bot, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { getCaseApi, getAlertsApi } from '../api';
import EvidenceModal from '../components/EvidenceModal';

export const Dashboard = () => {
  const [caseData, setCaseData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [c, a] = await Promise.all([getCaseApi(), getAlertsApi()]);
        setCaseData(c);
        setAlerts(a);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const topAlerts = alerts.slice(0, 4);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Evidence Modal Drawer */}
      <EvidenceModal evidenceId={selectedEvidence} onClose={() => setSelectedEvidence(null)} />

      {/* Case Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-5 lg:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30 rounded">
              CASE REF: {caseData?.case_id || 'SP-014'}
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              STATUS: {caseData?.status || 'Open'}
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-black text-slate-100 tracking-tight">
            {caseData?.title || 'Durg Missing Cluster Investigation'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Multi-source evidentiary correlation fusing cellular CDR, FASTag toll telemetry, FIU bank pass-through records, and witness FIRs. Highlighting patterns worthy of investigator attention.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate('/network')}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg transition flex items-center gap-2 shadow-lg shadow-teal-950/50"
          >
            <Network className="w-4 h-4" />
            <span>Open Network Canvas</span>
          </button>
          <button
            onClick={() => navigate('/golden-hour')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg transition flex items-center gap-2 border border-slate-700"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Golden Hour Map</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-slate-100">{caseData?.persons || 62}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Entities Cataloged</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-slate-100">{caseData?.calls || 412}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">CDR Interactions</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-slate-100">{caseData?.txns || 148}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Bank Transactions</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-rose-400">{caseData?.alerts || 7}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Active Anomalies</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Priority Anomalies + Quick Analysis Launchers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High Priority Patterns */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h2 className="font-bold text-slate-100 text-sm tracking-wide uppercase">
                  Patterns Worthy of Investigator Attention
                </h2>
              </div>
              <button
                onClick={() => navigate('/alerts')}
                className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-semibold"
              >
                <span>View All 7 Alerts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {topAlerts.map((a) => (
                <div
                  key={a.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded ${
                        a.severity === 'high' 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {a.severity}
                      </span>
                      <span className="font-semibold text-slate-200 text-xs">{a.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(a.ts).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {a.explanation}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-slate-500 text-[10px]">Citations:</span>
                      {a.evidence_ids.map((ev) => (
                        <button
                          key={ev}
                          onClick={() => setSelectedEvidence(ev)}
                          className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-teal-300 hover:bg-slate-700 transition"
                        >
                          {ev}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => navigate('/network')}
                      className="text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1"
                    >
                      <span>Locate in Graph</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Quick Workflows */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              Operational Workflows
            </h3>
            
            <div className="space-y-2.5">
              <div 
                onClick={() => navigate('/network')}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-850/60 transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-xs text-slate-200 group-hover:text-teal-300 flex items-center gap-2">
                    <Network className="w-4 h-4 text-teal-400" />
                    <span>Bridge Articulation Analysis</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 transition transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Inspect entity Vikas S. ('Golden Bhai') bridging Durg logistics and Nagpur receivers.
                </p>
              </div>

              <div 
                onClick={() => navigate('/merge-queue')}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850/60 transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-xs text-slate-200 group-hover:text-amber-300 flex items-center gap-2">
                    <GitMerge className="w-4 h-4 text-amber-400" />
                    <span>Resolve Alias Merges (2 Pending)</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Correlate 3 alias profiles sharing FASTag plate CG-07-BW-4912 and IMEI.
                </p>
              </div>

              <div 
                onClick={() => navigate('/golden-hour')}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850/60 transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-xs text-slate-200 group-hover:text-blue-300 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>Golden Hour Cell Triangulation</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Burner 98930 11902 co-located near 4 of 5 missing individuals before toll exit.
                </p>
              </div>

              <div 
                onClick={() => navigate('/copilot')}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-850/60 transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-xs text-slate-200 group-hover:text-purple-300 flex items-center gap-2">
                    <Bot className="w-4 h-4 text-purple-400" />
                    <span>Ask Graph Copilot</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 transition transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Query natural language intelligence queries with direct evidentiary citations.
                </p>
              </div>
            </div>
          </div>

          {/* Forensic Audit Anchor Info */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400 flex-shrink-0" />
            <div>
              <div className="text-xs font-semibold text-slate-200">Cryptographic Chain of Custody</div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                All 20 case events cryptographically chained under SHA-256 block hash.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
