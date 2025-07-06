
"use client";

import { useEffect, useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

export default function MapPage() {
    const router = useRouter();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);

    useEffect(() => {
        // This is a common fix for Leaflet icons with bundlers like Webpack
        const DefaultIcon = L.icon({
          iconRetinaUrl: iconRetina.src,
          iconUrl: icon.src,
          shadowUrl: iconShadow.src,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          tooltipAnchor: [16, -28],
          shadowSize: [41, 41],
        });
        L.Marker.prototype.options.icon = DefaultIcon;
    }, []);

    useEffect(() => {
        if (mapContainerRef.current && !mapInstanceRef.current) {
            const map = L.map(mapContainerRef.current, {
                center: [30.3753, 69.3451], // Centered on Pakistan
                zoom: 5,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            mapInstanceRef.current = map;
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []); // Empty dependency array ensures this effect runs only once

  return (
    <div>
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background p-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="flex-1 truncate text-lg font-semibold text-center">اے ایم آئی کے نقشہ</h1>
        <div className="w-10"></div>
      </header>
      <div className="w-full h-[calc(100vh-120px)] bg-muted">
          <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }}></div>
      </div>
    </div>
  );
}
