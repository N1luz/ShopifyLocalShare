# Vortragsleitfaden & Pitch-Skript: Shopify LocalShare (Shared Inventory)

Dieses Dokument dient als roter Faden für euren Vortrag. Es erklärt das Problem, die technische Funktionsweise, das Geschäftsmodell (Finanzierung/Umsatzströme) und führt euch Schritt für Schritt durch eine packende Live-Demo mit eurem Klickdummy.

---

## 📌 1. Die Story & Das Problem (Der Einstieg)

**Ziel**: Den Zuhörern klarmachen, warum dieses System existieren muss.

*   **Der Status Quo**: E-Commerce boomt, aber kleine Online-Händler (D2C) haben extreme Nachteile gegenüber Amazon. Kunden wollen ihre Ware *jetzt* (Instant Gratification), aber Expressversand aus zentralen Lagern ist teuer und umweltschädlich. Gleichzeitig sterben lokale Läden (Spätis, Kioske, Boutiquen) aus, weil ihnen der Online-Umsatz fehlt.
*   **Die Idee: Shopify LocalShare**: Wir verknüpfen Onlineshops mit der ungenutzten Lagerfläche lokaler Geschäfte. Aus isolierten Einzelhändlern wird ein **dezentrales, kooperatives Shared Inventory Netzwerk**.
*   **Warum das Sinn macht (Die KPIs)**:
    1.  **-42.5 % Kapitalbindung**: Händler müssen nicht tonnenweise Ware vorfinanzieren und lagern; sie teilen sich das Risiko.
    2.  **Umsatzplus durch Umlagerung**: Keine leeren Regale mehr bei Events (z. B. Techno-Event im Gotec Club).
    3.  **CO₂-Einsparung & Nachhaltigkeit**: Transportwege verkürzen sich auf wenige hundert Meter, durchgeführt von emissionsfreien Fahrradkurieren im urbanen Raum.

---

## 🛠️ 2. Das System (Die 3 Säulen)

Erklärt hier die Kernkomponenten des Systems anhand eurer Folien:

1.  **Die Schnittstelle vor Ort (POS - Folie 1)**:
    *   Jedes Partnersystem nutzt die **Shopify POS-App** auf einem Tablet/iPad. 
    *   Sobald ein Artikel physisch gescannt und verkauft wird, zieht Shopify das Produkt *in Echtzeit* aus dem Online-Bestand ab. Der Kunde im Onlineshop sieht sofort: "Nur noch 2 Stück vor Ort verfügbar".
2.  **Die KI-Bedarfsanalyse (Logistik - Folie 2)**:
    *   Eine Heuristik/KI überwacht die Verkäufe an den POS-Terminals und verknüpft sie mit externen Daten (z. B. Wetterberichte, Events, Wochenenden).
    *   *Beispiel*: Samstagabend steht ein Event im Gotec Club an. Die KI prognostiziert einen Getränke-Peak. Sie erkennt einen Überschuss beim Lameyplatz Späti und initiiert per Fahrradkurier eine Umlagerung.
    *   **Der Sicherheitsbestand (Safety Stock)**: Damit der Späti bei einer Umlagerung nicht selbst leerläuft, greift ein eiserner Sicherheitsbestand (z. B. verbleiben 50 Flaschen Cola immer vor Ort).
3.  **Das Blockchain Ledger (Vertrauen - Folie 2)**:
    *   Wenn Händler A die Ware von Händler B verkauft, braucht es eine manipulationssichere Abrechnung.
    *   Jeder Scan und Warentransfer erzeugt eine verschlüsselte Blockchain-Transaktion (im Prototyp visualisiert im *Ledger Explorer*). Smart Contracts regeln die finanzielle Aufteilung automatisch in Sekundenschnelle.

---

## 💸 3. Das Geschäftsmodell (Umsatz & Finanzierung)

*Die entscheidende Frage im Vortrag: „Woher kommt das Geld und wer bezahlt was?“*

Das System finanziert sich über ein **dreistufiges Split-Payment (Smart Contracts)**, das bei jedem POS-Scan in Echtzeit greift.

### Die Einnahmen-Verteilung (Revenue Split)
Wenn ein Kunde ein Produkt (z. B. Fritz Cola für €3,00) an der Kasse kauft, teilt der Smart Contract die Einnahmen sofort auf:
1.  **70 % - Der D2C-Onlinehändler (Warenbesitzer)**:
    *   Erhält den Löwenanteil des Geldes, da ihm die Ware gehört.
    *   *Vorteil*: Er spart sich teure eigene Lagerhallen und Versandkartons in Großstädten.
2.  **20 % - Der Ladenbesitzer vor Ort (Flächen- & Kioskbesitzer)**:
    *   Erhält 20% Provision dafür, dass er die Ware in seinem Regal ausstellt und den Kassiervorgang abwickelt.
    *   *Vorteil*: Passive Einnahmen durch ungenutzte Regalfläche + mehr Kundschaft im Laden (Cross-Selling).
3.  **10 % - Shopify Systemgebühr (Netzwerkgebühr)**:
    *   Shopify behält 10% für das Bereitstellen der APIs, der Kassensoftware und des Ledger-Transaktionsnetzwerks.

### Wie wird die Logistik finanziert?
*   **Fahrradkurier-Gebühr**: Pro Umlagerungsfahrt fällt eine feste Systemgebühr an (z. B. **€4,50**). Diese Gebühr wird automatisch vom Empfänger-Laden getragen, da dieser durch den wiederaufgefüllten Bestand massiven Zusatzumsatz generiert, den er sonst verloren hätte.

---

## 💻 4. Technologie-Stack (Das technische Fundament)

Erklärt kurz, mit welchen modernen Web-Technologien ihr diesen Klickdummy gebaut habt:
*   **Framework & Build Tool**: React.js mit Vite (ermöglicht extrem schnelle Ladezeiten und modulare Komponenten-Struktur).
*   **Styling & Design System**: 
    *   Echtes **Shopify Admin Design (Polaris)** nachempfunden (Seitennavigation, Status-Pills, minimalistische Karten, Shopify-Grün `#95BF47` als Akzent).
    *   Verpackt in ein edles **macOS Browser Mockup**, um den Klickdummy wie eine echte Software-Präsentation wirken zu lassen.
*   **Karten-Visualisierung**: **Leaflet.js** (eine Open-Source-Bibliothek für interaktive Karten) mit Custom SVG-Vektorgrafiken als Live-Marker, die sich bei Bestandsänderungen in Echtzeit einfärben.
*   **Audio-Synthesizer**: Nutzung der Web Audio API des Browsers, um beim POS-Scan direkt ein authentisches Kassen-Beepen zu erzeugen (keine externen MP3-Dateien nötig).

---

## 🎬 5. Schritt-für-Schritt Vortrags-Demo (Der Wow-Effekt)

Folgt diesem Ablauf bei der Live-Präsentation des Klickdummys, um die Interaktivität optimal zu demonstrieren:

### Teil 1: Die physische Kasse vor Ort (Folie 1)
1.  Startet auf **Folie 1**. Erklärt das Boutique-Kassenbild und scrollt nach unten.
2.  Das Video beginnt **automatisch im Loop** zu laufen. Erklärt: *"Hier sehen Sie unser Konzeptvideo, das zeigt, wie die Ware im Laden präsentiert wird."*
3.  Scrollt weiter zum **Stock Take Segment** und zeigt das Handy-Scanbild. Erklärt: *"Jeder Scan bucht die Ware direkt aus dem Backend aus."*
4.  Klickt oben im Header auf **"Folie 2: Live-Netzwerk"**.

### Teil 2: Das Live-Netzwerk & Rebalancing (Folie 2)
1.  **Ausgangslage**: Zeigt die Karte von Karlsruhe. Gotec Club (oben) hat fast keine Getränke mehr (Bier: 12, Cola: 8). Der Späti am Lameyplatz hat volle Lager.
2.  **Die KI warnt**: Zeigt rechts oben auf die Kachel **KI-Bedarfsanalyse**. Es wird ein Engpass prognostiziert.
3.  **Warentransfer starten**: Klickt auf den blauen Button *"Warentransfer freigeben & Smart Contract starten"*.
4.  **Die Live-Animation**:
    *   Der Ledger-Tracker unten rechts loggt sofort: *"Smart Contract unterzeichnet"*.
    *   Auf der Karte erscheint ein **Fahrradkurier-Icon** und fährt live die Route vom Späti zum Gotec Club ab.
    *   Der Ledger loggt die Zwischenstationen.
5.  **Das Eintreffen (Sicherheitsbestand)**:
    *   Sobald der Kurier ankommt, springen die Bestände um.
    *   **Wichtig**: Weist darauf hin, dass der Späti nicht auf 0 sinkt! Er behält einen Sicherheitsbestand von **50 Cola** im Lager.
6.  **Der Kassen-Simulator**:
    *   Wählt im Simulator *"Gotec Club POS"*.
    *   Fügt 2x Bier hinzu und klickt auf *"Scanner bestätigen"*.
    *   Es ertönt ein **Kassen-Beep** und der Bestand des Gotec Clubs auf der Karte verringert sich sofort live.
7.  **Der Blockchain-Explorer (Das Finale)**:
    *   Klickt rechts unten auf den *Blockchain Tracker* (oder auf den neuesten POS-Verkaufseintrag).
    *   Das edle **Shopify Ledger Explorer Modal** öffnet sich.
    *   Klickt durch die Blöcke. Zeigt die JSON-Details rechts und erklärt links die visuelle Node-Verbindung: *"Hier sehen Sie genau, wie die 3,00 € der Fritz Cola sekundenschnell per Smart Contract aufgeteilt wurden – 70% an den D2C-Händler, 20% an den Club vor Ort und 10% an Shopify."*
8.  Schließt das Modal und beendet den Pitch.
