"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import createGlobe from "cobe";
import cityTimezones from "city-timezones";

import { formatTimezone } from "@/lib/timezoneUtils";

const TIMEZONE_ALIASES: Record<string, string> = {
  "Asia/Saigon": "Asia/Ho_Chi_Minh",
  "Asia/Calcutta": "Asia/Kolkata",
  "Asia/Katmandu": "Asia/Kathmandu",
  "Europe/Kiev": "Europe/Kyiv",
  "Atlantic/Faeroe": "Atlantic/Faroe",
  "America/Indianapolis": "America/Indiana/Indianapolis",
  "America/Knox_IN": "America/Indiana/Knox",
  "America/Louisville": "America/Kentucky/Louisville",
  "America/Fort_Wayne": "America/Indiana/Indianapolis",
};

const TIMEZONE_COORDS: Record<string, [number, number]> = {
  "America/Anguilla": [18.22, -63.05],
  "America/Bahia_Banderas": [20.75, -105.25],
  "America/Catamarca": [-28.47, -65.78],
  "America/Ciudad_Juarez": [31.69, -106.42],
  "America/Cordoba": [-31.42, -64.19],
  "America/Coyhaique": [-45.57, -72.07],
  "America/Indiana/Knox": [41.28, -86.63],
  "America/Indiana/Marengo": [38.38, -86.34],
  "America/Indiana/Petersburg": [38.49, -87.28],
  "America/Indiana/Tell_City": [37.96, -86.76],
  "America/Indiana/Vevay": [38.75, -85.07],
  "America/Indiana/Vincennes": [38.68, -87.53],
  "America/Indiana/Winamac": [41.05, -86.60],
  "America/Jujuy": [-24.19, -65.30],
  "America/Kentucky/Monticello": [36.83, -84.85],
  "America/Kralendijk": [12.15, -68.27],
  "America/Lower_Princes": [18.05, -63.05],
  "America/Marigot": [18.07, -63.08],
  "America/Mendoza": [-32.89, -68.83],
  "America/Metlakatla": [55.13, -131.58],
  "America/Miquelon": [47.10, -56.38],
  "America/Montserrat": [16.70, -62.22],
  "America/Noronha": [-3.85, -32.42],
  "America/North_Dakota/Beulah": [47.26, -101.78],
  "America/North_Dakota/Center": [47.12, -101.30],
  "America/North_Dakota/New_Salem": [46.85, -101.42],
  "America/Punta_Arenas": [-53.16, -70.92],
  "America/Scoresbysund": [70.48, -21.97],
  "America/St_Barthelemy": [17.90, -62.85],
  "America/Swift_Current": [50.28, -107.79],
  "America/Tortola": [18.43, -64.62],
  "Antarctica/Casey": [-66.28, 110.52],
  "Antarctica/Davis": [-68.58, 77.97],
  "Antarctica/DumontDUrville": [-66.66, 140.00],
  "Antarctica/Macquarie": [-54.50, 158.95],
  "Antarctica/Mawson": [-67.60, 62.87],
  "Antarctica/McMurdo": [-77.85, 166.67],
  "Antarctica/Palmer": [-64.77, -64.05],
  "Antarctica/Rothera": [-67.57, -68.13],
  "Antarctica/Syowa": [-69.00, 39.58],
  "Antarctica/Troll": [-72.01, 2.53],
  "Antarctica/Vostok": [-78.40, 106.80],
  "Asia/Qostanay": [53.20, 63.63],
  "Atlantic/St_Helena": [-15.97, -5.72],
  "Australia/Eucla": [-31.68, 128.88],
  "Australia/Lindeman": [-20.27, 149.00],
  "Australia/Lord_Howe": [-31.55, 159.08],
  "Europe/Busingen": [47.70, 8.68],
  "Europe/Guernsey": [49.47, -2.58],
  "Europe/Jersey": [49.21, -2.13],
  "Europe/Monaco": [43.73, 7.42],
  "Europe/Vatican": [41.90, 12.45],
  "Indian/Chagos": [-7.30, 72.42],
  "Indian/Christmas": [-10.42, 105.68],
  "Indian/Cocos": [-12.19, 96.82],
  "Indian/Kerguelen": [-49.35, 70.25],
  "Pacific/Chatham": [-43.95, -176.55],
  "Pacific/Easter": [-27.15, -109.42],
  "Pacific/Enderbury": [-3.13, -171.08],
  "Pacific/Fakaofo": [-9.37, -171.22],
  "Pacific/Gambier": [-23.10, -134.97],
  "Pacific/Kiritimati": [1.87, -157.40],
  "Pacific/Kosrae": [5.32, 162.98],
  "Pacific/Kwajalein": [8.72, 167.73],
  "Pacific/Marquesas": [-9.78, -139.07],
  "Pacific/Midway": [28.21, -177.37],
  "Pacific/Nauru": [-0.52, 166.93],
  "Pacific/Niue": [-19.05, -169.87],
  "Pacific/Norfolk": [-29.03, 167.95],
  "Pacific/Pitcairn": [-25.07, -130.10],
  "Pacific/Ponape": [6.97, 158.22],
  "Pacific/Truk": [7.42, 151.78],
  "Pacific/Wake": [19.28, 166.65],
  "Pacific/Wallis": [-13.30, -176.20],
  "Africa/Asmera": [15.33, 38.93],
};

interface MarkerWithLabel {
  id: string;
  location: [number, number];
  size: number;
  label: string;
}

function getCoordsForTimezone(
  timezone: string,
): { lat: number; lng: number } | null {
  const resolved = TIMEZONE_ALIASES[timezone] || timezone;

  if (TIMEZONE_COORDS[resolved]) {
    const [lat, lng] = TIMEZONE_COORDS[resolved];
    return { lat, lng };
  }

  const cities = cityTimezones.cityMapping.filter(
    (c) => c.timezone === resolved,
  );
  if (cities.length === 0) return null;

  cities.sort((a, b) => b.pop - a.pop);
  return { lat: cities[0].lat, lng: cities[0].lng };
}

export function TimezoneGlobe({ timezoneList }: { timezoneList: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);
  const [markers, setMarkers] = useState<MarkerWithLabel[]>([]);
  const phiRef = useRef(0);
  const thetaRef = useRef(0.3);
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const autoRotateRef = useRef(true);

  useEffect(() => {
    const newMarkers: MarkerWithLabel[] = [];
    for (const tz of timezoneList) {
      const coords = getCoordsForTimezone(tz);
      if (coords) {
        const fmt = formatTimezone(tz);
        newMarkers.push({
          id: tz.replace(/\//g, "_"),
          location: [coords.lat, coords.lng],
          size: 0.05,
          label: fmt.main,
        });
      }
    }
    setMarkers(newMarkers);
  }, [timezoneList]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 400 * 2,
      height: 400 * 2,
      phi: phiRef.current,
      theta: thetaRef.current,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.85, 0.85, 0.9],
      markerColor: [0.2, 0.5, 1],
      glowColor: [0.7, 0.8, 1],
      markers: markers.map((m) => ({
        location: m.location,
        size: m.size,
        id: m.id,
      })),
    });

    globeRef.current = globe;

    function animate() {
      if (autoRotateRef.current && !isDragging.current) {
        phiRef.current += 0.0003;
      }
      globe.update({
        phi: phiRef.current,
        theta: thetaRef.current,
        markers: markers.map((m) => ({
          location: m.location,
          size: m.size,
          id: m.id,
        })),
      });
      requestAnimationFrame(animate);
    }
    animate();

    return () => {
      globe.destroy();
    };
  }, [markers]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    autoRotateRef.current = false;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    phiRef.current += dx * 0.005;
    thetaRef.current = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, thetaRef.current + dy * 0.005),
    );
    lastPointer.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    setTimeout(() => {
      autoRotateRef.current = true;
    }, 3000);
  };

  // Memoize label positions so they don't cause re-renders
  const labelElements = useMemo(
    () =>
      markers.map((m) => (
        <div
          key={m.id}
          className="globe-label"
          style={
            {
              positionAnchor: `--cobe-${m.id}`,
              opacity: `var(--cobe-visible-${m.id}, 0)`,
            } as React.CSSProperties
          }
        >
          {m.label}
        </div>
      )),
    [markers],
  );

  return (
    <div className="relative w-full aspect-square max-w-[400px] mx-auto">
      <canvas
        ref={canvasRef}
        className="w-full h-full touch-none cursor-grab active:cursor-grabbing"
        style={{ width: 400, height: 400, maxWidth: "100%" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      {labelElements}
      <style jsx global>{`
        .globe-label {
          position: absolute;
          bottom: anchor(top);
          left: anchor(center);
          translate: -50% 0;
          margin-bottom: 8px;
          padding: 0.2rem 0.5rem;
          background: hsl(var(--popover));
          color: hsl(var(--popover-foreground));
          font-size: 0.7rem;
          border-radius: 4px;
          white-space: nowrap;
          pointer-events: none;
          transition: opacity 0.3s;
          border: 1px solid hsl(var(--border));
        }
      `}</style>
    </div>
  );
}
