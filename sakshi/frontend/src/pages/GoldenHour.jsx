import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { 
  Clock, 
  MapPin, 
  Radio, 
  PhoneCall, 
  ShieldAlert, 
  AlertCircle, 
  Navigation, 
  Layers, 
  Eye, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { getGoldenHourApi } from '../api';
import { useAuth } from '../context/AuthContext';
import EvidenceModal from '../components/EvidenceModal';

// High-tech custom SVG DivIcon for missing persons
const createMissingPin = (id, name) => L.divIcon({
  className: 'custom-leaflet-marker',
  html: `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
      <div style="width: 28px; height: 28px; border-radius: 50%; background: #0f172a; border: 2px solid #38bdf8; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px rgba(56, 189, 248, 0.7);">
        <span style="font-size: 10px; font-weight: 800; font-family: monospace; color: #38bdf8;">${id.replace('MP-', '')}</span>
      </div>
      <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid #334155; border-radius: 4px; padding: 2px 6px; font-size: 10px; color: #f8fafc; font-weight: 600; white-space: nowrap; margin-top: 2px; box-shadow: 0 2px 6px rgba(0,0,0,0.5);">
        ${name.split(' ')[0]}
      </div>
    </div>
  `,
  iconSize: [60, 48],
  iconAnchor: [30, 24]
});

// Centroid marker for Bhilai Civic Center
const centroidPin = L.divIcon({
  className: 'custom-centroid-marker',
  html: `
    <div style="width: 18px; height: 18px; border-radius: 50%; background: #f43f5e; border: 3px solid #ffffff; box-shadow: 0 0 16px #f43f5e;"></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

export const GoldenHour = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  useEffect(() => {
    const fetchGH = async () => {
      try {
        const gh = await getGoldenHourApi();
        setData(gh);
      } catch (err) {
        console.error("Golden Hour data load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGH();
  }, [user?.role]);

  const centroid = data?.centroid || [21.2096, 81.3790];

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-slate-950">
      {/* Evidence Modal */}
      <EvidenceModal evidenceId={selectedEvidence} onClose={() => setSelectedEvidence(null)} />

      {/* Map View Canvas */}
      <div className="flex-1 h-[50vh] lg:h-full relative">
        <MapContainer
          center={centroid}
          zoom={14}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          {/* CARTO Dark Matter Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Centroid Civic Center */}
          <Marker position={centroid} icon={centroidPin}>
            <Popup>
              <div className="text-xs p-1">
                <div className="font-bold text-rose-400">Centroid: Bhilai Civic Center</div>
                <div className="text-[11px] text-slate-300">Epicenter of Golden Hour disappearances</div>
              </div>
            </Popup>
          </Marker>

          {/* Pulsing 3 km Golden Hour Radius Circle */}
          <Circle
            center={centroid}
            radius={3000}
            pathOptions={{
              color: '#f43f5e',
              fillColor: '#f43f5e',
              fillOpacity: 0.12,
              weight: 2,
              dashArray: '6, 6'
            }}
          />

          {/* Inner 1 km Rapid Perimeter Circle */}
          <Circle
            center={centroid}
            radius={1200}
            pathOptions={{
              color: '#0d9488',
              fillColor: '#0d9488',
              fillOpacity: 0.08,
              weight: 1.5,
            }}
          />

          {/* Missing Person Pins */}
          {data?.missing?.map((p) => (
            <Marker
              key={p.id}
              position={[p.lat, p.lon]}
              icon={createMissingPin(p.id, p.name)}
              eventHandlers={{
                click: () => setSelectedPerson(p)
              }}
            >
              <Popup>
                <div className="text-xs p-1 space-y-1">
                  <div className="font-mono text-teal-400 font-bold">{p.id}</div>
                  <div className="font-bold text-slate-100">{p.name} (Age {p.age})</div>
                  <div className="text-[11px] text-slate-300">Last seen: {new Date(p.last_seen_time).toLocaleString()}</div>
                  <div className="text-[10px] text-amber-300">{p.landmark}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Map Legend Overlay */}
        <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-2xl backdrop-blur-md z-[1000] text-xs space-y-2 pointer-events-auto">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
            <span className="font-bold text-slate-200">Golden Hour Search Zone (3 km)</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Centroid: 21.2096° N, 81.3790° E (Bhilai Civic Center)
          </div>
          <div className="flex items-center gap-3 pt-1 text-[11px] border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>3 km Chokepoint Ring</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
              <span>Missing Person Pins (5)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Intelligence Dossier Sidebar */}
      <div className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 p-5 overflow-y-auto space-y-5 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              24-HR GOLDEN HOUR CORRELATION
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-100">Spatio-Temporal Analysis</h2>
          <p className="text-xs text-slate-400 mt-1">
            Cross-referencing missing individual timelines against proximate mobile telemetry and highway exit corridors.
          </p>
        </div>

        {/* Burner Device Card */}
        {data?.burner && (
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs text-amber-300 uppercase tracking-wide">
                  Proximity Burner Phone
                </span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-rose-950 text-rose-300 rounded border border-rose-800">
                CRITICAL
              </span>
            </div>

            <div className="font-mono text-sm font-bold text-slate-100 bg-slate-900 p-2 rounded border border-slate-800 flex items-center justify-between">
              <span>{data.burner.number}</span>
              <span className="text-[10px] text-amber-400 font-sans">IMSI-404-71</span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Seen near <strong>4 of 5</strong> missing individuals within 90 min window.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Permanently powered off post-transit.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Exited city via <strong>Kumhari Toll NH-53</strong> at 01:10 hrs.</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] border-t border-slate-800/80">
              <span className="text-slate-400">Corroborating record:</span>
              <button
                onClick={() => setSelectedEvidence('TOLL-0019')}
                className="font-mono text-teal-300 bg-slate-800 px-2 py-0.5 rounded hover:bg-slate-700 transition"
              >
                TOLL-0019
              </button>
            </div>
          </div>
        )}

        {/* Digital Bait Phone Card */}
        {data?.bait && (
          <div className="p-4 rounded-xl bg-slate-950 border border-teal-500/40 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-teal-400" />
                <span className="font-bold text-xs text-teal-300 uppercase tracking-wide">
                  Digital Bait Lure Helpline
                </span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-teal-950 text-teal-300 rounded border border-teal-800">
                5 VICTIM MATCHES
              </span>
            </div>

            <div className="font-mono text-sm font-bold text-slate-100 bg-slate-900 p-2 rounded border border-slate-800 flex items-center justify-between">
              <span>{data.bait.number}</span>
              <span className="text-[10px] text-teal-400 font-sans">Apex Carrier Soln</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {data.bait.notes}
            </p>

            <div className="pt-2 flex items-center justify-between text-[11px] border-t border-slate-800/80">
              <span className="text-slate-400">Physical ad seizure:</span>
              <button
                onClick={() => setSelectedEvidence('AD-BAIT-01')}
                className="font-mono text-teal-300 bg-slate-800 px-2 py-0.5 rounded hover:bg-slate-700 transition"
              >
                AD-BAIT-01
              </button>
            </div>
          </div>
        )}

        {/* Missing Individuals List */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Missing Individuals Cluster (5)
          </label>
          <div className="space-y-2">
            {data?.missing?.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedPerson(p)}
                className={`p-3 rounded-xl border text-xs transition cursor-pointer ${
                  selectedPerson?.id === p.id 
                    ? 'bg-sky-950/60 border-sky-500 text-sky-200' 
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sky-400">{p.id}</span>
                    <span className="font-semibold text-slate-100">{p.name}</span>
                    <span className="text-[10px] text-slate-400">({p.age}y)</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">
                    {new Date(p.last_seen_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-rose-400 flex-shrink-0" />
                  <span className="truncate">{p.landmark}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldenHour;
