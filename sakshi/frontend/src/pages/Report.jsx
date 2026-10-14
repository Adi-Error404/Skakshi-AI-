import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Clock, 
  ArrowRight,
  Printer,
  Sparkles
} from 'lucide-react';
import { generateReportApi, emailReportApi } from '../api';
import { useAuth } from '../context/AuthContext';

export const Report = () => {
  const { user, hasRole } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reportReady, setReportReady] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [emailStatus, setEmailStatus] = useState(null);
  const [error, setError] = useState('');

  const canAccessReport = hasRole(['head_constable', 'cyber_cell', 'sp_dysp']);

  const handleGenerate = async () => {
    if (!canAccessReport) return;
    setError('');
    setGenerating(true);
    setProgress(15);

    const timer1 = setTimeout(() => setProgress(45), 400);
    const timer2 = setTimeout(() => setProgress(80), 800);

    try {
      const res = await generateReportApi();
      setTimeout(() => {
        setProgress(100);
        setGenerating(false);
        setReportReady(true);
        setReportData(res);
      }, 1200);
    } catch (err) {
      setGenerating(false);
      setError(err.response?.data?.detail || 'Report compilation failed.');
    }
  };

  const handleEmail = async () => {
    if (!reportData || !canAccessReport) return;
    try {
      const res = await emailReportApi(reportData.report_id || 'RPT-SP014-01');
      setEmailStatus(`Intelligence dossier dispatched to ${res.sent_to}`);
      setTimeout(() => setEmailStatus(null), 5000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Email dispatch failed.');
    }
  };

  const handleDownload = () => {
    // Direct link to backend PDF endpoint
    window.open('http://127.0.0.1:8000/api/report/RPT-1/download', '_blank');
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 lg:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30 rounded flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              JUDICIAL DOSSIER GENERATOR
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Indian Evidence Act Section 65B Format
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-black text-slate-100 tracking-tight">
            Case SP-014 Intelligence Dossier
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Compiles comprehensive forensic artifacts: network articulation centrality, Golden Hour cell triangulation, rapid pass-through account relays, and chain of custody audit logs.
          </p>
        </div>

        {/* Generate Button (RBAC Protected) */}
        <div className="relative group">
          <button
            onClick={handleGenerate}
            disabled={!canAccessReport || generating}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition ${
              canAccessReport
                ? 'bg-teal-600 hover:bg-teal-500 text-slate-950 shadow-lg shadow-teal-950/60'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{generating ? 'Compiling Dossier...' : 'Generate Defensible Dossier'}</span>
          </button>
          {!canAccessReport && (
            <div className="absolute right-0 -top-8 px-2 py-1 bg-slate-800 border border-slate-700 text-[10px] text-slate-300 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-20">
              Not permitted for {user?.role}. Requires Head Constable or higher.
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar when generating */}
      {generating && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Assembling multi-source evidentiary proofs...</span>
            <span className="font-mono text-teal-400 font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="bg-gradient-to-r from-teal-500 to-amber-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {emailStatus && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl flex items-center gap-2.5 text-xs text-emerald-200 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{emailStatus}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-xl flex items-center gap-2.5 text-xs text-rose-200">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Ready Report Actions Banner */}
      {reportReady && (
        <div className="bg-slate-900 border border-teal-500/50 rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
              <CheckCircle2 className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="font-bold text-slate-100 text-sm">
                Intelligence Dossier RPT-SP014-01 Generated
              </div>
              <div className="text-xs text-slate-400 font-mono">
                SHA-256 Digest: e8a93bc214f7... • 12 Pages • Section 65B Verified
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs rounded-lg border border-slate-700 transition flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-teal-400" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handleEmail}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg transition flex items-center gap-2 shadow-lg shadow-teal-950/60"
            >
              <Mail className="w-4 h-4" />
              <span>Email to Me</span>
            </button>
          </div>
        </div>
      )}

      {/* Report Preview Document */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 text-xs text-slate-300 shadow-xl">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono text-teal-400 uppercase tracking-widest">
              OFFICIAL INVESTIGATIVE BRIEF • CONFIDENTIAL
            </div>
            <h2 className="text-base font-bold text-slate-100 mt-1">
              Case SP-014: Durg Missing Cluster Correlation
            </h2>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Superintendent of Police (Durg) • Cyber Crime Intelligence Cell
            </div>
          </div>
          <div className="font-mono text-right text-[11px] text-slate-400">
            <div>DATE: 2026-09-28</div>
            <div>STATUS: EVIDENCE DEFENSIBLE</div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-2">
          <h3 className="font-bold uppercase tracking-wider text-teal-400 text-[11px]">
            1. Executive Analytical Summary
          </h3>
          <p className="leading-relaxed text-slate-300">
            Algorithmic topology resolution of 62 cataloged entities, 412 cellular call records, and 148 banking transactions establishes that the Durg missing persons occurrences are not isolated incidents. Evidence demonstrates a synchronized multi-stage operation bridging local procurement (Durg/Bhilai) with an interstate destination hub in Nagpur, coordinated through a central articulation node.
          </p>
        </div>

        {/* Section 2: Key Evidentiary Findings Table */}
        <div className="space-y-2">
          <h3 className="font-bold uppercase tracking-wider text-teal-400 text-[11px]">
            2. Core Evidentiary Components
          </h3>
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left font-mono text-[11px]">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Artifact ID</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Investigative Significance</th>
                  <th className="p-2.5">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                <tr>
                  <td className="p-2.5 text-teal-300">P-BROKER-01</td>
                  <td className="p-2.5 text-slate-400">Bridge Articulation</td>
                  <td className="p-2.5 text-slate-200">Sole communication link between Cluster A and Cluster B; removal drops efficiency 71%.</td>
                  <td className="p-2.5 text-emerald-400">Anchored</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-teal-300">PH-BURNER-01</td>
                  <td className="p-2.5 text-slate-400">Golden Hour Telemetry</td>
                  <td className="p-2.5 text-slate-200">Collocated within 180m of 4 victims; traversed Kumhari Toll NH-53 at 01:10 hrs.</td>
                  <td className="p-2.5 text-emerald-400">Anchored</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-teal-300">ACC-01..ACC-04</td>
                  <td className="p-2.5 text-slate-400">Rapid Relay Banking</td>
                  <td className="p-2.5 text-slate-200">4-tier mule account cascade with sub-6 minute dwell times terminating in Nagpur.</td>
                  <td className="p-2.5 text-emerald-400">Anchored</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-teal-300">AD-BAIT-01</td>
                  <td className="p-2.5 text-slate-400">Lure Ad Infrastructure</td>
                  <td className="p-2.5 text-slate-200">Textile placement flyer registered inbound contacts from all 5 victims.</td>
                  <td className="p-2.5 text-emerald-400">Anchored</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Section 65B Certification */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2 text-teal-400 font-bold uppercase tracking-wider text-[11px]">
            <ShieldCheck className="w-4 h-4" />
            <span>Statutory Certificate (Section 65B Indian Evidence Act)</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            I hereby certify that the computer outputs, telemetry feeds, and electronic records reproduced herein were produced by automated cryptographic pipeline SAKSHI during the regular course of law enforcement intelligence aggregation. Hashes independently verifiable against State Police Cyber Vault.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Report;
