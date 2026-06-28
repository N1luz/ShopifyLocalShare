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

function RestockForm({ spaetiStock, setSpaetiStock, gotecStock, setGotecStock, addLedgerEntry }) {
  const [store, setStore] = useState('spaeti');
  const [product, setProduct] = useState('bier');
  const [qty, setQty] = useState(100);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const storeLabel = store === 'gotec' ? 'Café Ostwind' : 'Kiosk 67';
    const prodLabel = product === 'bier' ? 'Ostwind Kaffee' : product === 'cola' ? 'Fritz-Cola' : product === 'mate' ? 'Club-Mate' : 'Bio Nuss-Mix';
    
    if (store === 'gotec') {
      setGotecStock(prev => ({ ...prev, [product]: prev[product] + qty }));
    } else {
      setSpaetiStock(prev => ({ ...prev, [product]: prev[product] + qty }));
    }

    addLedgerEntry(
      `Lieferung erhalten (${storeLabel})`,
      `Smart Procurement: +${qty}x ${prodLabel} erfolgreich bestellt und bei ${storeLabel} im Bestand eingebucht.`,
      'contract'
    );

    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Ziel-Store wählen:</label>
        <select value={store} onChange={(e) => setStore(e.target.value)} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #e1e3e5', fontSize: '0.85rem' }}>
          <option value="spaeti">Kiosk 67 (Ali Yilmaz)</option>
          <option value="gotec">Café Ostwind (Marc Weber)</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Produkt wählen:</label>
        <select value={product} onChange={(e) => setProduct(e.target.value)} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #e1e3e5', fontSize: '0.85rem' }}>
          <option value="bier">Ostwind Kaffee</option>
          <option value="cola">Fritz-Cola</option>
          <option value="mate">Club-Mate</option>
          <option value="snacks">Bio Nuss-Mix</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Bestellmenge:</label>
        <input 
          type="number" 
          value={qty} 
          onChange={(e) => setQty(parseInt(e.target.value) || 0)} 
          style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #e1e3e5', fontSize: '0.85rem' }}
        />
      </div>

      <button 
        type="submit" 
        className="pos-sell-btn"
        style={{ width: '100%', marginTop: '0.5rem', border: 'none', cursor: 'pointer' }}
      >
        Bestellung absenden & Bestand buchen
      </button>

      {success && (
        <span style={{ color: 'var(--shopify-green-dark)', fontSize: '0.8rem', fontWeight: 600, textAlign: 'center', display: 'block', marginTop: '0.5rem' }}>
          ✓ Bestellung erfolgreich verbucht!
        </span>
      )}
    </form>
  );
}

function App() {
  // Navigation: Shopify Admin mock tabs ('overview', 'pos', 'inventory', 'analytics', 'smartstore', 'procurement', 'network')
  const [activeAdminTab, setActiveAdminTab] = useState('overview');
  const [showExplorer, setShowExplorer] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState(null);

  const [scrollY, setScrollY] = useState(0);
  const showcaseContainerRef = useRef(null);
  const [timelineProgress, setTimelineProgress] = useState(0);
  const [nodesActive, setNodesActive] = useState({ n1: false, n2: false, n3: false });

  // Force scroll to top on mount so the landing page experience is consistent
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      if (showcaseContainerRef.current) {
        const rect = showcaseContainerRef.current.getBoundingClientRect();
        const containerHeight = rect.height;
        const viewportHeight = window.innerHeight;
        
        // Start filling line when top of container reaches 75% of viewport height
        const startOffset = viewportHeight * 0.75;
        const currentPos = startOffset - rect.top;
        
        // Map scroll distance to 0-100% of the timeline line (cap height to Node 3 center)
        const progress = Math.max(0, Math.min(100, (currentPos / (containerHeight - 160)) * 100));
        setTimelineProgress(progress);
        
        setNodesActive({
          n1: rect.top < viewportHeight * 0.8,
          n2: rect.top < viewportHeight * 0.45,
          n3: rect.top < viewportHeight * 0.15
        });
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Intersection Observer for slide-in reveals (guarded for safety)
    let observer;
    let elements = [];
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
          }
        });
      }, { threshold: 0.15 });

      elements = document.querySelectorAll('.reveal-element');
      elements.forEach((el) => observer.observe(el));
    } else {
      // Fallback for environments without IntersectionObserver support (instantly activate reveal elements)
      const fallbackElements = document.querySelectorAll('.reveal-element');
      fallbackElements.forEach((el) => el.classList.add('reveal-active'));
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (observer) {
        elements.forEach((el) => observer.unobserve(el));
      }
    };
  }, [activeAdminTab]);

  // Inventory stocks (bier internally represents Kaffee)
  const [spaetiStock, setSpaetiStock] = useState({ bier: 240, cola: 180, mate: 95, snacks: 60 });
  const [gotecStock, setGotecStock] = useState({ bier: 12, cola: 8, mate: 24, snacks: 15 });
  
  // Ledger (Blockchain tracker logs)
  const [ledger, setLedger] = useState([
    { id: 1, type: 'contract', title: 'Genesis-Block erstellt', text: 'Shopify LocalShare Smart Contract initialisiert.', time: 'Vor 10 Min.', hash: '0x0000000000000000' },
    { id: 2, type: 'contract', title: 'Knotenpunkt registriert', text: 'Kiosk 67 (Ali Yilmaz) erfolgreich in Blockchain eingebunden.', time: 'Vor 9 Min.', hash: '0x8f2a1b9e...3c5d' },
    { id: 3, type: 'contract', title: 'Knotenpunkt registriert', text: 'Café Ostwind (Marc Weber) POS Terminal synchronisiert.', time: 'Vor 8 Min.', hash: '0x5c7b3d1f...9a2e' },
    { id: 4, type: 'sale', title: 'Synchronisation Aktiv', text: 'Echtzeit-Verbindung mit Shopify Central Inventory (O2O) steht.', time: 'Vor 5 Min.', hash: '0x4e9a8b1c...2f5d' }
  ]);

  // POS State
  const [posStore, setPosStore] = useState('spaeti'); // 'spaeti' (Kiosk 67) or 'gotec' (Café Ostwind)
  const [posBasket, setPosBasket] = useState({ bier: 0, cola: 0, mate: 0, snacks: 0 });
  const [isScanning, setIsScanning] = useState(false);
  
  // Courier / Rebalancing animation state
  const [courierStatus, setCourierStatus] = useState('idle'); // 'idle', 'dispatching', 'delivering', 'arrived'
  const [courierProgress, setCourierProgress] = useState(0);
  const [transferTriggered, setTransferTriggered] = useState(false);
  
  // Smart Store State (Dynamic price adjustments)
  const [customPrices, setCustomPrices] = useState({ bier: 2.50, cola: 3.00, mate: 3.50, snacks: 1.80 });
  const [dynamicPricingActive, setDynamicPricingActive] = useState(false);
  const [glowProduct, setGlowProduct] = useState(null);
  
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
            from: "Kiosk 67 (Node #1)",
            to: "Café Ostwind (Node #2)"
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
          originPOS: entry.text.includes("Café Ostwind") ? "Café Ostwind Register #1" : "Kiosk 67 Register #1",
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
    if (activeAdminTab === 'overview' && !mapRef.current && mapContainerRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [49.0146, 8.3565], // Center between Kiosk 67 and Cafe Ostwind
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
  }, [activeAdminTab]);

  // Update Markers when stock values change
  useEffect(() => {
    if (activeAdminTab !== 'overview' || !mapRef.current) return;

    // Kiosk 67 HTML marker
    const spaetiIconHtml = `
      <div class="map-marker-container">
        <div class="map-marker-badge ${spaetiStock.bier < 50 ? 'low' : ''}">
          ☕ ${spaetiStock.bier} | 🥤 ${spaetiStock.cola} | 🧉 ${spaetiStock.mate}
        </div>
        <div class="map-marker-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-store"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
        </div>
        <div class="map-marker-label">Kiosk 67 (Ali)</div>
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
      }).addTo(mapRef.current)
        .bindPopup(`
          <div style="text-align: center; margin: 0; padding: 0; font-family: var(--font-sans);">
            <img src="/kiosk67.jpg" alt="Kiosk 67" style="width: 240px; height: auto; border-radius: 12px 12px 0 0; display: block;" />
            <div style="padding: 10px 12px; font-weight: 700; font-size: 0.9rem; color: #1a1a1a; text-align: left; background: #fff; border-radius: 0 0 12px 12px;">🏪 Kiosk 67 (Ali Yilmaz)</div>
          </div>
        `, {
          className: 'custom-map-popup',
          offset: [0, -35]
        });
    }

    // Café Ostwind HTML marker
    const gotecIconHtml = `
      <div class="map-marker-container">
        <div class="map-marker-badge ${gotecStock.bier < 30 ? 'low' : ''}">
          ☕ ${gotecStock.bier} | 🥤 ${gotecStock.cola} | 🧉 ${gotecStock.mate}
        </div>
        <div class="map-marker-icon club">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-music"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        </div>
        <div class="map-marker-label">Café Ostwind (Marc)</div>
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
  }, [gotecStock, spaetiStock, activeAdminTab]);

  // Handle Courier movement on Map
  useEffect(() => {
    if (activeAdminTab !== 'overview' || !mapRef.current) return;
    
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
  }, [courierProgress, courierStatus, activeAdminTab]);

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
          'Fahrradkurier #12 auf dem Weg zu Kiosk 67.',
          'transfer'
        );
      }
      if (progress >= 0.5 && !milestone2) {
        milestone2 = true;
        addLedgerEntry(
          'Ware geladen & QR gescannt',
          'Umlagerung gestartet: 120 Kaffee & 130 Cola (50 Cola Sicherheitsbestand verbleiben bei Kiosk 67). Eigentum an Treuhand übertragen.',
          'transfer'
        );
      }
      if (progress >= 0.8 && !milestone3) {
        milestone3 = true;
        addLedgerEntry(
          'Kurier passiert Rheinhafenstraße',
          'GPS-Ortung aktiv. Kurier nähert sich Café Ostwind.',
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
          bier: prev.bier - 120, // bier internally represents Kaffee
          cola: prev.cola - 130, // 50 Cola safety stock stays at Kiosk 67
          mate: prev.mate
        }));
        
        setGotecStock(prev => ({
          bier: prev.bier + 120,
          cola: prev.cola + 130,
          mate: prev.mate
        }));
        
        addLedgerEntry(
          'Warentransfer abgeschlossen',
          'Lieferung bei Café Ostwind eingetroffen. Kasse & Shopify-Backend synchronisiert. Smart Contract ausgeführt.',
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
  const [lastSplitDetail, setLastSplitDetail] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const handlePOSCheckout = () => {
    const currentStoreStock = posStore === 'gotec' ? gotecStock : spaetiStock;
    const storeLabel = posStore === 'gotec' ? 'Café Ostwind' : 'Kiosk 67';
    
    // Check if basket is empty
    const totalItems = posBasket.bier + posBasket.cola + posBasket.mate + posBasket.snacks;
    if (totalItems === 0) return;
    
    // Check if enough stock
    if (
      posBasket.bier > currentStoreStock.bier ||
      posBasket.cola > currentStoreStock.cola ||
      posBasket.mate > currentStoreStock.mate ||
      posBasket.snacks > currentStoreStock.snacks
    ) {
      alert('Nicht genügend Lagerbestand im Store!');
      return;
    }
    
    // POS scan sound & flash animation
    playScanBeep();
    setIsScanning(true);
    
    setTimeout(() => {
      setIsScanning(false);
      
      // Calculate prices & revenue split based on ESL customPrices state
      const totalRevenue = (posBasket.bier * customPrices.bier) + 
                           (posBasket.cola * customPrices.cola) + 
                           (posBasket.mate * customPrices.mate) +
                           (posBasket.snacks * customPrices.snacks);
      const merchantCut = (totalRevenue * 0.70).toFixed(2);
      const storeCut = (totalRevenue * 0.20).toFixed(2);
      const shopifyFee = (totalRevenue * 0.10).toFixed(2);

      // Deduct stock from the active store
      if (posStore === 'gotec') {
        setGotecStock(prev => ({
          bier: prev.bier - posBasket.bier,
          cola: prev.cola - posBasket.cola,
          mate: prev.mate - posBasket.mate,
          snacks: prev.snacks - posBasket.snacks
        }));
      } else {
        setSpaetiStock(prev => ({
          bier: prev.bier - posBasket.bier,
          cola: prev.cola - posBasket.cola,
          mate: prev.mate - posBasket.mate,
          snacks: prev.snacks - posBasket.snacks
        }));
      }

      // Add ledger entry for sale
      addLedgerEntry(
        `POS Verkauf (${storeLabel}): €${totalRevenue.toFixed(2)}`,
        `Kassenschnitt: ${posBasket.bier > 0 ? `${posBasket.bier}x Kaffee, ` : ''}${posBasket.cola > 0 ? `${posBasket.cola}x Fritz-Cola, ` : ''}${posBasket.mate > 0 ? `${posBasket.mate}x Mate, ` : ''}${posBasket.snacks > 0 ? `${posBasket.snacks}x Snacks` : ''}. Smart Contract Split: Händler D2C (€${merchantCut}), ${storeLabel} (€${storeCut}), Shopify-Gebühr (€${shopifyFee}).`,
        'pos'
      );

      // Show temporary receipt split details
      setLastSplitDetail({
        total: totalRevenue,
        merchant: merchantCut,
        store: storeCut,
        fee: shopifyFee,
        storeName: storeLabel
      });
      setShowReceiptModal(true);

      // Reset Basket
      setPosBasket({ bier: 0, cola: 0, mate: 0, snacks: 0 });
    }, 1200);
  };

  return (
    <div className="app-wrapper" style={{ background: '#f8fafc', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      
      {/* Hero Intro Section */}
      <div className="hero-section" style={{
        opacity: Math.max(0, 1 - scrollY / 600),
        transform: `translateY(${scrollY * 0.2}px)`,
        pointerEvents: scrollY > 500 ? 'none' : 'auto',
        transition: 'opacity 0.1s linear, transform 0.1s linear'
      }}>
        <div className="hero-glow-green"></div>
        <div className="hero-glow-blue"></div>
        
        <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '2rem', textAlign: 'center', animation: 'hero-entrance 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
          <img 
            src="/logo.png" 
            alt="Shopify LocalShare" 
            style={{ 
              width: '420px', 
              maxWidth: '90%', 
              height: 'auto', 
              filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.06))',
              background: '#fff',
              padding: '1.5rem 2rem',
              borderRadius: '24px',
              border: '1px solid rgba(0,0,0,0.03)'
            }} 
          />
          <div style={{ marginTop: '0.5rem' }}>
            <span className="logo-badge" style={{ fontSize: '0.85rem', padding: '6px 14px', background: 'rgba(149, 191, 71, 0.1)', color: 'var(--shopify-green-dark)' }}>
              Interaktiver Klickdummy
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.6', margin: '0.5rem 0 0 0', fontWeight: '500' }}>
            Dezentrale Warenwirtschaft & Smart Contracts im lokalen Shopify-Händlernetzwerk.
          </p>
        </div>

        <div className="scroll-indicator" style={{
          opacity: Math.max(0, 1 - scrollY / 150),
          transition: 'opacity 0.3s ease'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Nach unten scrollen
          </span>
          <div className="mouse-icon">
            <div className="wheel"></div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div 
        className="dashboard-container" 
        style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          width: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.5rem', 
          padding: '1rem',
          opacity: Math.min(1, scrollY / 400),
          transform: scrollY > 400 ? 'none' : `translateY(${Math.max(0, 50 - (scrollY / 400) * 50)}px)`,
          transition: 'opacity 0.1s linear, transform 0.1s linear'
        }}
      >
        
        {/* Persistent Header */}
        <header 
          className="dashboard-header" 
          style={{ 
            opacity: scrollY > 250 ? 1 : 0,
            pointerEvents: scrollY > 250 ? 'auto' : 'none',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
            transform: scrollY > 250 ? 'translateY(0)' : 'translateY(-10px)'
          }}
        >
          <div className="logo-section">
            <img src="/logo.png" alt="Shopify Logo" style={{ height: '36px', width: 'auto', marginRight: '0.25rem' }} />
            <span className="logo-text" style={{ background: 'none', WebkitTextFillColor: 'initial', color: 'var(--text-primary)' }}>Shopify LocalShare</span>
            <span className="logo-badge">Interaktiver Klickdummy</span>
          </div>
          
          {/* Reset Button */}
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--card-bg)',
              color: 'var(--text-primary)',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <RefreshCw size={14} style={{ color: 'var(--shopify-green-dark)' }} />
            <span>Simulation zurücksetzen</span>
          </button>
        </header>

      {/* Assumptions Box based on Slide 1 */}
      <div className="panel" style={{ padding: '2.5rem', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', textAlign: 'left' }}>
        <span className="logo-badge" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>Geschäftsmodellinnovation</span>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.5rem', letterSpacing: '-0.5px' }}>
          Wie kann Shopify den stationären Handel integrieren?
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginTop: '0.5rem' }}>
          {/* Annahme 1 */}
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--shopify-green-dark)', fontWeight: '700', fontSize: '0.9rem' }}>
              <span style={{ display: 'inline-flex', padding: '4px', background: 'rgba(149, 191, 71, 0.1)', borderRadius: '6px' }}>⚖️</span>
              <span>Annahme 1</span>
            </div>
            <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Zulässiger Datenaustausch</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
              Der DSGVO-konforme Datenaustausch zwischen Händlern ist zulässig und erfolgt verschlüsselt über Blockchain-basierte Smart Contracts.
            </p>
          </div>

          {/* Annahme 2 */}
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--neon-purple)', fontWeight: '700', fontSize: '0.9rem' }}>
              <span style={{ display: 'inline-flex', padding: '4px', background: 'rgba(124, 58, 237, 0.1)', borderRadius: '6px' }}>🪙</span>
              <span>Annahme 2</span>
            </div>
            <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Akzeptierte Digitalwährungen</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
              Digitale Währungen sind im Einzelhandel etabliert und ermöglichen sekundenschnelle und automatisierte Payout-Splits bei jedem POS-Scan.
            </p>
          </div>

          {/* Annahme 3 */}
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--neon-cyan)', fontWeight: '700', fontSize: '0.9rem' }}>
              <span style={{ display: 'inline-flex', padding: '4px', background: 'rgba(8, 145, 178, 0.1)', borderRadius: '6px' }}>🚲</span>
              <span>Annahme 3</span>
            </div>
            <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Flächendeckende Lastenräder</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
              Fahrradkuriere stehen flächendeckend zur Verfügung, um Waren innerhalb von 15-30 Minuten CO₂-neutral zwischen den Stores umzulagern.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', animation: 'fade-in 0.3s ease-out' }}>
        
        {/* Explanation Header for Shared Inventory */}
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
          
          {/* Alternating Showcase Rows with Timeline */}
          <div style={{ position: 'relative', display: 'flex', gap: '2rem' }}>
            
            {/* Timeline sidebar */}
            <div className="showcase-timeline-wrapper" style={{ position: 'relative', width: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div className="timeline-line-bg"></div>
              <div className="timeline-line-fill" style={{ height: `${timelineProgress}%` }}></div>
              
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', width: '100%', position: 'absolute', top: 0, bottom: 0, padding: '36px 0' }}>
                <div className={`timeline-node ${nodesActive.n1 ? 'active' : ''}`}>1</div>
                <div className={`timeline-node ${nodesActive.n2 ? 'active' : ''}`}>2</div>
                <div className={`timeline-node ${nodesActive.n3 ? 'active' : ''}`}>3</div>
              </div>
            </div>

            <div className="showcase-container" ref={showcaseContainerRef} style={{ flex: 1 }}>
              
              {/* Row 1: Dezentrale Präsenz */}
              <div className="showcase-row">
                <div className="showcase-image-wrapper reveal-element reveal-left">
                  <img src="/folie2-bild1.jpg" alt="Dezentrale Präsenz" />
                </div>
                <div className="showcase-content reveal-element reveal-right">
                  <div className="showcase-tag" style={{ background: 'rgba(149, 191, 71, 0.1)', color: 'var(--shopify-green-dark)' }}>
                    <Store size={14} />
                    <span>Präsenz</span>
                  </div>
                  <h3 className="showcase-title">1. Dezentrale Präsenz</h3>
                  <p className="showcase-description">
                    Produktausstellung und Verkauf direkt vor Ort im lokalen Partnershop. Kunden können D2C-Produkte physisch erleben und direkt über das Shopify POS-Terminal erwerben. Dies ermöglicht Marken einen kosteneffizienten physischen Auftritt ohne eigenes Ladenlokal.
                  </p>
                </div>
              </div>

              {/* Row 2: Flexibler Kurier-Transfer */}
              <div className="showcase-row">
                <div className="showcase-image-wrapper reveal-element reveal-right">
                  <img src="/folie2-bild2.jpg" alt="Flexibler Kurier-Transfer" />
                </div>
                <div className="showcase-content reveal-element reveal-left">
                  <div className="showcase-tag" style={{ background: 'rgba(8, 145, 178, 0.1)', color: 'var(--neon-cyan)' }}>
                    <Activity size={14} />
                    <span>Logistik</span>
                  </div>
                  <h3 className="showcase-title">2. Flexibler Kurier-Transfer</h3>
                  <p className="showcase-description">
                    Schnelle und bedarfsorientierte Umlagerung per Lastenrad zwischen den beteiligten Stores. Sobald Bestände an einem Ort knapp werden, stößt das System automatisch Umlagerungen an, die von lokalen Kurieren CO2-neutral ausgeführt werden.
                  </p>
                </div>
              </div>

              {/* Row 3: Blockchain Smart Split */}
              <div className="showcase-row">
                <div className="showcase-image-wrapper reveal-element reveal-left">
                  <img src="/folie2-bild3.png" alt="Blockchain Smart Split" />
                </div>
                <div className="showcase-content reveal-element reveal-right">
                  <div className="showcase-tag" style={{ background: 'rgba(124, 58, 237, 0.1)', color: 'var(--neon-purple)' }}>
                    <Coins size={14} />
                    <span>Finanzen</span>
                  </div>
                  <h3 className="showcase-title">3. Blockchain Smart Split</h3>
                  <p className="showcase-description">
                    Automatisierte Transaktionen und sofortige Payout-Splits via Smart Contracts. Bei jedem Verkauf teilt das System die Einnahmen in Echtzeit transparent zwischen dem Markenhersteller (D2C), dem ausstellenden Händler und dem Kurier auf.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

          {/* macOS Browser Mockup window */}
          <div className="mac-mockup-window reveal-element reveal-up-tilt">
            {/* macOS Titlebar */}
            <div className="mac-titlebar">
              <div className="mac-dots">
                <div className="mac-dot close"></div>
                <div className="mac-dot minimize"></div>
                <div className="mac-dot maximize"></div>
              </div>
              <div className="mac-address-bar">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span>admin.shopify.com/store/kiosk-67/shared-inventory</span>
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
                  <button 
                    className={`shopify-nav-item ${activeAdminTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveAdminTab('overview')}
                    style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <Navigation size={16} />
                    <span>Zentrale Übersicht</span>
                  </button>
                  <button 
                    className={`shopify-nav-item ${activeAdminTab === 'pos' ? 'active' : ''}`}
                    onClick={() => setActiveAdminTab('pos')}
                    style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <ShoppingCart size={16} />
                    <span>POS Kassensystem</span>
                  </button>
                  <button 
                    className={`shopify-nav-item ${activeAdminTab === 'inventory' ? 'active' : ''}`}
                    onClick={() => setActiveAdminTab('inventory')}
                    style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <Activity size={16} />
                    <span>Warenwirtschaft</span>
                  </button>
                  <button 
                    className={`shopify-nav-item ${activeAdminTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveAdminTab('analytics')}
                    style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <TrendingUp size={16} />
                    <span>Analytics Dashboard</span>
                  </button>
                  <button 
                    className={`shopify-nav-item ${activeAdminTab === 'smartstore' ? 'active' : ''}`}
                    onClick={() => setActiveAdminTab('smartstore')}
                    style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <QrCode size={16} />
                    <span>Smart Store (ESL)</span>
                  </button>
                  <button 
                    className={`shopify-nav-item ${activeAdminTab === 'procurement' ? 'active' : ''}`}
                    onClick={() => setActiveAdminTab('procurement')}
                    style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <Layers size={16} />
                    <span>Smart Procurement</span>
                  </button>
                  <button 
                    className={`shopify-nav-item ${activeAdminTab === 'network' ? 'active' : ''}`}
                    onClick={() => setActiveAdminTab('network')}
                    style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <Store size={16} />
                    <span>Händlernetzwerk</span>
                  </button>
                </nav>
                <div style={{ padding: '0.75rem', background: '#f1f2f4', borderRadius: '8px', fontSize: '0.75rem', color: '#666', textAlign: 'left' }}>
                  <strong>Store:</strong> Kiosk 67 (Ali)
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
                      <span>Kiosk 67 (Ali Yilmaz)</span>
                      <div className="shopify-avatar">A</div>
                    </div>
                  </div>
                </div>

                {/* Actual Dashboard Content Area */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* Header title in Shopify Admin Style */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ textAlign: 'left' }}>
                      <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>
                        {activeAdminTab === 'overview' && 'Zentrale Übersicht & Map'}
                        {activeAdminTab === 'pos' && 'POS Kassensystem (Kiosk 67)'}
                        {activeAdminTab === 'inventory' && 'Shared Inventory Warenwirtschaft'}
                        {activeAdminTab === 'analytics' && 'Analytics Dashboard'}
                        {activeAdminTab === 'smartstore' && 'Smart Store & Elektronische Preisschilder (ESL)'}
                        {activeAdminTab === 'procurement' && 'Smart Procurement & Wareneinkauf'}
                        {activeAdminTab === 'network' && 'Händlernetzwerk Karlsruhe'}
                      </h1>
                      <p style={{ fontSize: '0.85rem', color: '#666', margin: '0.25rem 0 0 0' }}>
                        {activeAdminTab === 'overview' && 'KI-gestütztes Peer-to-Peer Warentransfernetzwerk und Blockchain-Ledger.'}
                        {activeAdminTab === 'pos' && 'Echtes Kiosk-Verkaufsterminal. Scanvorgänge lösen Smart-Split-Auszahlungen in Echtzeit aus.'}
                        {activeAdminTab === 'inventory' && 'Bestände von Kiosk 67, Partnern und Kuriere auf einen Blick.'}
                        {activeAdminTab === 'analytics' && 'Fortschritt, Bestseller und KPIs des geteilten Sortiments.'}
                        {activeAdminTab === 'smartstore' && 'Steuerung digitaler Preisschilder und Sensorüberwachung.'}
                        {activeAdminTab === 'procurement' && 'Direkte Nachbestellungen bei Lieferanten für automatische Bestandszubuchung.'}
                        {activeAdminTab === 'network' && 'Profile und Smart-Contract-Rollen der teilnehmenden Karlsruher Einzelhändler.'}
                      </p>
                    </div>
                    <div className="status-pills">
                      <div className="status-pill" style={{ background: '#fff' }}>
                        <span className="status-indicator purple"></span>
                        <span>Ledger: SECURED</span>
                      </div>
                    </div>
                  </div>

                  {/* TAB 1: Zentrale Übersicht */}
                  {activeAdminTab === 'overview' && (
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

                      {/* Right Sidebar: AI recommendation, Blockchain ledger */}
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
                                  <strong>Bedarfs-Peak erkannt:</strong> Café Ostwind veranstaltet Samstag eine Techno-Nacht. Aktueller Getränkebestand deckt ca. 1.5 Stunden.
                                </p>
                                <p className="ai-body" style={{ fontSize: '0.85rem' }}>
                                  <strong>Lagerüberschuss gefunden:</strong> Kiosk 67 hat 240 Kaffee und 180 Cola im Lager (50 Cola Sicherheitsbestand verbleiben vor Ort).
                                </p>
                                <div className="ai-route-detail" style={{ fontSize: '0.75rem' }}>
                                  Umlagerung: 120 Kaffee, 130 Cola<br/>
                                  Distanz: ~850m | Transport: Fahrradkurier
                                </div>
                                <button 
                                  className="btn-cyan" 
                                  onClick={handleTriggerRebalance}
                                  disabled={courierStatus !== 'idle'}
                                  style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', width: '100%' }}
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
                                  Es liegen aktuell keine weiteren Optimierungsvorschläge vor. Der Bestand im Café Ostwind ist durch den Smart Contract-Transfer abgesichert.
                                </p>
                              </div>
                            )}
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
                  )}

                  {/* TAB 2: POS Kassensystem */}
                  {activeAdminTab === 'pos' && (
                    <div className="pos-fullscreen-panel" style={{ background: '#fff', border: '1px solid #e1e3e5', borderRadius: '12px', padding: '1.5rem', display: 'grid', gridTemplateColumns: '1.4fr 1.1fr 1fr', gap: '1.5rem' }}>
                      {/* Left Side: Product Grid */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Produktauswahl</h3>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              onClick={() => setPosStore('spaeti')} 
                              className={`pos-btn ${posStore === 'spaeti' ? 'active' : ''}`}
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            >
                              🏪 Kiosk 67 POS
                            </button>
                            <button 
                              onClick={() => setPosStore('gotec')} 
                              className={`pos-btn ${posStore === 'gotec' ? 'active club' : ''}`}
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            >
                              ☕ Café Ostwind POS
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          {/* Item Kaffee */}
                          <div className="pos-item-card" style={{ border: '1px solid #e1e3e5', padding: '1.25rem', borderRadius: '12px', display: 'flex', gap: '1rem', alignItems: 'center', background: '#f8fafc' }}>
                            <div style={{ fontSize: '2.5rem' }}>☕</div>
                            <div style={{ flexGrow: 1, textAlign: 'left' }}>
                              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Ostwind Kaffee</h4>
                              <p style={{ margin: '0.2rem 0', fontSize: '0.75rem', color: '#666' }}>Lager: {posStore === 'gotec' ? gotecStock.bier : spaetiStock.bier} Stk.</p>
                              <strong style={{ fontSize: '1rem', color: 'var(--shopify-green-dark)' }}>€{customPrices.bier.toFixed(2)}</strong>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <button className="qty-btn" onClick={() => adjustQty('bier', 1)}>+</button>
                              <span className="qty-num">{posBasket.bier}</span>
                              <button className="qty-btn" onClick={() => adjustQty('bier', -1)}>-</button>
                            </div>
                          </div>

                          {/* Item Fritz Cola */}
                          <div className="pos-item-card" style={{ border: '1px solid #e1e3e5', padding: '1.25rem', borderRadius: '12px', display: 'flex', gap: '1rem', alignItems: 'center', background: '#f8fafc' }}>
                            <div style={{ fontSize: '2.5rem' }}>🥤</div>
                            <div style={{ flexGrow: 1, textAlign: 'left' }}>
                              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Fritz-Cola</h4>
                              <p style={{ margin: '0.2rem 0', fontSize: '0.75rem', color: '#666' }}>Lager: {posStore === 'gotec' ? gotecStock.cola : spaetiStock.cola} Stk.</p>
                              <strong style={{ fontSize: '1rem', color: 'var(--shopify-green-dark)' }}>€{customPrices.cola.toFixed(2)}</strong>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <button className="qty-btn" onClick={() => adjustQty('cola', 1)}>+</button>
                              <span className="qty-num">{posBasket.cola}</span>
                              <button className="qty-btn" onClick={() => adjustQty('cola', -1)}>-</button>
                            </div>
                          </div>

                          {/* Item Club Mate */}
                          <div className="pos-item-card" style={{ border: '1px solid #e1e3e5', padding: '1.25rem', borderRadius: '12px', display: 'flex', gap: '1rem', alignItems: 'center', background: '#f8fafc' }}>
                            <div style={{ fontSize: '2.5rem' }}>🧉</div>
                            <div style={{ flexGrow: 1, textAlign: 'left' }}>
                              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Club-Mate</h4>
                              <p style={{ margin: '0.2rem 0', fontSize: '0.75rem', color: '#666' }}>Lager: {posStore === 'gotec' ? gotecStock.mate : spaetiStock.mate} Stk.</p>
                              <strong style={{ fontSize: '1rem', color: 'var(--shopify-green-dark)' }}>€{customPrices.mate.toFixed(2)}</strong>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <button className="qty-btn" onClick={() => adjustQty('mate', 1)}>+</button>
                              <span className="qty-num">{posBasket.mate}</span>
                              <button className="qty-btn" onClick={() => adjustQty('mate', -1)}>-</button>
                            </div>
                          </div>

                          {/* Item Snacks */}
                          <div className="pos-item-card" style={{ border: '1px solid #e1e3e5', padding: '1.25rem', borderRadius: '12px', display: 'flex', gap: '1rem', alignItems: 'center', background: '#f8fafc' }}>
                            <div style={{ fontSize: '2.5rem' }}>🥜</div>
                            <div style={{ flexGrow: 1, textAlign: 'left' }}>
                              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Bio Nuss-Mix</h4>
                              <p style={{ margin: '0.2rem 0', fontSize: '0.75rem', color: '#666' }}>Lager: {posStore === 'gotec' ? gotecStock.snacks : spaetiStock.snacks} Stk.</p>
                              <strong style={{ fontSize: '1rem', color: 'var(--shopify-green-dark)' }}>€{customPrices.snacks.toFixed(2)}</strong>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <button className="qty-btn" onClick={() => adjustQty('snacks', 1)}>+</button>
                              <span className="qty-num">{posBasket.snacks}</span>
                              <button className="qty-btn" onClick={() => adjustQty('snacks', -1)}>-</button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Middle Side: Scanner Feed (Video) */}
                      <div style={{ borderLeft: '1px solid #e1e3e5', paddingLeft: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="pos-video-container">
                          <video 
                            src="/Folie1.mp4" 
                            autoPlay 
                            loop 
                            muted 
                            playsInline
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      </div>

                      {/* Right Side: Cart Summary */}
                      <div style={{ borderLeft: '1px solid #e1e3e5', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'left' }}>
                        <div>
                          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: 600 }}>Warenkorb</h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: '150px' }}>
                            {posBasket.bier === 0 && posBasket.cola === 0 && posBasket.mate === 0 && posBasket.snacks === 0 && (
                              <p style={{ color: '#999', fontSize: '0.85rem', margin: 0 }}>Warenkorb ist leer.</p>
                            )}
                            {posBasket.bier > 0 && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span>{posBasket.bier}x Ostwind Kaffee</span>
                                <strong>€{(posBasket.bier * customPrices.bier).toFixed(2)}</strong>
                              </div>
                            )}
                            {posBasket.cola > 0 && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span>{posBasket.cola}x Fritz-Cola</span>
                                <strong>€{(posBasket.cola * customPrices.cola).toFixed(2)}</strong>
                              </div>
                            )}
                            {posBasket.mate > 0 && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span>{posBasket.mate}x Club-Mate</span>
                                <strong>€{(posBasket.mate * customPrices.mate).toFixed(2)}</strong>
                              </div>
                            )}
                            {posBasket.snacks > 0 && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span>{posBasket.snacks}x Bio Nuss-Mix</span>
                                <strong>€{(posBasket.snacks * customPrices.snacks).toFixed(2)}</strong>
                              </div>
                            )}
                          </div>
                          
                          <div style={{ borderTop: '1px solid #f1f2f4', paddingTop: '1rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666' }}>
                              <span>Zwischensumme:</span>
                              <span>€{((posBasket.bier * customPrices.bier) + (posBasket.cola * customPrices.cola) + (posBasket.mate * customPrices.mate) + (posBasket.snacks * customPrices.snacks)).toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666' }}>
                              <span>inkl. 19% MwSt:</span>
                              <span>€{(((posBasket.bier * customPrices.bier) + (posBasket.cola * customPrices.cola) + (posBasket.mate * customPrices.mate) + (posBasket.snacks * customPrices.snacks)) * 0.19).toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800, borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                              <span>Gesamtsumme:</span>
                              <span style={{ color: 'var(--shopify-green-dark)' }}>€{((posBasket.bier * customPrices.bier) + (posBasket.cola * customPrices.cola) + (posBasket.mate * customPrices.mate) + (posBasket.snacks * customPrices.snacks)).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        <button 
                          className="pos-sell-btn"
                          onClick={handlePOSCheckout}
                          disabled={posBasket.bier === 0 && posBasket.cola === 0 && posBasket.mate === 0 && posBasket.snacks === 0}
                          style={{ width: '100%', marginTop: '2rem' }}
                        >
                          <QrCode size={16} />
                          <span>Zahlung & Payout Split ausführen</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Warenwirtschaft & Shared Inventory */}
                  {activeAdminTab === 'inventory' && (
                    <div className="panel" style={{ background: '#fff', border: '1px solid #e1e3e5', borderRadius: '12px', padding: '1.5rem', textAlign: 'left' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Echtzeit-Lagerbestände</h3>
                      
                      <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid #e1e3e5', background: '#f8fafc' }}>
                              <th style={{ padding: '10px', textAlign: 'left' }}>Händler / Standort</th>
                              <th style={{ padding: '10px', textAlign: 'center' }}>Ostwind Kaffee</th>
                              <th style={{ padding: '10px', textAlign: 'center' }}>Fritz-Cola</th>
                              <th style={{ padding: '10px', textAlign: 'center' }}>Club-Mate</th>
                              <th style={{ padding: '10px', textAlign: 'center' }}>Bio Nuss-Mix</th>
                              <th style={{ padding: '10px', textAlign: 'right' }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{ borderBottom: '1px solid #f1f2f4' }}>
                              <td style={{ padding: '12px 10px', fontWeight: 600 }}>Kiosk 67 (Ali Yilmaz)</td>
                              <td style={{ padding: '12px 10px', textAlign: 'center' }}>{spaetiStock.bier}</td>
                              <td style={{ padding: '12px 10px', textAlign: 'center', position: 'relative' }}>
                                {spaetiStock.cola}
                                <span className="logo-badge" style={{ fontSize: '0.65rem', padding: '1px 4px', background: 'rgba(149,191,71,0.08)', borderColor: 'var(--shopify-green)', color: 'var(--shopify-green-dark)', display: 'block', margin: '4px auto 0 auto', width: 'fit-content' }}>
                                  Safety Stock (50)
                                </span>
                              </td>
                              <td style={{ padding: '12px 10px', textAlign: 'center' }}>{spaetiStock.mate}</td>
                              <td style={{ padding: '12px 10px', textAlign: 'center' }}>{spaetiStock.snacks}</td>
                              <td style={{ padding: '12px 10px', textAlign: 'right', color: 'var(--shopify-green-dark)', fontWeight: 600 }}>Optimal</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #f1f2f4' }}>
                              <td style={{ padding: '12px 10px', fontWeight: 600 }}>Café Ostwind (Marc Weber)</td>
                              <td style={{ padding: '12px 10px', textAlign: 'center' }}>{gotecStock.bier}</td>
                              <td style={{ padding: '12px 10px', textAlign: 'center', color: gotecStock.cola < 20 ? 'red' : 'inherit' }}>
                                {gotecStock.cola}
                                {gotecStock.cola < 20 && (
                                  <span className="logo-badge" style={{ fontSize: '0.65rem', padding: '1px 4px', background: 'rgba(239,68,68,0.08)', borderColor: 'red', color: 'red', display: 'block', margin: '4px auto 0 auto', width: 'fit-content' }}>
                                    Kritisch
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '12px 10px', textAlign: 'center' }}>{gotecStock.mate}</td>
                              <td style={{ padding: '12px 10px', textAlign: 'center' }}>{gotecStock.snacks}</td>
                              <td style={{ padding: '12px 10px', textAlign: 'right', color: gotecStock.cola < 20 ? 'var(--neon-orange)' : 'var(--shopify-green-dark)', fontWeight: 600 }}>
                                {gotecStock.cola < 20 ? 'Kritischer Stand' : 'Optimal'}
                              </td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #f1f2f4' }}>
                              <td style={{ padding: '12px 10px', fontWeight: 600 }}>Bio-Markt Becker (Sandra Becker)</td>
                              <td style={{ padding: '12px 10px', textAlign: 'center', color: '#666' }}>15</td>
                              <td style={{ padding: '12px 10px', textAlign: 'center', color: '#666' }}>62</td>
                              <td style={{ padding: '12px 10px', textAlign: 'center', color: '#666' }}>80</td>
                              <td style={{ padding: '12px 10px', textAlign: 'center', color: '#666' }}>110</td>
                              <td style={{ padding: '12px 10px', textAlign: 'right', color: '#666' }}>Static Node</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div style={{ marginTop: '2rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.03)' }}>
                        <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Kurier & Logistik Tracker</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', fontSize: '0.8rem' }}>
                          <div style={{ borderRight: '1px solid #e1e3e5', paddingRight: '1.5rem' }}>
                            <div style={{ marginBottom: '0.5rem' }}><strong>Status:</strong> {courierStatus === 'idle' ? 'Bereit' : 'Umlagerung läuft'}</div>
                            <div style={{ marginBottom: '0.5rem' }}><strong>Aktivität:</strong> {courierStatus === 'idle' ? 'Kuriere warten auf KI-Freigabe' : `Rebalancing Kiosk 67 -> Café Ostwind (${Math.round(courierProgress * 100)}%)`}</div>
                            <div><strong>Kurier-ID:</strong> BikeCourier_Karlsruhe_12 (Lastenrad)</div>
                          </div>
                          <div>
                            <strong style={{ display: 'block', marginBottom: '0.4rem' }}>Regeln für Shared Inventory:</strong>
                            <ul style={{ paddingLeft: '1rem', margin: 0, lineHeight: '1.4', color: 'var(--text-secondary)' }}>
                              <li>Fritz-Cola Sicherheitsbestand (50 Stk.) verbleibt permanent im Herkunfts-Store.</li>
                              <li>Automatischer Transfer triggerbar sobald KI-Prognose einen Bedarfsengpass anzeigt.</li>
                              <li>Logistikabrechnung über dezentralen Smart Contract bei Ablieferung.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: Analytics Dashboard */}
                  {activeAdminTab === 'analytics' && (
                    <div className="analytics-panel" style={{ background: '#fff', border: '1px solid #e1e3e5', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                      {/* Stats cards */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
                        <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.03)' }}>
                          <span style={{ fontSize: '0.75rem', color: '#666', fontWeight: 600, display: 'block' }}>Gemeinsamer Umsatz</span>
                          <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--shopify-green-dark)', display: 'block', margin: '0.2rem 0' }}>€1.482,50</span>
                          <span style={{ fontSize: '0.7rem', color: 'green' }}>↑ 18.4% im Vergleich zum Einzellager</span>
                        </div>
                        <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.03)' }}>
                          <span style={{ fontSize: '0.75rem', color: '#666', fontWeight: 600, display: 'block' }}>Gezahlte Store-Provisionen (20%)</span>
                          <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--neon-purple)', display: 'block', margin: '0.2rem 0' }}>€296,50</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Verteilt an Kiosk 67 und Partner</span>
                        </div>
                        <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.03)' }}>
                          <span style={{ fontSize: '0.75rem', color: '#666', fontWeight: 600, display: 'block' }}>Vermeidbare Regalleerstände</span>
                          <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--neon-cyan)', display: 'block', margin: '0.2rem 0' }}>24 Verkäufe</span>
                          <span style={{ fontSize: '0.7rem', color: 'green' }}>Durch Real-Time Kurier-Rebalancing</span>
                        </div>
                      </div>

                      {/* Chart area */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
                        {/* SVG Chart */}
                        <div style={{ border: '1px solid #e1e3e5', padding: '1.25rem', borderRadius: '12px' }}>
                          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', fontWeight: 700 }}>Umsatzkurve Shared Inventory (Wochenverlauf)</h4>
                          <div style={{ height: '160px', width: '100%', position: 'relative' }}>
                            <svg viewBox="0 0 500 150" width="100%" height="150" style={{ overflow: 'visible' }}>
                              <defs>
                                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="var(--shopify-green)" stopOpacity="0.4"/>
                                  <stop offset="100%" stopColor="var(--shopify-green)" stopOpacity="0.0"/>
                                </linearGradient>
                              </defs>
                              <path d="M 0 130 Q 80 115 160 95 T 320 65 T 480 20 L 480 150 L 0 150 Z" fill="url(#chartGrad)" />
                              <path d="M 0 130 Q 80 115 160 95 T 320 65 T 480 20" fill="none" stroke="var(--shopify-green-dark)" strokeWidth="3" />
                              {/* Gridlines */}
                              <line x1="0" y1="130" x2="500" y2="130" stroke="rgba(0,0,0,0.06)" />
                              <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(0,0,0,0.06)" />
                              <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(0,0,0,0.06)" />
                              {/* Text Labels */}
                              <text x="10" y="145" fill="var(--text-muted)" fontSize="10">Tag 1</text>
                              <text x="160" y="145" fill="var(--text-muted)" fontSize="10">Tag 3</text>
                              <text x="320" y="145" fill="var(--text-muted)" fontSize="10">Tag 5</text>
                              <text x="450" y="145" fill="var(--text-muted)" fontSize="10">Heute</text>
                            </svg>
                          </div>
                        </div>

                        {/* Top Bestsellers */}
                        <div style={{ border: '1px solid #e1e3e5', padding: '1.25rem', borderRadius: '12px' }}>
                          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', fontWeight: 700 }}>Produkt-Verteilung</h4>
                          
                          {/* Item 1 */}
                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                              <span>Fritz-Cola</span>
                              <span>182 Stk.</span>
                            </div>
                            <div style={{ height: '8px', background: '#f1f2f4', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: '85%', height: '100%', background: 'var(--shopify-green)', borderRadius: '4px' }}></div>
                            </div>
                          </div>

                          {/* Item 2 */}
                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                              <span>Club-Mate</span>
                              <span>144 Stk.</span>
                            </div>
                            <div style={{ height: '8px', background: '#f1f2f4', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: '68%', height: '100%', background: 'var(--neon-purple)', borderRadius: '4px' }}></div>
                            </div>
                          </div>

                          {/* Item 3 */}
                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                              <span>Ostwind Kaffee</span>
                              <span>96 Stk.</span>
                            </div>
                            <div style={{ height: '8px', background: '#f1f2f4', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: '45%', height: '100%', background: 'var(--neon-cyan)', borderRadius: '4px' }}></div>
                            </div>
                          </div>

                          {/* Item 4 */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                              <span>Bio Nuss-Mix</span>
                              <span>74 Stk.</span>
                            </div>
                            <div style={{ height: '8px', background: '#f1f2f4', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: '35%', height: '100%', background: 'var(--neon-orange)', borderRadius: '4px' }}></div>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: Smart Store & Elektronische Preisschilder (ESL) */}
                  {activeAdminTab === 'smartstore' && (
                    <div className="smart-store-panel" style={{ background: '#fff', border: '1px solid #e1e3e5', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
                        
                        {/* Price Managers */}
                        <div style={{ borderRight: '1px solid #e1e3e5', paddingRight: '1.5rem' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Preiskontrolle & ESL-Synchronisierung</h3>
                          <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1.5rem' }}>
                            Verändere die Verkaufspreise. Über das IoT-Netzwerk aktualisiert das System die elektronischen Shelf Labels (ESL) am Verkaufsregal sowie die POS-Kassensysteme gleichzeitig.
                          </p>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Price Kaffee */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <span style={{ fontSize: '1.2rem', width: '24px' }}>☕</span>
                              <span style={{ fontSize: '0.85rem', width: '120px', fontWeight: 600 }}>Ostwind Kaffee:</span>
                              <input 
                                type="range" 
                                min="1.50" 
                                max="4.50" 
                                step="0.10"
                                value={customPrices.bier}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  setCustomPrices(prev => ({ ...prev, bier: val }));
                                  setGlowProduct('bier');
                                  setTimeout(() => setGlowProduct(null), 1200);
                                }}
                                style={{ flexGrow: 1 }}
                              />
                              <strong style={{ fontSize: '0.9rem', width: '50px', textAlign: 'right' }}>€{customPrices.bier.toFixed(2)}</strong>
                            </div>

                            {/* Price Fritz Cola */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <span style={{ fontSize: '1.2rem', width: '24px' }}>🥤</span>
                              <span style={{ fontSize: '0.85rem', width: '120px', fontWeight: 600 }}>Fritz-Cola:</span>
                              <input 
                                type="range" 
                                min="2.00" 
                                max="5.00" 
                                step="0.10"
                                value={customPrices.cola}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  setCustomPrices(prev => ({ ...prev, cola: val }));
                                  setGlowProduct('cola');
                                  setTimeout(() => setGlowProduct(null), 1200);
                                }}
                                style={{ flexGrow: 1 }}
                              />
                              <strong style={{ fontSize: '0.9rem', width: '50px', textAlign: 'right' }}>€{customPrices.cola.toFixed(2)}</strong>
                            </div>

                            {/* Price Club Mate */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <span style={{ fontSize: '1.2rem', width: '24px' }}>🧉</span>
                              <span style={{ fontSize: '0.85rem', width: '120px', fontWeight: 600 }}>Club-Mate:</span>
                              <input 
                                type="range" 
                                min="2.50" 
                                max="5.50" 
                                step="0.10"
                                value={customPrices.mate}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  setCustomPrices(prev => ({ ...prev, mate: val }));
                                  setGlowProduct('mate');
                                  setTimeout(() => setGlowProduct(null), 1200);
                                }}
                                style={{ flexGrow: 1 }}
                              />
                              <strong style={{ fontSize: '0.9rem', width: '50px', textAlign: 'right' }}>€{customPrices.mate.toFixed(2)}</strong>
                            </div>

                            {/* Price Snacks */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <span style={{ fontSize: '1.2rem', width: '24px' }}>🥜</span>
                              <span style={{ fontSize: '0.85rem', width: '120px', fontWeight: 600 }}>Bio Nuss-Mix:</span>
                              <input 
                                type="range" 
                                min="1.00" 
                                max="3.50" 
                                step="0.10"
                                value={customPrices.snacks}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  setCustomPrices(prev => ({ ...prev, snacks: val }));
                                  setGlowProduct('snacks');
                                  setTimeout(() => setGlowProduct(null), 1200);
                                }}
                                style={{ flexGrow: 1 }}
                              />
                              <strong style={{ fontSize: '0.9rem', width: '50px', textAlign: 'right' }}>€{customPrices.snacks.toFixed(2)}</strong>
                            </div>
                          </div>
                        </div>

                        {/* ESL Displays View */}
                        <div style={{ paddingLeft: '0.5rem' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0' }}>IoT Regalanzeige (ESL-Labels)</h3>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {/* ESL Kaffee */}
                            <div 
                              className={`esl-card ${glowProduct === 'bier' ? 'esl-glow-active' : ''}`}
                              style={{ border: '2px solid #333', padding: '0.75rem', background: '#fff', borderRadius: '6px', fontFamily: 'var(--font-mono)', position: 'relative' }}
                            >
                              <div style={{ fontSize: '0.65rem', borderBottom: '1px solid #ccc', paddingBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
                                <span>ESL-081</span>
                                <span style={{ color: 'green' }}>● Synced</span>
                              </div>
                              <h5 style={{ margin: '0.4rem 0', fontSize: '0.8rem', fontWeight: 700 }}>Ostwind Kaffee</h5>
                              <div style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0' }}>€{customPrices.bier.toFixed(2)}</div>
                              <div style={{ fontSize: '0.55rem', color: '#666', borderTop: '1px dashed #ccc', paddingTop: '4px' }}>
                                SCAN TO PAY / NFC ACTIVE
                              </div>
                            </div>

                            {/* ESL Fritz Cola */}
                            <div 
                              className={`esl-card ${glowProduct === 'cola' ? 'esl-glow-active' : ''}`}
                              style={{ border: '2px solid #333', padding: '0.75rem', background: '#fff', borderRadius: '6px', fontFamily: 'var(--font-mono)', position: 'relative' }}
                            >
                              <div style={{ fontSize: '0.65rem', borderBottom: '1px solid #ccc', paddingBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
                                <span>ESL-082</span>
                                <span style={{ color: 'green' }}>● Synced</span>
                              </div>
                              <h5 style={{ margin: '0.4rem 0', fontSize: '0.8rem', fontWeight: 700 }}>Fritz-Cola</h5>
                              <div style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0' }}>€{customPrices.cola.toFixed(2)}</div>
                              <div style={{ fontSize: '0.55rem', color: '#666', borderTop: '1px dashed #ccc', paddingTop: '4px' }}>
                                SCAN TO PAY / NFC ACTIVE
                              </div>
                            </div>

                            {/* ESL Club Mate */}
                            <div 
                              className={`esl-card ${glowProduct === 'mate' ? 'esl-glow-active' : ''}`}
                              style={{ border: '2px solid #333', padding: '0.75rem', background: '#fff', borderRadius: '6px', fontFamily: 'var(--font-mono)', position: 'relative' }}
                            >
                              <div style={{ fontSize: '0.65rem', borderBottom: '1px solid #ccc', paddingBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
                                <span>ESL-083</span>
                                <span style={{ color: 'green' }}>● Synced</span>
                              </div>
                              <h5 style={{ margin: '0.4rem 0', fontSize: '0.8rem', fontWeight: 700 }}>Club-Mate</h5>
                              <div style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0' }}>€{customPrices.mate.toFixed(2)}</div>
                              <div style={{ fontSize: '0.55rem', color: '#666', borderTop: '1px dashed #ccc', paddingTop: '4px' }}>
                                SCAN TO PAY / NFC ACTIVE
                              </div>
                            </div>

                            {/* ESL Snacks */}
                            <div 
                              className={`esl-card ${glowProduct === 'snacks' ? 'esl-glow-active' : ''}`}
                              style={{ border: '2px solid #333', padding: '0.75rem', background: '#fff', borderRadius: '6px', fontFamily: 'var(--font-mono)', position: 'relative' }}
                            >
                              <div style={{ fontSize: '0.65rem', borderBottom: '1px solid #ccc', paddingBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
                                <span>ESL-084</span>
                                <span style={{ color: 'green' }}>● Synced</span>
                              </div>
                              <h5 style={{ margin: '0.4rem 0', fontSize: '0.8rem', fontWeight: 700 }}>Bio Nuss-Mix</h5>
                              <div style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.2rem 0' }}>€{customPrices.snacks.toFixed(2)}</div>
                              <div style={{ fontSize: '0.55rem', color: '#666', borderTop: '1px dashed #ccc', paddingTop: '4px' }}>
                                SCAN TO PAY / NFC ACTIVE
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Shelf Sensors Simulator */}
                      <div style={{ borderTop: '1px solid #e1e3e5', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 700 }}>IoT Regalsensoren (Bestandsüberwachung per Gewicht)</h4>
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
                            <input 
                              type="checkbox" 
                              checked={dynamicPricingActive} 
                              onChange={(e) => {
                                setDynamicPricingActive(e.target.checked);
                                if (e.target.checked) {
                                  addLedgerEntry(
                                    'IoT Regalsensor ausgelöst',
                                    'Regal Kiosk 67 meldet leeren Bestand für Fritz-Cola (< 5 Flaschen). Automatischer Rebalancing-Prozess über Smart Contract freigeschaltet.',
                                    'contract'
                                  );
                                }
                              }}
                            />
                            <span>Simuliere leeres Regal bei Kiosk 67 (Gewichtssensor-Alarm auslösen)</span>
                          </label>
                        </div>
                        {dynamicPricingActive && (
                          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid red', padding: '1rem', borderRadius: '8px', color: 'red', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem' }}>
                            <AlertTriangle size={18} />
                            <div>
                              <strong>WARNUNG IoT-Sensor:</strong> Kiosk 67 Regal-Sektion "Fritz-Cola" meldet kritischen Füllstand. RFID & Gewichtsschranken unterschritten.
                              <br/>KI schlägt automatischen Ausgleich durch Café Ostwind vor.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 6: Smart Procurement & Wareneinkauf */}
                  {activeAdminTab === 'procurement' && (
                    <div className="procurement-panel" style={{ background: '#fff', border: '1px solid #e1e3e5', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
                        
                        {/* Supplier order form */}
                        <div>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Lieferanten-Schnittstelle (Restocking)</h3>
                          <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1.5rem' }}>
                            Löse direkte Bestellungen bei Großhändlern aus, um deine Kernlagerbestände aufzufüllen. Der Wareneingang wird bei Lieferung sofort verbucht und auf der Blockchain registriert.
                          </p>

                          {/* Interactive order form */}
                          <RestockForm 
                            spaetiStock={spaetiStock} 
                            setSpaetiStock={setSpaetiStock} 
                            gotecStock={gotecStock} 
                            setGotecStock={setGotecStock} 
                            addLedgerEntry={addLedgerEntry} 
                          />
                        </div>

                        {/* Suppliers Cards */}
                        <div style={{ borderLeft: '1px solid #e1e3e5', paddingLeft: '2rem' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Registrierte Lieferanten</h3>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Supplier 1 */}
                            <div style={{ padding: '1rem', border: '1px solid #e1e3e5', borderRadius: '8px', background: '#f8fafc', fontSize: '0.8rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: '0.2rem' }}>
                                <span>Fritz-Kola GmbH</span>
                                <span style={{ color: 'green' }}>Aktiv</span>
                              </div>
                              <div style={{ color: '#666' }}>Getränkegroßhändler, Hamburg</div>
                              <div style={{ marginTop: '0.4rem', fontSize: '0.75rem' }}>Lieferzeit: 1 Werktag | Liefergebühr: €0.00 (Vertragskunde)</div>
                            </div>

                            {/* Supplier 2 */}
                            <div style={{ padding: '1rem', border: '1px solid #e1e3e5', borderRadius: '8px', background: '#f8fafc', fontSize: '0.8rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: '0.2rem' }}>
                                <span>Ostwind Kaffeebohnen Co.</span>
                                <span style={{ color: 'green' }}>Aktiv</span>
                              </div>
                              <div style={{ color: '#666' }}>Privat-Rösterei, Karlsruhe</div>
                              <div style={{ marginTop: '0.4rem', fontSize: '0.75rem' }}>Lieferzeit: 2 Stunden | Liefergebühr: €5.00</div>
                            </div>

                            {/* Supplier 3 */}
                            <div style={{ padding: '1rem', border: '1px solid #e1e3e5', borderRadius: '8px', background: '#f8fafc', fontSize: '0.8rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: '0.2rem' }}>
                                <span>Loscher Club-Mate KG</span>
                                <span style={{ color: 'green' }}>Aktiv</span>
                              </div>
                              <div style={{ color: '#666' }}>Getränkeproduzent, Münchsteinach</div>
                              <div style={{ marginTop: '0.4rem', fontSize: '0.75rem' }}>Lieferzeit: 2 Werktage | Liefergebühr: €15.00</div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* TAB 7: Händlernetzwerk */}
                  {activeAdminTab === 'network' && (
                    <div className="network-panel" style={{ background: '#fff', border: '1px solid #e1e3e5', borderRadius: '12px', padding: '1.5rem', textAlign: 'left' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Teilnehmende Händler in Karlsruhe Oststadt</h3>
                      <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1.5rem' }}>
                        Übersicht aller verifizierten Händler, die an diesem dezentralen Shared Inventory Pool teilnehmen. Alle Abrechnungen und Bestandsfreigaben basieren auf dem gemeinsamen Smart Contract framework.
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
                        {/* Profile Ali */}
                        <div style={{ border: '1px solid #e1e3e5', padding: '1.25rem', borderRadius: '12px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '40px', height: '40px', background: 'var(--shopify-green)', borderRadius: '50%', display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '1.2rem', justifyContent: 'center' }}>👨‍💼</div>
                            <div>
                              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Ali Yilmaz</h4>
                              <span style={{ fontSize: '0.7rem', color: '#666' }}>Inhaber Kiosk 67</span>
                            </div>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px solid #e1e3e5', paddingTop: '0.5rem' }}>
                            <strong>Standort:</strong> Kaiserstraße 67, Karlsruhe
                            <br/><strong>Blockchain Node:</strong> Node-KA-K67
                            <br/><strong style={{ color: 'var(--shopify-green-dark)' }}>Rolle:</strong> Stellt Verkaufsfläche für D2C-Marken und lagert Getränkebestände bei Überbestand an Partner aus.
                          </div>
                        </div>

                        {/* Profile Marc */}
                        <div style={{ border: '1px solid #e1e3e5', padding: '1.25rem', borderRadius: '12px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '40px', height: '40px', background: 'var(--neon-purple-glow)', border: '1px solid var(--neon-purple)', borderRadius: '50%', display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '1.2rem', justifyContent: 'center' }}>☕</div>
                            <div>
                              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Marc Weber</h4>
                              <span style={{ fontSize: '0.7rem', color: '#666' }}>Inhaber Café Ostwind</span>
                            </div>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px solid #e1e3e5', paddingTop: '0.5rem' }}>
                            <strong>Standort:</strong> Ostendstraße 12, Karlsruhe
                            <br/><strong>Blockchain Node:</strong> Node-KA-COW
                            <br/><strong style={{ color: 'var(--neon-purple)' }}>Rolle:</strong> Bezieht kalte Getränke bedarfsgerecht vom Kiosk 67, um Lagerplatz für Kaffeebohnen frei zu halten.
                          </div>
                        </div>

                        {/* Profile Sandra */}
                        <div style={{ border: '1px solid #e1e3e5', padding: '1.25rem', borderRadius: '12px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '40px', height: '40px', background: 'var(--neon-cyan-glow)', border: '1px solid var(--neon-cyan)', borderRadius: '50%', display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '1.2rem', justifyContent: 'center' }}>🥑</div>
                            <div>
                              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Sandra Becker</h4>
                              <span style={{ fontSize: '0.7rem', color: '#666' }}>Inhaberin Bio-Markt Becker</span>
                            </div>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px solid #e1e3e5', paddingTop: '0.5rem' }}>
                            <strong>Standort:</strong> Ludwig-Wilhelm-Straße 4, Karlsruhe
                            <br/><strong>Blockchain Node:</strong> Node-KA-BMB
                            <br/><strong style={{ color: 'var(--neon-cyan)' }}>Rolle:</strong> Partner für Bio-Produkte, Nuss-Mixe und gesunde Snacks. Gleicht Engpässe für Kiosk 67 aus.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

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

          {/* POS Receipt Modal Overlay */}
          {showReceiptModal && lastSplitDetail && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
              backdropFilter: 'blur(4px)'
            }} onClick={() => setShowReceiptModal(false)}>
              <div style={{
                background: '#fff',
                padding: '2rem',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                maxWidth: '450px',
                width: '90%',
                textAlign: 'left',
                fontFamily: 'var(--font-mono)'
              }} onClick={(e) => e.stopPropagation()}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--shopify-green-dark)' }}>Zahlung erfolgreich!</h3>
                  <p style={{ margin: '0.2rem 0', fontSize: '0.75rem', color: '#666' }}>Smart Contract Split ausgeführt</p>
                </div>
                
                <div style={{ borderBottom: '1px dashed #ccc', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                    <span>Registrierkasse:</span>
                    <span>{lastSplitDetail.storeName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>Betrag:</span>
                    <strong>€{lastSplitDetail.total.toFixed(2)}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.2rem', color: 'var(--text-primary)' }}>Blockchain Real-Time Splits:</strong>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#333' }}>
                    <span>D2C-Brand Payout (70%):</span>
                    <strong>€{lastSplitDetail.merchant}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#333' }}>
                    <span>{lastSplitDetail.storeName} (20%):</span>
                    <strong>€{lastSplitDetail.store}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#333' }}>
                    <span>Shopify Platform fee (10%):</span>
                    <strong>€{lastSplitDetail.fee}</strong>
                  </div>
                </div>

                <button 
                  onClick={() => setShowReceiptModal(false)}
                  className="pos-sell-btn"
                  style={{ width: '100%', marginTop: '2rem', border: 'none', cursor: 'pointer' }}
                >
                  Schließen & Zurück
                </button>
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

      </div>

    </div>
  </div>
  );
}

export default App;
