import React from 'react';
import { X, ShieldCheck, FileText, Hash, Calendar, Layers } from 'lucide-react';

const EVIDENCE_REGISTRY = {
  'CDR-0012': {
    id: 'CDR-0012',
    title: 'Airtel Cellular Handshake Corroboration',
    type: 'Telecommunication Records (CDR)',
    ts: '2026-09-27 00:45:12 IST',
    hash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90',
    source: 'Bharti Airtel LSA Chhattisgarh (Subpoena Ref: CYBER/SP014/991)',
    text: 'Tower ID 404-71-3310-09 (Bhilai Supela Sector 6) recorded 3 outbound VOIP/cellular handshakes from MSISDN +91 98271 44021 to +91 99234 88102 (Aslam Sheikh, Nagpur) with average duration 184 seconds. Azimuth angle indicates moving transmitter heading East on NH-53.'
  },
  'TXN-0044': {
    id: 'TXN-0044',
    title: 'Rapid Relay Settlement - HDFC Intermediary Hub',
    type: 'Financial Intelligence (FIU/Bank Log)',
    ts: '2026-09-26 14:15:28 IST',
    hash: 'b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1',
    source: 'HDFC Bank Core Banking System (A/c 5010..338)',
    text: 'Immediate RTGS credit of INR 45,000 received from PNB A/c 1840..901 at 14:09:12. At 14:15:28, INR 43,500 transferred to Axis A/c 9190..112 (Nagpur Bullion recipient). Dwell time in hub account: 6 minutes 16 seconds. Pattern matches layered pass-through mule clearing.'
  },
  'FIR-07-S3': {
    id: 'FIR-07-S3',
    title: 'Witness Deposition Excerpt - Transit Switchpoint',
    type: 'Legal Witness Deposition (CrPC Section 161)',
    ts: '2026-09-25 11:00:00 IST',
    hash: 'c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2',
    source: 'Supela Police Station Case Diary Item #44',
    text: 'Deponent stated: "Around 17:30 hrs near Kumhari flyover underpass, white Bolero vehicle halted. A man known locally as Golden Bhai arrived in a separate vehicle and handed paper receipts and cash envelopes before instructing passengers to board the Maharashtra registered car heading towards Rajnandgaon/Nagpur border."'
  },
  'GEO-0044': {
    id: 'GEO-0044',
    title: 'Cellular Triangulation - Proximity Radius Match',
    type: 'Geospatial Tower Dump & Sector Analysis',
    ts: '2026-09-21 17:40:00 IST',
    hash: 'd4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3',
    source: 'Telecom Enforcement Resource and Monitoring (TERM) Cell',
    text: 'IMSI 404-71-9893011902 triangulated at coordinates 21.2091° N, 81.3785° E (accuracy radius ±140m). Location coincides with Bhilai Civic Center bus stop during the Golden Hour departure window of missing person MP-04 (Sunita Markam) and MP-05 (Pooja Markam).'
  },
  'TOLL-0019': {
    id: 'TOLL-0019',
    title: 'FASTag & ANPR Camera Kumhari Toll Plaza NH-53',
    type: 'National Highway Authority ANPR & Toll Telemetry',
    ts: '2026-09-27 01:14:04 IST',
    hash: 'e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4',
    source: 'IHMCL / FASTag Central Clearing House',
    text: 'Lane 04 Eastbound: Bolero CG-07-BW-4912 tagged at 01:10:22. Lane 05 Eastbound: Ertiga MH-31-FA-8819 tagged at 01:14:04. Infrared optical character recognition confirmed license plates with 99.4% confidence. Optical timestamp difference: 3 minutes 42 seconds.'
  },
  'CDR-0081': {
    id: 'CDR-0081',
    title: 'Ephemeral Burner Activation Lifecycle Log',
    type: 'Telecommunication Records (CDR)',
    ts: '2026-09-26 22:30:00 IST',
    hash: 'f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5',
    source: 'Vodafone Idea Regulatory Nodal Unit',
    text: 'SIM card MSISDN +91 98930 11902 activated using fictitious identity document at 15:10 hrs on 2026-09-14. Zero voice traffic registered outside incident clusters. Final IMEI deregistration occurred precisely at 01:24 hrs post Kumhari toll passage.'
  },
  'AD-BAIT-01': {
    id: 'AD-BAIT-01',
    title: 'Physical Placement Flyer - Textile Assistance Lure',
    type: 'Physical Seizure & Document Inspection',
    ts: '2026-09-12 11:20:00 IST',
    hash: '0718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f6',
    source: 'Seized at Bhilai Sector-6 Bus Shelter (Panch-nama PR-112)',
    text: 'Glossy paper handbill advertising: "Nagpur Textile & Garments Factory requires female packaging helpers. Free hostel, food, salary INR 14,500/month. Contact helpline: +91 97520 88319". Reverse side stamped "Apex Placement Hub".'
  },
  'FIR-01-DURG': {
    id: 'FIR-01-DURG',
    title: 'Initial Missing Person Information (Crime Diary #88)',
    type: 'First Information Report (CrPC 154)',
    ts: '2026-09-14 20:00:00 IST',
    hash: '18293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f607',
    source: 'Supela Thana Police Station, Durg District',
    text: 'Complainant reported daughter Anjali Sahu (age 17) left home at 16:30 hrs stating she was attending an interview at Civic Center for textile work. Did not return; cellular phone went straight to switch-off at 19:10 hrs.'
  }
};

export const EvidenceModal = ({ evidenceId, onClose }) => {
  if (!evidenceId) return null;

  const item = EVIDENCE_REGISTRY[evidenceId] || {
    id: evidenceId,
    title: `Forensic Record ${evidenceId}`,
    type: 'Chain of Custody Investigative Record',
    ts: '2026-09-26 12:00:00 IST',
    hash: '7a8b9c0d1e2f3a4b5c6d7e8f90a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9',
    source: 'Durg Police Case Diary SP-014 Vault',
    text: `Verified evidentiary artifact ${evidenceId} cataloged under active investigation dossier. Corroborates pattern worthy of investigator attention.`
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded">
              {item.id}
            </span>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">{item.title}</h3>
              <p className="text-xs text-slate-400">{item.type}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Metadata badges */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-850/80 rounded-lg border border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Timestamp: <span className="font-mono text-slate-200">{item.ts}</span></span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Layers className="w-4 h-4 text-teal-400" />
              <span>Source: <span className="text-slate-200 truncate">{item.source}</span></span>
            </div>
          </div>

          {/* Transcript / Excerpt */}
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5 block flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              Official Case Transcript / Data Extract
            </label>
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs leading-relaxed text-slate-300">
              {item.text}
            </div>
          </div>

          {/* Cryptographic Hash */}
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1 block flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-amber-400" />
              Cryptographic SHA-256 Digest
            </label>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-teal-300/90 break-all select-all">
              {item.hash}
            </div>
          </div>

          {/* Defensibility Notice */}
          <div className="p-3 bg-teal-950/30 border border-teal-800/40 rounded-lg flex items-center gap-2.5 text-xs text-teal-200">
            <ShieldCheck className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <span>Cryptographically anchored in SAKSHI Audit Chain (Block index #10). Defensible under Section 65B Indian Evidence Act.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Synthetic sample dataset for investigative training</span>
          <button 
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvidenceModal;
