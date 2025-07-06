"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { search, type SearchOutput } from '@/ai/flows/search-flow';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Loader2, Search as SearchIcon, Wand2, Link2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const suggestedQueries = [
    'پاکستان کی تاریخ',
    'آج موسم کیسا ہے؟',
    'صحت مند رہنے کے 5 طریقے',
    'ایک دلچسپ لطیفہ سنائیں',
];

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setQuery(searchQuery);
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await search({ query: searchQuery });
      setResult(response);
    } catch (err) {
      console.error("Error during AI search:", err);
      setError("کچھ غلط ہو گیا. براہ مہربانی دوبارہ کوشش کریں.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  }

  return (
    <div>
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background p-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="flex-1 truncate text-lg font-semibold">اے ایم آئی کے تلاش</h1>
      </header>
      
      <div className="p-4 space-y-6">
        <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
          <Input 
            placeholder="کچھ بھی تلاش کریں..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="text-base h-11"
          />
          <Button type="submit" size="icon" className="h-11 w-11" disabled={loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <SearchIcon className="h-5 w-5" />}
          </Button>
        </form>

        <div className="min-h-[60vh] flex flex-col">
            {loading && (
                <div className="flex flex-col items-center justify-center text-muted-foreground pt-16">
                    <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
                    <p className="text-lg">تلاش کیا جا رہا ہے...</p>
                    <p className="text-sm">بہترین جواب تیار کیا جا رہا ہے</p>
                </div>
            )}

            {error && (
                <Alert variant="destructive">
                  <AlertTitle>خرابی</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {result && (
              <div className="space-y-8 animate-in fade-in-50">
                <Card className="shadow-lg border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Wand2 className="h-6 w-6 text-primary" />
                            <span className='text-xl'>جواب</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-base space-y-4 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-1 [&_strong]:font-semibold">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.answer}</ReactMarkdown>
                        </div>
                    </CardContent>
                </Card>

                {result.sources && result.sources.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold border-b pb-2 mb-4">ویب کے نتائج</h3>
                    <div className="space-y-6">
                        {result.sources.map((source, index) => (
                          <div key={index} className="group">
                            <a href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                               <Link2 className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
                               <p className="text-sm text-muted-foreground truncate">{source.url}</p>
                            </a>
                            <a href={source.url} target="_blank" rel="noopener noreferrer">
                              <h4 className="text-primary text-lg font-medium group-hover:underline">{source.title}</h4>
                            </a>
                            <p className="mt-1 text-sm text-card-foreground">{source.snippet}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!loading && !result && !error && (
                 <div className="text-center text-muted-foreground pt-10">
                    <div className="inline-block p-4 bg-primary/10 rounded-full">
                        <SearchIcon className="h-12 w-12 mx-auto text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mt-6 mb-2">کچھ بھی پوچھیں</h2>
                    <p className="mb-6">مصنوعی ذہانت سے فوری جواب حاصل کرنے کے لیے اپنا سوال اوپر درج کریں۔</p>
                    <div className='flex flex-wrap justify-center gap-2'>
                        {suggestedQueries.map(q => (
                            <Button key={q} variant="outline" size="sm" onClick={() => handleSearch(q)}>
                                {q}
                            </Button>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
