
"use client";

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Search, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

interface SearchResult {
    place_id: number;
    lat: string;
    lon: string;
    display_name: string;
    address: {
        road?: string;
        city?: string;
        state?: string;
        postcode?: string;
        country?: string;
    }
}

export default function MapPage() {
    const router = useRouter();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerLayerRef = useRef<L.LayerGroup | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
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
                center: [30.3753, 69.3451],
                zoom: 5,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            
            markerLayerRef.current = L.layerGroup().addTo(map);
            mapInstanceRef.current = map;
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);
    
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        
        setLoading(true);
        setError(null);
        setResults([]);
        
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=pk&addressdetails=1&limit=5`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data: SearchResult[] = await response.json();
            setResults(data);
        } catch (err) {
            setError("تلاش کے دوران ایک خرابی پیش آگئی۔");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }
    
    const handleResultClick = (result: SearchResult) => {
        if (!mapInstanceRef.current || !markerLayerRef.current) return;
        
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);

        mapInstanceRef.current.setView([lat, lon], 15);
        
        markerLayerRef.current.clearLayers();
        
        L.marker([lat, lon])
          .addTo(markerLayerRef.current)
          .bindPopup(`<b>${result.display_name.split(',')[0]}</b><br>${result.address.city || ''}`)
          .openPopup();

        setResults([]);
        setSearchQuery('');
    }

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-20 flex items-center gap-4 border-b bg-background p-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="flex-1 truncate text-lg font-semibold text-center">اے ایم آئی کے نقشہ</h1>
        <div className="w-10"></div>
      </header>

      <div className="p-4 space-y-4 z-10 bg-background shadow-md">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
              <Input
                  dir="rtl"
                  placeholder="جگہ تلاش کریں..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-base h-11 text-right"
              />
              <Button type="submit" size="icon" className="h-11 w-11 shrink-0" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              </Button>
          </form>
      </div>

      <div className="relative flex-1">
        <div ref={mapContainerRef} className="absolute inset-0 z-0"></div>
        {(results.length > 0 || error || loading) && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] max-w-md z-10">
                <Card>
                    <CardContent className="p-2 max-h-60 overflow-y-auto">
                        {loading && <p className="p-4 text-center text-muted-foreground">تلاش کیا جا رہا ہے...</p>}
                        {error && <p className="p-4 text-center text-destructive">{error}</p>}
                        {results.length === 0 && !loading && !error && (
                             <p className="p-4 text-center text-muted-foreground">کوئی نتیجہ نہیں ملا۔</p>
                        )}
                        <div className="divide-y">
                        {results.map(result => (
                            <div key={result.place_id} onClick={() => handleResultClick(result)} className="p-2 cursor-pointer hover:bg-muted rounded-md text-right" dir="rtl">
                                <p className="font-semibold">{result.display_name.split(',')[0]}</p>
                                <p className="text-sm text-muted-foreground">{result.display_name.substring(result.display_name.indexOf(',') + 1).trim()}</p>
                            </div>
                        ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}
      </div>
    </div>
  );
}
