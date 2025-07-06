"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { search, type SearchOutput } from '@/ai/flows/search-flow';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Loader2, Search as SearchIcon, Wand2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await search({ query });
      setResult(response);
    } catch (err) {
      console.error("Error during AI search:", err);
      setError("کچھ غلط ہو گیا. براہ مہربانی دوبارہ کوشش کریں.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background p-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="flex-1 truncate text-lg font-semibold">اے ایم آئی کے تلاش</h1>
      </header>
      
      <div className="p-4 space-y-6">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <Input 
            placeholder="کچھ بھی تلاش کریں..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="text-base"
          />
          <Button type="submit" size="icon" disabled={loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <SearchIcon className="h-5 w-5" />}
          </Button>
        </form>

        <div className="min-h-[60vh] flex flex-col">
            {loading && (
                <div className="flex flex-col items-center justify-center text-muted-foreground pt-16">
                    <Loader2 className="h-12 w-12 animate-spin mb-4" />
                    <p>تلاش کیا جا رہا ہے...</p>
                </div>
            )}

            {error && (
                <Alert variant="destructive">
                  <AlertTitle>خرابی</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {result && (
              <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wand2 className="h-5 w-5 text-primary" />
                            <span>جواب</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-base whitespace-pre-wrap">{result.answer}</p>
                    </CardContent>
                </Card>

                {result.sources && result.sources.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">ویب کے نتائج</h3>
                    {result.sources.map((source, index) => (
                      <div key={index} className="group">
                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="block">
                          <p className="text-sm text-muted-foreground truncate">{source.url}</p>
                          <h4 className="text-primary text-lg font-medium group-hover:underline">{source.title}</h4>
                        </a>
                        <p className="mt-1 text-sm text-card-foreground">{source.snippet}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!loading && !result && !error && (
                 <div className="text-center text-muted-foreground pt-16">
                    <SearchIcon className="h-16 w-16 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold">کچھ بھی پوچھیں</h2>
                    <p>اپنا سوال اوپر درج کریں اور مصنوعی ذہانت سے فوری جواب حاصل کریں۔</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}
