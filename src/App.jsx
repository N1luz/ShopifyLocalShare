import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Store, 
  Activity, 
  Layers, 
  Cpu, 
  Coins, 
  Shield, 
  Navigation, 
  ShoppingCart, 
  QrCode, 
  RefreshCw, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  Database,
  Link,
  Info
} from 'lucide-react';

// Path coordinates through streets of Karlsruhe Oststadt
// Lameyplatz Späti -> Gotec Club
const pathCoordinates = [
  [49.0112, 8.3615], // Lameyplatz Späti (Start)
  [49.0118, 8.3582], // Lameystraße
  [49.0135, 8.3548], // Rheinhafenstraße
  [49.0162, 8.3538], // Gablonzer Straße Corner
  [49.0185, 8.3512]  // Gotec Club (End)
];

const getInterpolatedPoint = (progress) => {
  if (progress <= 0) return pathCoordinates[0];
  if (progress >= 1) return pathCoordinates[pathCoordinates.length - 1];
  
  const segments = pathCoordinates.length - 1;
  const rawIndex = progress * segments;
  const index = Math.floor(rawIndex);
  const t = rawIndex - index;
  
  const p1 = pathCoordinates[index];
  const p2 = pathCoordinates[index + 1];
  
  const lat = p1[0] + (p2[0] - p1[0]) * t;
  const lng = p1[1] + (p2[1] - p1[1]) * t;
  
  return [lat, lng];
};

function BlockchainExplorer({ ledger, selectedBlockId, setSelectedBlockId, getBlockPayload, onClose }) {
  const selectedIndex = ledger.findIndex(e => e.id === selectedBlockId);
  const activeIndex = selectedIndex !== -1 ? selectedIndex : 0;
  const activeEntry = ledger[activeIndex];
  const blockData = activeEntry ? getBlockPayload(activeEntry, ledger.length - 1 - activeIndex) : null;

  return (
    <div className="explorer-window" style={{ height: 'auto', maxHeight: 'none' }}>
      <div className="explorer-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={20} style={{ color: 'var(--neon-purple)' }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Shopify Ledger Explorer</h2>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              fontSize: '1.5rem', 
              fontWeight: 'bold',
              color: 'var(--text-muted)'
            }}
          >
            &times;
          </button>
        )}
      </div>
      <div className="explorer-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Block chain scroller */}
        <div className="block-chain-scroller" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.75rem' }}>
          {ledger.map((entry, idx) => {
            const blockNum = ledger.length - 1 - idx + 48291;
            const isActive = idx === activeIndex;
            return (
              <React.Fragment key={entry.id}>
                <div 
                  className={`block-card ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedBlockId(entry.id)}
                  style={{ flex: '0 0 200px', cursor: 'pointer' }}
                >
                  <span className="block-height-tag">Block #{blockNum}</span>
                  <span className="block-card-title">{entry.title}</span>
                  <span className="block-card-hash">{entry.hash}</span>
                </div>
                {idx < ledger.length - 1 && <div className="block-connector-line"></div>}
              </React.Fragment>
            );
          })}
        </div>

        {blockData && (
          <div className="explorer-details-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
            {/* Visual State Node visualization */}
            <div className="visual-state-pane" style={{ background: '#f8fafc', border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', borderBottom: '1px solid rgba(0, 0, 0, 0.06)', paddingBottom: '0.5rem', textAlign: 'left', margin: 0 }}>
                Transaktions-Visualisierung
              </h3>
              
              {blockData.type === 'SMART_CONTRACT_INITIALIZATION' && (
                <div className="visual-nodes" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '1rem 0' }}>
                  <div className="visual-node active">
                    <div className="visual-node-icon" style={{ color: 'var(--neon-purple)', background: 'var(--neon-purple-glow)' }}>
                      <Cpu size={18} />
                    </div>
                    <span className="visual-node-label">Shopify Cloud</span>
                    <span className="visual-node-status" style={{ color: 'var(--neon-purple)' }}>SYSTEM</span>
                  </div>
                  <div className="visual-connection-arrow active" style={{ background: 'var(--shopify-green)' }}></div>
                  <div className="visual-node active">
                    <div className="visual-node-icon">
                      <Store size={18} />
                    </div>
                    <span className="visual-node-label">POS Terminal</span>
                    <span className="visual-node-status">READY</span>
                  </div>
                </div>
              )}

              {blockData.type === 'INVENTORY_TRANSFER_ESCROW' && (
                <div className="visual-nodes" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '1rem 0' }}>
                  <div className="visual-node active">
                    <div className="visual-node-icon">
                      <Store size={18} />
                    </div>
                    <span className="visual-node-label">Späti (Node #1)</span>
                    <span className="visual-node-status" style={{ color: 'var(--neon-orange)' }}>SENDER</span>
                  </div>
                  <div className="visual-connection-arrow active" style={{ background: 'var(--shopify-green)' }}></div>
                  <div className="visual-node active" style={{ borderColor: 'var(--neon-cyan)' }}>
                    <div className="visual-node-icon" style={{ color: 'var(--neon-cyan)', background: 'var(--neon-cyan-glow)' }}>
                      <Activity size={18} />
                    </div>
                    <span className="visual-node-label">Escrow Contract</span>
                    <span className="visual-node-status" style={{ color: 'var(--neon-cyan)' }}>LOCKED</span>
                  </div>
                  <div className="visual-connection-arrow active" style={{ background: 'var(--shopify-green)' }}></div>
                  <div className="visual-node active">
                    <div className="visual-node-icon">
                      <Store size={18} />
                    </div>
                    <span className="visual-node-label">Gotec (Node #2)</span>
                    <span className="visual-node-status">RECEIVER</span>
                  </div>
                </div>
              )}

              {blockData.type === 'POS_TRANSACTION_PAYOUT_SPLIT' && (
                <div className="visual-nodes" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-around' }}>
                    <div className="visual-node active">
                      <div className="visual-node-icon">
                        <ShoppingCart size={18} />
                      </div>
                      <span className="visual-node-label">POS Verkauf</span>
                      <span className="visual-node-status">Kunde zahlt</span>
                    </div>
                    <div className="visual-connection-arrow active" style={{ background: 'var(--shopify-green)' }}></div>
                    <div className="visual-node active" style={{ borderColor: 'var(--neon-purple)' }}>
                      <div className="visual-node-icon" style={{ color: 'var(--neon-purple)', background: 'var(--neon-purple-glow)' }}>
                        <Layers size={18} />
                      </div>
                      <span className="visual-node-label">Smart Contract</span>
                      <span className="visual-node-status" style={{ color: 'var(--neon-purple)' }}>REVENUE SPLIT</span>
                    </div>
                  </div>
                  
                  {/* Split targets */}
                  <div style={{ display: 'flex', gap: '0.5rem', width: '100%', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                    <div className="visual-node active" style={{ width: '100px', padding: '0.5rem' }}>
                      <span className="visual-node-label" style={{ fontSize: '0.65rem' }}>Online-Händler</span>
                      <span className="visual-node-status" style={{ fontSize: '0.6rem' }}>70% (Direct)</span>
                    </div>
                    <div className="visual-node active" style={{ width: '100px', padding: '0.5rem' }}>
                      <span className="visual-node-label" style={{ fontSize: '0.65rem' }}>Kioskbesitzer</span>
                      <span className="visual-node-status" style={{ fontSize: '0.6rem' }}>20% (Space)</span>
                    </div>
                    <div className="visual-node active" style={{ width: '100px', padding: '0.5rem' }}>
                      <span className="visual-node-label" style={{ fontSize: '0.65rem' }}>Shopify Fee</span>
                      <span className="visual-node-status" style={{ fontSize: '0.6rem' }}>10% (Network)</span>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'left', background: 'rgba(0,0,0,0.02)', padding: '0.75rem', borderRadius: '8px' }}>
                <div><strong>Typ:</strong> {blockData.type}</div>
                <div><strong>Validator:</strong> {blockData.validator}</div>
                <div><strong>Status:</strong> Gehascht und permanent festgeschrieben</div>
              </div>
            </div>

            {/* Details JSON Pane */}
            <div className="details-pane" style={{ background: '#f8fafc', border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', borderBottom: '1px solid rgba(0, 0, 0, 0.06)', paddingBottom: '0.5rem', textAlign: 'left', margin: 0 }}>Block Details</h3>
              <pre style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: '0.75rem', 
                background: '#ffffff', 
                border: '1px solid rgba(0, 0, 0, 0.05)', 
                padding: '1rem', 
                borderRadius: '8px', 
                overflowX: 'auto', 
                color: 'var(--text-primary)', 
                lineHeight: '1.4',
                textAlign: 'left',
                margin: 0
              }}>{JSON.stringify(blockData, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  // Navigation: 0 = POS Intro Slide, 1 = Interactive Map Dashboard
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showExplorer, setShowExplorer] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState(null);

  // Inventory stocks
  const [spaetiStock, setSpaetiStock] = useState({ bier: 240, cola: 180, mate: 95 });
  const [gotecStock, setGotecStock] = useState({ bier: 12, cola: 8, mate: 24 });
  
  // Ledger (Blockchain tracker logs)
  const [ledger, setLedger] = useState([
    { id: 1, type: 'contract', title: 'Genesis-Block erstellt', text: 'Shopify LocalShare Smart Contract initialisiert.', time: 'Vor 10 Min.', hash: '0x0000000000000000' },
    { id: 2, type: 'contract', title: 'Knotenpunkt registriert', text: 'Lameyplatz Späti erfolgreich in Blockchain eingebunden.', time: 'Vor 9 Min.', hash: '0x8f2a1b9e...3c5d' },
    { id: 3, type: 'contract', title: 'Knotenpunkt registriert', text: 'Gotec Club POS Terminal synchronisiert.', time: 'Vor 8 Min.', hash: '0x5c7b3d1f...9a2e' },
    { id: 4, type: 'sale', title: 'Synchronisation Aktiv', text: 'Echtzeit-Verbindung mit Shopify Central Inventory (O2O) steht.', time: 'Vor 5 Min.', hash: '0x4e9a8b1c...2f5d' }
  ]);

  // POS State
  const [posStore, setPosStore] = useState('gotec'); // 'gotec' or 'spaeti'
  const [posBasket, setPosBasket] = useState({ bier: 0, cola: 0, mate: 0 });
  const [isScanning, setIsScanning] = useState(false);
  
  // Courier / Rebalancing animation state
  const [courierStatus, setCourierStatus] = useState('idle'); // 'idle', 'dispatching', 'delivering', 'arrived'
  const [courierProgress, setCourierProgress] = useState(0);
  const [transferTriggered, setTransferTriggered] = useState(false);
  
  // Refs for Map objects
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const gotecMarkerRef = useRef(null);
  const spaetiMarkerRef = useRef(null);
  const courierMarkerRef = useRef(null);
  
  // Helpers to add ledger logs
  const addLedgerEntry = (title, text, type) => {
    const randomHash = '0x' + Array.from({length: 16}, () => Math.floor(Math.random()*16).toString(16)).join('');
    setLedger(prev => [
      {
        id: Date.now(),
        type,
        title,
        text,
        time: 'Gerade eben',
        hash: randomHash
      },
      ...prev
    ]);
  };

  const getBlockPayload = (entry, index) => {
    const blockNum = index + 48291;
    if (entry.type === 'contract') {
      return {
        block: blockNum,
        hash: entry.hash,
        timestamp: "2026-06-18T22:30:12.821Z",
        type: "SMART_CONTRACT_INITIALIZATION",
        validator: "Shopify Ledger Validator #KA-1",
        payload: {
          agreementId: `SC-AGR-${entry.hash.substring(2, 6).toUpperCase()}`,
          terms: entry.text,
          status: "ACTIVE",
          rules: [
            "Revenue split enforced on POS scan",
            "Real-time inventory sync authorized",
            "MHD rebalancing triggers allowed"
          ]
        }
      };
    } else if (entry.type === 'transfer') {
      return {
        block: blockNum,
        hash: entry.hash,
        timestamp: "2026-06-18T22:32:05.421Z",
        type: "INVENTORY_TRANSFER_ESCROW",
        validator: "Shopify Ledger Validator #KA-2",
        payload: {
          courierId: "BikeCourier_Karlsruhe_12",
          cargo: entry.text,
          escrowCustodian: "Shopify Escrow Vault",
          routing: {
            from: "Lameyplatz Späti (Node #1)",
            to: "Gotec Club (Node #2)"
          },
          blockchainStatus: "COMMITTED"
        }
      };
    } else {
      return {
        block: blockNum,
        hash: entry.hash,
        timestamp: new Date().toISOString(),
        type: "POS_TRANSACTION_PAYOUT_SPLIT",
        validator: "Shopify POS Gateway Terminal #92",
        payload: {
          originPOS: "Gotec Club Register #1",
          details: entry.text,
          currency: "EUR",
          splits: {
            onlineMerchant: "70% (Real-time Payout)",
            storeOwner: "20% (Instore Space fee)",
            shopifyPlatform: "10% (Network fee)"
          },
          status: "SUCCESS_DISPATCHED"
        }
      };
    }
  };

  // Web Audio POS beep sound
  const playScanBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime); // Beep tone frequency
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.08); // 80ms beep
    } catch (e) {
      console.warn('AudioContext beep blocked by browser policy.', e);
    }
  };

  // Reset cache/state on reload
  useEffect(() => {
    localStorage.clear();
    sessionStorage.clear();
  }, []);

  // Initialize Map
  useEffect(() => {
    if (currentSlide === 1 && !mapRef.current && mapContainerRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [49.0146, 8.3565], // Center between Gotec and Lameyplatz
        zoom: 15,
        zoomControl: false,
        dragging: true,
        scrollWheelZoom: false
      });
      
      // Load premium light tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/attributions">CartoDB</a>'
      }).addTo(map);
      
      mapRef.current = map;
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Draw the transfer route polyline
      L.polyline(pathCoordinates, {
        color: '#0891b2',
        dashArray: '5, 8',
        weight: 3,
        opacity: 0.6
      }).addTo(map);
    }

    // Cleanup Map when component unmounts or changes slide
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        gotecMarkerRef.current = null;
        spaetiMarkerRef.current = null;
        courierMarkerRef.current = null;
      }
    };
  }, [currentSlide]);

  // Update Markers when stock values change
  useEffect(() => {
    if (currentSlide !== 1 || !mapRef.current) return;

    // Späti HTML marker
    const spaetiIconHtml = `
      <div class="map-marker-container">
        <div class="map-marker-badge ${spaetiStock.bier < 50 ? 'low' : ''}">
          🍺 ${spaetiStock.bier} | 🥤 ${spaetiStock.cola} | 🧉 ${spaetiStock.mate}
        </div>
        <div class="map-marker-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-store"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
        </div>
        <div class="map-marker-label">Lameyplatz Späti</div>
      </div>
    `;
    
    if (spaetiMarkerRef.current) {
      spaetiMarkerRef.current.setIcon(L.divIcon({
        className: 'custom-map-icon',
        html: spaetiIconHtml,
        iconSize: [60, 60],
        iconAnchor: [30, 45]
      }));
    } else {
      spaetiMarkerRef.current = L.marker([49.0112, 8.3615], {
        icon: L.divIcon({
          className: 'custom-map-icon',
          html: spaetiIconHtml,
          iconSize: [60, 60],
          iconAnchor: [30, 45]
        })
      }).addTo(mapRef.current);
    }

    // Gotec Club HTML marker
    const gotecIconHtml = `
      <div class="map-marker-container">
        <div class="map-marker-badge ${gotecStock.bier < 30 ? 'low' : ''}">
          🍺 ${gotecStock.bier} | 🥤 ${gotecStock.cola} | 🧉 ${gotecStock.mate}
        </div>
        <div class="map-marker-icon club">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-music"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        </div>
        <div class="map-marker-label">Gotec Club</div>
      </div>
    `;
    
    if (gotecMarkerRef.current) {
      gotecMarkerRef.current.setIcon(L.divIcon({
        className: 'custom-map-icon',
        html: gotecIconHtml,
        iconSize: [60, 60],
        iconAnchor: [30, 45]
      }));
    } else {
      gotecMarkerRef.current = L.marker([49.0185, 8.3512], {
        icon: L.divIcon({
          className: 'custom-map-icon',
          html: gotecIconHtml,
          iconSize: [60, 60],
          iconAnchor: [30, 45]
        })
      }).addTo(mapRef.current);
    }
  }, [gotecStock, spaetiStock, currentSlide]);

  // Handle Courier movement on Map
  useEffect(() => {
    if (currentSlide !== 1 || !mapRef.current) return;
    
    if (courierStatus === 'delivering' || courierStatus === 'dispatching') {
      const coords = getInterpolatedPoint(courierProgress);
      
      const courierIconHtml = `
        <div class="courier-marker-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bike"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-2.8 5.4 2.4-2.2 2.8 3.4M5.5 17.5l6-11.5 4 4.5h6"/></svg>
        </div>
      `;
      
      if (courierMarkerRef.current) {
        courierMarkerRef.current.setLatLng(coords);
      } else {
        courierMarkerRef.current = L.marker(coords, {
          icon: L.divIcon({
            className: 'custom-map-icon',
            html: courierIconHtml,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
          })
        }).addTo(mapRef.current);
      }
    } else {
      if (courierMarkerRef.current) {
        mapRef.current.removeLayer(courierMarkerRef.current);
        courierMarkerRef.current = null;
      }
    }
  }, [courierProgress, courierStatus, currentSlide]);

  // AI-Driven Inventory Rebalancing Action
  const handleTriggerRebalance = () => {
    if (courierStatus !== 'idle') return;
    
    setCourierStatus('dispatching');
    addLedgerEntry(
      'Smart Contract unterzeichnet',
      'Shared Inventory Agreement #KA-829. Umlagerungsgebühr: €4.50. Versicherungsschutz: aktiv.',
      'contract'
    );
    
    const duration = 6500; // Animation duration
    const startTime = Date.now();
    let milestone1 = false;
    let milestone2 = false;
    let milestone3 = false;
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      setCourierProgress(progress);
      
      // Milestones in ledger
      if (progress >= 0.1 && !milestone1) {
        milestone1 = true;
        setCourierStatus('delivering');
        addLedgerEntry(
          'Kurier gestartet',
          'Fahrradkurier #12 auf dem Weg zum Lameyplatz Späti.',
          'transfer'
        );
      }
      if (progress >= 0.5 && !milestone2) {
        milestone2 = true;
        addLedgerEntry(
          'Ware geladen & QR gescannt',
          'Umlagerung gestartet: 120 Bier & 130 Cola (50 Cola Sicherheitsbestand verbleiben). Eigentum an Blockchain-Treuhand übertragen.',
          'transfer'
        );
      }
      if (progress >= 0.8 && !milestone3) {
        milestone3 = true;
        addLedgerEntry(
          'Kurier passiert Rheinhafenstraße',
          'GPS-Ortung aktiv. Kurier nähert sich Gotec Club.',
          'transfer'
        );
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Arrived!
        setCourierStatus('arrived');
        
        // Update physical stocks
        setSpaetiStock(prev => ({
          bier: prev.bier - 120,
          cola: prev.cola - 130, // 50 Cola safety stock stays at Späti
          mate: prev.mate
        }));
        
        setGotecStock(prev => ({
          bier: prev.bier + 120,
          cola: prev.cola + 130,
          mate: prev.mate
        }));
        
        addLedgerEntry(
          'Warentransfer abgeschlossen',
          'Lieferung am Gotec Club eingetroffen. Kasse & Shopify-Backend synchronisiert. Smart Contract ausgeführt.',
          'contract'
        );
        
        setTimeout(() => {
          setCourierStatus('idle');
          setCourierProgress(0);
          setTransferTriggered(true); // Disable further transfers in UI
        }, 2000);
      }
    };
    
    requestAnimationFrame(animate);
  };

  // POS Scanner Quantity Adjustment
  const adjustQty = (item, amt) => {
    setPosBasket(prev => ({
      ...prev,
      [item]: Math.max(0, prev[item] + amt)
    }));
  };

  // Simulating POS checkout/scan
  const handlePOSCheckout = () => {
    const currentStoreStock = posStore === 'gotec' ? gotecStock : spaetiStock;
    
    // Check if basket is empty
    const totalItems = posBasket.bier + posBasket.cola + posBasket.mate;
    if (totalItems === 0) return;
    
    // Check if enough stock
    if (
      posBasket.bier > currentStoreStock.bier ||
      posBasket.cola > currentStoreStock.cola ||
      posBasket.mate > currentStoreStock.mate
    ) {
      alert('Nicht genügend Lagerbestand im Store!');
      return;
    }
    
    // POS scan sound & flash animation
    playScanBeep();
    setIsScanning(true);
    
    setTimeout(() => {
      setIsScanning(false);
      
      // Calculate prices & revenue split
      // Prices: Bier = €3.50, Cola = €3.00, Mate = €3.50
      const totalRevenue = (posBasket.bier * 3.50) + (posBasket.cola * 3.00) + (posBasket.mate * 3.50);
      const merchantCut = (totalRevenue * 0.70).toFixed(2);
      const storeCut = (totalRevenue * 0.20).toFixed(2);
      const shopifyFee = (totalRevenue * 0.10).toFixed(2);

      // Deduct stock
      if (posStore === 'gotec') {
        setGotecStock(prev => ({
          bier: prev.bier - posBasket.bier,
          cola: prev.cola - posBasket.cola,
          mate: prev.mate - posBasket.mate
        }));
      } else {
        setSpaetiStock(prev => ({
          bier: prev.bier - posBasket.bier,
          cola: prev.cola - posBasket.cola,
          mate: prev.mate - posBasket.mate
        }));
      }
      
      // Log to Ledger
      addLedgerEntry(
        `POS Verkauf: €${totalRevenue.toFixed(2)}`,
        `Kassenschnitt: ${posBasket.bier}x Bier, ${posBasket.cola}x Cola, ${posBasket.mate}x Mate. Smart Contract Split: Händler (€${merchantCut}), Kiosk (€${storeCut}), Shopify-Gebühr (€${shopifyFee}).`,
        'sale'
      );
      
      // Reset Basket
      setPosBasket({ bier: 0, cola: 0, mate: 0 });
    }, 500);
  };

  // --- FOLIE 1: KASSEN-FOKUS INTRO ---
  return (
    <div className="dashboard-container fade-in" style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
      
      {/* Persistent Header on both sides */}
      <header className="dashboard-header" style={{ width: '100%', position: 'sticky', top: 0, zIndex: 1000, margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="logo-section">
          <img src="/logo.png" alt="Shopify Logo" style={{ height: '36px', width: 'auto', marginRight: '0.25rem' }} />
          <span className="logo-text" style={{ background: 'none', WebkitTextFillColor: 'initial', color: 'var(--text-primary)' }}>Shopify LocalShare</span>
          <span className="logo-badge">Präsentationsmodus</span>
        </div>
        
        {/* Navigation Switcher inside the Header */}
        <div style={{ display: 'flex', background: '#f1f2f4', padding: '4px', borderRadius: '10px', border: '1px solid #e1e3e5' }}>
          <button 
            onClick={() => setCurrentSlide(0)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: currentSlide === 0 ? '#ffffff' : 'transparent',
              color: currentSlide === 0 ? '#1a1a1a' : '#64748b',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: currentSlide === 0 ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Store size={14} style={{ color: currentSlide === 0 ? 'var(--shopify-green-dark)' : '#64748b' }} />
            <span>Folie 1: Kasse vor Ort</span>
          </button>
          <button 
            onClick={() => setCurrentSlide(1)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: currentSlide === 1 ? '#ffffff' : 'transparent',
              color: currentSlide === 1 ? '#1a1a1a' : '#64748b',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: currentSlide === 1 ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Navigation size={14} style={{ color: currentSlide === 1 ? 'var(--shopify-green-dark)' : '#64748b' }} />
            <span>Folie 2: Live-Netzwerk</span>
          </button>
        </div>
      </header>

      {/* Slide 1 Content */}
      {currentSlide === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', animation: 'fade-in 0.3s ease-out' }}>
          {/* Intro View Layout */}
          <div className="panel" style={{ padding: '2.5rem', justifyContent: 'center' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', alignItems: 'center' }}>
              {/* Left Column: Image focused on the iPad Cash Register */}
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px', border: '3px solid var(--shopify-green)', boxShadow: '0 6px 20px rgba(149, 191, 71, 0.15)' }}>
                <img 
                  src="/boutique-pos.jpg" 
                  alt="Shopify POS Kasse in Boutique" 
                  style={{
                    width: '100%',
                    height: '520px',
                    objectFit: 'cover',
                    objectPosition: '55% 72%',
                    display: 'block'
                  }}
                />
              </div>

              {/* Right Column: Short Explanation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span className="logo-badge" style={{ alignSelf: 'flex-start' }}>1. Die Schnittstelle vor Ort</span>
                  <h1 style={{ fontSize: '2.2rem', fontWeight: '800', lineHeight: '1.2', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                    Die physische Kasse
                  </h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontStyle: 'italic' }}>
                    Ausgangspunkt für das vernetzte Shopify-Ökosystem.
                  </p>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  <p>
                    Das System beginnt direkt an der Kasse (POS) eines lokalen Ladengeschäfts. Anstatt isoliert zu arbeiten, ist diese Kasse <strong>live mit dem Shopify-System vernetzt</strong>.
                  </p>
                  
                  <p><strong>Warum dieser Kassen-Fokus wichtig ist:</strong></p>
                  
                  <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <li>
                      <strong>Echtzeit-Synchronisation</strong>: Ein Verkauf zieht die Ware sofort digital von Shopify ab. Online- und Offline-Bestände sind immer zu 100% synchron.
                    </li>
                    <li>
                      <strong>Split-Payment via Blockchain</strong>: Der Smart Contract teilt den eingenommenen Betrag sofort auf. Der Online-Händler, der Kioskbesitzer und Shopify erhalten automatisch ihren Anteil.
                    </li>
                    <li>
                      <strong>Umlagerungs-Träger</strong>: Sobald die Kasse kritisch niedrige Bestände meldet, leitet das System automatisch Umlagerungen aus anderen Kiosken per Kurier ein.
                    </li>
                  </ul>
                </div>

                <button 
                  className="pos-sell-btn" 
                  style={{ width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '1.05rem', color: '#000000' }}
                  onClick={() => setCurrentSlide(1)}
                >
                  <span>Zum interaktiven Netzwerk wechseln (Karte öffnen)</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Video Demonstration (Visible when scrolling down) */}
          <div className="panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ maxWidth: '900px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(0, 0, 0, 0.08)', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)' }}>
              <video 
                src="/Folie1.mp4" 
                autoPlay
                muted
                loop
                playsInline
                controls
                style={{ width: '100%', display: 'block', background: '#000' }}
              />
            </div>
          </div>

          {/* Stock Take Detail (Boutique Scan Image) */}
          <div className="panel" style={{ padding: '2.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', alignItems: 'center' }}>
              {/* Left Column: Short Explanation of the scanner in the ecosystem */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span className="logo-badge" style={{ alignSelf: 'flex-start' }}>2. Live-Abstimmung & Bestandsprüfung</span>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: '800', lineHeight: '1.2', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                    Echtzeit-Warenerfassung & Stock Take
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontStyle: 'italic' }}>
                    Intelligente Erfassung für nahtloses O2O (Online-to-Offline) Fulfillment.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  <p>
                    Die mobile Shopify POS-App während eines physischen Kassiervorgangs oder einer Bestandsprüfung ("Stock Take"). Jedes Mal, wenn ein Artikel gescannt wird:
                  </p>
                  <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <li>
                      <strong>Echtzeit-Synchronisierung:</strong> Der physische Verkauf zieht die Ware im Shopify-Backend ab, sodass keine doppelten Verkäufe (Online/Offline) entstehen.
                    </li>
                    <li>
                      <strong>Automatisches Rebalancing:</strong> Fällt der Bestand unter einen Schwellenwert, meldet die KI den Bedarf und veranlasst eine Umlagerung.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Column: Scan Image */}
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px', border: '3px solid var(--shopify-green)', boxShadow: '0 6px 20px rgba(149, 191, 71, 0.15)' }}>
                <img 
                  src="/boutique-scan.png" 
                  alt="Shopify Stock Take Scan" 
                  style={{
                    width: '100%',
                    height: '480px',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide 2 Content */}
      {currentSlide === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', animation: 'fade-in 0.3s ease-out' }}>
          
          {/* Explanation Header for Shared Inventory with Placeholder Images */}
          <div className="panel" style={{ padding: '2.5rem', textAlign: 'left', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
            <div style={{ maxWidth: '900px', marginBottom: '2rem' }}>
              <span className="logo-badge" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>Die Konzept-Idee</span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.75rem', letterSpacing: '-0.5px' }}>
                Shared Inventory & Collaborative Retail
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                Das Shared Inventory Konzept ermöglicht es physischen Stores und D2C-Onlinehändlern, ihre Warenbestände in Echtzeit lokal zu teilen. Statt dass jeder Händler ein vollbestücktes Einzellager finanzieren muss, werden Bestände dezentral und bedarfsorientiert per KI und Fahrradkurier umgelagert. Die Abrechnung erfolgt automatisiert über Smart Contracts.
              </p>
            </div>
            
            {/* Placeholder images grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
              
              {/* Card 1: Dezentrale Präsenz (Real Image) */}
              <div className="panel" style={{ 
                border: '1px solid var(--border-color)', 
                borderRadius: '12px', 
                background: 'var(--card-bg)',
                display: 'flex', 
                flexDirection: 'column', 
                overflow: 'hidden',
                minHeight: '220px',
                padding: 0
              }}>
                <div style={{ height: '130px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                  <img src="/folie2-bild1.jpg" alt="Dezentrale Präsenz" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>1. Dezentrale Präsenz</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    Produktausstellung und Verkauf direkt vor Ort im lokalen Partnershop.
                  </span>
                </div>
              </div>

              {/* Card 2: Flexibler Kurier-Transfer (Real Image) */}
              <div className="panel" style={{ 
                border: '1px solid var(--border-color)', 
                borderRadius: '12px', 
                background: 'var(--card-bg)',
                display: 'flex', 
                flexDirection: 'column', 
                overflow: 'hidden',
                minHeight: '220px',
                padding: 0
              }}>
                <div style={{ height: '130px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                  <img src="/folie2-bild2.jpg" alt="Flexibler Kurier-Transfer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>2. Flexibler Kurier-Transfer</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    Schnelle und bedarfsorientierte Umlagerung per Lastenrad zwischen den Stores.
                  </span>
                </div>
              </div>

              {/* Card 3: Blockchain Smart Split (Placeholder) */}
              <div style={{ 
                border: '2px dashed rgba(124, 58, 237, 0.3)', 
                borderRadius: '12px', 
                padding: '1.5rem', 
                background: 'rgba(124, 58, 237, 0.02)',
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '0.75rem',
                minHeight: '220px'
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--neon-purple)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Coins size={20} />
                </div>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>3. Blockchain Smart Split</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.4' }}>
                  [Bildplatzhalter: Automatisierte Transaktionen und Payout-Splits]
                </span>
              </div>

            </div>
          </div>

          {/* macOS Browser Mockup window */}
          <div className="mac-mockup-window">
            {/* macOS Titlebar */}
            <div className="mac-titlebar">
              <div className="mac-dots">
                <div className="mac-dot close"></div>
                <div className="mac-dot minimize"></div>
                <div className="mac-dot maximize"></div>
              </div>
              <div className="mac-address-bar">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span>admin.shopify.com/store/lunas-boutique/shared-inventory</span>
              </div>
              <div></div>
            </div>

            {/* Shopify Admin Desktop Layout */}
            <div className="shopify-admin-layout">
              
              {/* Shopify Left Sidebar */}
              <aside className="shopify-sidebar">
                <div className="shopify-sidebar-logo">
                  <img src="/logo.png" alt="Shopify Logo" style={{ height: '30px', width: 'auto' }} />
                  <span style={{ fontWeight: '700', fontSize: '1.05rem', color: '#1a1a1a' }}>Shopify Admin</span>
                </div>
                <nav className="shopify-sidebar-nav">
                  <div className="shopify-nav-item">
                    <Store size={16} />
                    <span>Home</span>
                  </div>
                  <div className="shopify-nav-item">
                    <ShoppingCart size={16} />
                    <span>Bestellungen</span>
                  </div>
                  <div className="shopify-nav-item">
                    <QrCode size={16} />
                    <span>Produkte</span>
                  </div>
                  <div className="shopify-nav-item">
                    <Activity size={16} />
                    <span>Kunden</span>
                  </div>
                  <div className="shopify-nav-item">
                    <TrendingUp size={16} />
                    <span>Analysen</span>
                  </div>
                  <div className="shopify-nav-item active">
                    <Layers size={16} />
                    <span>Shared Inventory</span>
                  </div>
                </nav>
                <div style={{ padding: '0.75rem', background: '#f1f2f4', borderRadius: '8px', fontSize: '0.75rem', color: '#666', textAlign: 'left' }}>
                  <strong>Store:</strong> Karlsruhe Oststadt
                </div>
              </aside>

              {/* Main Shopify Dashboard Panel */}
              <div className="shopify-main-content">
                {/* Shopify Topbar */}
                <div className="shopify-topbar">
                  <div className="shopify-search">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <span>Suche nach Umlagerungen, Logs...</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="shopify-profile">
                      <span>Lunas Boutique</span>
                      <div className="shopify-avatar">L</div>
                    </div>
                  </div>
                </div>

                {/* Actual Dashboard Content Area */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* Header title in Shopify Admin Style */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ textAlign: 'left' }}>
                      <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>Shared Inventory Management</h1>
                      <p style={{ fontSize: '0.85rem', color: '#666', margin: '0.25rem 0 0 0' }}>KI-gestütztes Peer-to-Peer Warentransfernetzwerk und Blockchain-Ledger.</p>
                    </div>
                    <div className="status-pills">
                      <div className="status-pill" style={{ background: '#fff' }}>
                        <span className="status-indicator green"></span>
                        <span>Shopify APIs: SYNCED</span>
                      </div>
                      <div className="status-pill" style={{ background: '#fff' }}>
                        <span className="status-indicator purple"></span>
                        <span>Ledger: SECURED</span>
                      </div>
                    </div>
                  </div>

                  {/* Main Dashboard Grid */}
                  <div className="dashboard-grid" style={{ minHeight: '520px' }}>
                    
                    {/* Left Panel: Map & Logistics View */}
                    <section className="panel" style={{ background: '#fff', border: '1px solid #e1e3e5' }}>
                      <div className="panel-header" style={{ borderBottom: '1px solid #f1f2f4' }}>
                        <h2 className="panel-title" style={{ fontSize: '0.95rem' }}>
                          <Navigation size={16} />
                          <span>Karlsruhe Oststadt - Live-Logistiknetzwerk</span>
                        </h2>
                        {courierStatus !== 'idle' && (
                          <span className="logo-badge" style={{ borderColor: 'var(--neon-cyan)', color: 'var(--neon-cyan)', background: 'rgba(8, 145, 178, 0.05)' }}>
                            {courierStatus === 'dispatching' ? 'Smart Contract wird verifiziert...' : `Kurier in Bewegung: ${Math.round(courierProgress * 100)}%`}
                          </span>
                        )}
                      </div>
                      <div className="panel-content" style={{ padding: 0 }}>
                        <div className="map-wrapper" style={{ minHeight: '440px' }}>
                          <div ref={mapContainerRef}></div>
                        </div>
                      </div>
                    </section>

                    {/* Right Sidebar: AI recommendation, POS simulator, Blockchain ledger */}
                    <aside className="sidebar-panel">
                      
                      {/* AI Recommendation Panel */}
                      <div className="panel" style={{ background: '#fff', border: '1px solid #e1e3e5' }}>
                        <div className="panel-header" style={{ borderBottom: '1px solid #f1f2f4' }}>
                          <h2 className="panel-title" style={{ color: 'var(--neon-cyan)', fontSize: '0.95rem' }}>
                            <Cpu size={16} style={{ color: 'var(--neon-cyan)' }} />
                            <span>KI-Bedarfsanalyse</span>
                          </h2>
                        </div>
                        <div className="panel-content">
                          {!transferTriggered && courierStatus === 'idle' ? (
                            <div className="ai-recommendation-box" style={{ background: 'rgba(8, 145, 178, 0.02)' }}>
                              <div className="ai-header" style={{ color: 'var(--neon-cyan)' }}>
                                <AlertTriangle size={14} />
                                <span>Engpass-Prognose (Event am Wochenende)</span>
                              </div>
                              <p className="ai-body" style={{ fontSize: '0.85rem' }}>
                                <strong>Bedarfs-Peak erkannt:</strong> Gotec Club veranstaltet Samstag eine Techno-Nacht. Aktueller Getränkebestand deckt ca. 1.5 Stunden.
                              </p>
                              <p className="ai-body" style={{ fontSize: '0.85rem' }}>
                                <strong>Lagerüberschuss gefunden:</strong> Lameyplatz Späti hat 240 Bier und 180 Cola im Lager (50 Cola Sicherheitsbestand verbleiben vor Ort).
                              </p>
                              <div className="ai-route-detail" style={{ fontSize: '0.75rem' }}>
                                Umlagerung: 120 Bier, 130 Cola<br/>
                                Distanz: ~850m | Transport: Fahrradkurier
                              </div>
                              <button 
                                className="btn-cyan" 
                                onClick={handleTriggerRebalance}
                                disabled={courierStatus !== 'idle'}
                                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                              >
                                <RefreshCw size={14} className={courierStatus !== 'idle' ? 'animate-spin' : ''} />
                                <span>Warentransfer freigeben & Smart Contract starten</span>
                              </button>
                            </div>
                          ) : (
                            <div className="ai-recommendation-box" style={{ background: 'rgba(149, 191, 71, 0.03)', borderColor: 'rgba(149, 191, 71, 0.2)' }}>
                              <div className="ai-header" style={{ color: 'var(--shopify-green-dark)' }}>
                                <CheckCircle2 size={14} style={{ color: 'var(--shopify-green-dark)' }} />
                                <span>Lagerbestände Optimiert</span>
                              </div>
                              <p className="ai-body" style={{ fontSize: '0.85rem' }}>
                                Es liegen aktuell keine weiteren Optimierungsvorschläge vor. Der Bestand im Gotec Club ist durch den Smart Contract-Transfer abgesichert.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* POS Simulator */}
                      <div className={`panel ${isScanning ? 'scan-flash' : ''}`} style={{ background: '#fff', border: '1px solid #e1e3e5' }}>
                        <div className="panel-header" style={{ borderBottom: '1px solid #f1f2f4' }}>
                          <h2 className="panel-title" style={{ fontSize: '0.95rem' }}>
                            <ShoppingCart size={16} />
                            <span>Kassen-Simulator (Synchronisiertes POS)</span>
                          </h2>
                        </div>
                        <div className="panel-content">
                          <div className="pos-grid">
                            <div className="pos-store-selector">
                              <button 
                                className={`pos-btn ${posStore === 'gotec' ? 'active club' : ''}`}
                                onClick={() => setPosStore('gotec')}
                              >
                                Gotec Club POS
                              </button>
                              <button 
                                className={`pos-btn ${posStore === 'spaeti' ? 'active' : ''}`}
                                onClick={() => setPosStore('spaeti')}
                              >
                                Lamey Späti POS
                              </button>
                            </div>

                            <div className="pos-items">
                              {/* Item: Bier */}
                              <div className="pos-item-row">
                                <div className="pos-item-info">
                                  <span className="pos-item-name">Bier (Local Brand)</span>
                                  <span className="pos-item-price">Preis: €3.50</span>
                                </div>
                                <div className="pos-item-actions">
                                  <button className="qty-btn" onClick={() => adjustQty('bier', -1)}>-</button>
                                  <span className="qty-num">{posBasket.bier}</span>
                                  <button className="qty-btn" onClick={() => adjustQty('bier', 1)}>+</button>
                                </div>
                              </div>

                              {/* Item: Cola */}
                              <div className="pos-item-row">
                                <div className="pos-item-info">
                                  <span className="pos-item-name">Fritz Cola</span>
                                  <span className="pos-item-price">Preis: €3.00</span>
                                </div>
                                <div className="pos-item-actions">
                                  <button className="qty-btn" onClick={() => adjustQty('cola', -1)}>-</button>
                                  <span className="qty-num">{posBasket.cola}</span>
                                  <button className="qty-btn" onClick={() => adjustQty('cola', 1)}>+</button>
                                </div>
                              </div>

                              {/* Item: Mate */}
                              <div className="pos-item-row">
                                <div className="pos-item-info">
                                  <span className="pos-item-name">Club-Mate</span>
                                  <span className="pos-item-price">Preis: €3.50</span>
                                </div>
                                <div className="pos-item-actions">
                                  <button className="qty-btn" onClick={() => adjustQty('mate', -1)}>-</button>
                                  <span className="qty-num">{posBasket.mate}</span>
                                  <button className="qty-btn" onClick={() => adjustQty('mate', 1)}>+</button>
                                </div>
                              </div>
                            </div>

                            <button 
                              className="pos-sell-btn"
                              onClick={handlePOSCheckout}
                              disabled={posBasket.bier === 0 && posBasket.cola === 0 && posBasket.mate === 0}
                            >
                              <QrCode size={16} />
                              <span>Scanner (€{((posBasket.bier * 3.50) + (posBasket.cola * 3.00) + (posBasket.mate * 3.50)).toFixed(2)})</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Blockchain Smart Contract Ledger */}
                      <div 
                        className="panel" 
                        style={{ cursor: 'pointer', background: '#fff', border: '1px solid #e1e3e5' }}
                        onClick={() => setShowExplorer(true)}
                      >
                        <div className="panel-header" style={{ borderBottom: '1px solid #f1f2f4' }}>
                          <h2 className="panel-title" style={{ color: 'var(--neon-purple)', fontSize: '0.95rem' }}>
                            <Layers size={16} style={{ color: 'var(--neon-purple)' }} />
                            <span>Blockchain Tracker</span>
                          </h2>
                          <span className="logo-badge" style={{ borderColor: 'var(--neon-purple)', color: 'var(--neon-purple)', background: 'var(--neon-purple-glow)', fontSize: '0.65rem' }}>
                            Explorer öffnen
                          </span>
                        </div>
                        <div className="panel-content">
                          <div className="ledger-container">
                            {ledger.map(entry => (
                              <div 
                                key={entry.id} 
                                className={`ledger-row ${entry.type}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBlockId(entry.id);
                                  setShowExplorer(true);
                                }}
                              >
                                <div className="ledger-meta">
                                  <span className="ledger-time">{entry.time}</span>
                                  <span className="ledger-hash">{entry.hash}</span>
                                </div>
                                <strong>{entry.title}</strong>
                                <span className="ledger-text">{entry.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                    </aside>

                  </div>

                  {/* KPIs Bottom Grid */}
                  <footer className="kpi-row" style={{ marginTop: '0.5rem' }}>
                    
                    {/* KPI 1 */}
                    <div className="kpi-card" style={{ background: '#fff', border: '1px solid #e1e3e5' }}>
                      <div className="kpi-icon-wrapper">
                        <Coins size={22} />
                      </div>
                      <div className="kpi-info">
                        <span className="kpi-label">Kapitalbindung Reduziert</span>
                        <span className="kpi-value" style={{ color: 'var(--shopify-green-dark)' }}>-42.5 %</span>
                      </div>
                    </div>

                    {/* KPI 2 */}
                    <div className="kpi-card" style={{ background: '#fff', border: '1px solid #e1e3e5' }}>
                      <div className="kpi-icon-wrapper" style={{ borderColor: 'rgba(8, 145, 178, 0.25)', color: 'var(--neon-cyan)', background: 'rgba(8, 145, 178, 0.05)' }}>
                        <Activity size={22} />
                      </div>
                      <div className="kpi-info">
                        <span className="kpi-label">CO₂-Einsparung (Kurier)</span>
                        <span className="kpi-value" style={{ color: 'var(--neon-cyan)' }}>84.2 kg</span>
                      </div>
                    </div>

                    {/* KPI 3 */}
                    <div className="kpi-card" style={{ background: '#fff', border: '1px solid #e1e3e5' }}>
                      <div className="kpi-icon-wrapper" style={{ borderColor: 'rgba(124, 58, 237, 0.25)', color: 'var(--neon-purple)', background: 'rgba(124, 58, 237, 0.05)' }}>
                        <Shield size={22} />
                      </div>
                      <div className="kpi-info">
                        <span className="kpi-label">Bestandsverlust</span>
                        <span className="kpi-value" style={{ color: 'var(--neon-purple)' }}>0.00 %</span>
                      </div>
                    </div>

                    {/* KPI 4 */}
                    <div className="kpi-card" style={{ background: '#fff', border: '1px solid #e1e3e5' }}>
                      <div className="kpi-icon-wrapper" style={{ borderColor: 'rgba(234, 88, 12, 0.25)', color: 'var(--neon-orange)', background: 'rgba(234, 88, 12, 0.05)' }}>
                        <TrendingUp size={22} />
                      </div>
                      <div className="kpi-info">
                        <span className="kpi-label">Umsatzplus durch Umlagerung</span>
                        <span className="kpi-value" style={{ color: 'var(--neon-orange)' }}>+18.4 %</span>
                      </div>
                    </div>

                  </footer>

                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* Blockchain Explorer Modal Overlay */}
      {showExplorer && (
        <div className="blockchain-explorer-overlay" onClick={() => setShowExplorer(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '1100px' }}>
            <BlockchainExplorer 
              ledger={ledger}
              selectedBlockId={selectedBlockId}
              setSelectedBlockId={setSelectedBlockId}
              getBlockPayload={getBlockPayload}
              onClose={() => setShowExplorer(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
