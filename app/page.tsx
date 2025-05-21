'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import ReactMarkdown from 'react-markdown';

export default function HomePage() {
  const [articleUrl, setArticleUrl] = useState('');
  const [additionalText, setAdditionalText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [keyInfo, setKeyInfo] = useState<string | null>(null);
  const [nouns, setNouns] = useState<string | null>(null);
  const [rephrasedArticle, setRephrasedArticle] = useState<string | null>(null);
  const [scoringResult, setScoringResult] = useState<string | null>(null);
  const [seoMetadata, setSeoMetadata] = useState<string | null>(null);
  const [crossCheckedResult, setCrossCheckedResult] = useState<string | null>(null);
  const [error, setError] = useState('');

  const processArticle = async () => {
    setIsLoading(true);
    setOutput('');
    setKeyInfo(null);
    setNouns(null);
    setRephrasedArticle(null);
    setScoringResult(null);
    setSeoMetadata(null);
    setCrossCheckedResult(null);
    setError('');

    try {
      const response = await fetch('/api/process-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleUrl, additionalText }),
      });

      if (!response.ok) {
        let errorDetails = 'An unknown error occurred.';
        try {
            const errorJson = await response.json();
             errorDetails = errorJson.details || errorJson.error || errorDetails;
        } catch (e) {
            errorDetails = await response.text();
        }
        throw new Error(`API error: ${response.status} ${response.statusText} - ${errorDetails}`);
      }

      // Handle JSON response
      const result = await response.json();
      console.log('Received JSON result:', result);

      // Update state with the results
      setKeyInfo(result.key_info || 'N/A');
      setNouns(result.nouns || 'N/A');
      setRephrasedArticle(result.rephrase_article || 'N/A');
      setScoringResult(result.scoring_result || 'N/A');
      setSeoMetadata(result.seo_metadata || 'N/A');
      setCrossCheckedResult(result.cross_checked_result || 'N/A');

    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white p-4 border-r flex flex-col">
        <Button className="mb-4">Create New</Button>
        <ScrollArea className="flex-grow pr-4"> {/* Added padding-right to ScrollArea */}
          <h3 className="text-lg font-semibold mb-2">History</h3>
          {/* Placeholder for history items */}
          <p className="text-gray-500 text-sm">No history yet.</p>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        <Card className="w-full max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">News Article AI Playground</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div>
                <label htmlFor="articleUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Article URL
                </label>
                <Input
                  id="articleUrl"
                  type="url"
                  placeholder="Enter article URL (e.g., https://example.com/news/article-title)"
                  value={articleUrl}
                  onChange={(e) => setArticleUrl(e.target.value)}
                  className="block w-full"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="additionalText" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Text (Optional)
                </label>
                <Textarea
                  id="additionalText"
                  placeholder="Provide additional context or instructions for the AI..."
                  value={additionalText}
                  onChange={(e) => setAdditionalText(e.target.value)}
                  className="block w-full h-24"
                  disabled={isLoading}
                />
              </div>
              <Button onClick={processArticle} disabled={isLoading || !articleUrl}>
                {isLoading ? 'Processing...' : 'Process Article'}
              </Button>

              <Separator className="my-4" />

              <div>
                <h3 className="text-lg font-semibold mb-2">AI Output</h3>
                {isLoading && <p className="text-blue-600">Processing steps...</p>}
                {error && <p className="text-red-500">Error: {error}</p>}
                
                {/* Display individual step outputs */}
                {keyInfo !== null && (
                    <div className="mt-4">
                        <h4 className="text-md font-semibold">Extracted Key Information:</h4>
                         {keyInfo.startsWith('Error:') ? <p className="text-red-500">{keyInfo}</p> : <p className="whitespace-pre-wrap text-sm text-gray-800">{keyInfo}</p>}
                    </div>
                )}

                {nouns !== null && (
                    <div className="mt-4">
                        <h4 className="text-md font-semibold">Extracted Nouns:</h4>
                         {nouns.startsWith('Error:') ? <p className="text-red-500">{nouns}</p> : <p className="whitespace-pre-wrap text-sm text-gray-800">{nouns}</p>}
                    </div>
                )}

                 {rephrasedArticle !== null && (
                    <div className="mt-4">
                        <h4 className="text-md font-semibold">Rephrased Article:</h4>
                         {rephrasedArticle.startsWith('Error:') ? <p className="text-red-500">{rephrasedArticle}</p> : 
                         <div className="prose dark:prose-invert whitespace-pre-wrap text-sm text-gray-800">
                           <ReactMarkdown>{rephrasedArticle}</ReactMarkdown>
                         </div>}
                    </div>
                )}

                 {scoringResult !== null && (
                    <div className="mt-4">
                        <h4 className="text-md font-semibold">Scoring Result:</h4>
                         {scoringResult.startsWith('Error:') ? <p className="text-red-500">{scoringResult}</p> : <p className="whitespace-pre-wrap text-sm text-gray-800">{scoringResult}</p>}
                    </div>
                )}

                 {seoMetadata !== null && (
                    <div className="mt-4">
                        <h4 className="text-md font-semibold">SEO Metadata:</h4>
                         {seoMetadata.startsWith('Error:') ? <p className="text-red-500">{seoMetadata}</p> : <p className="whitespace-pre-wrap text-sm text-gray-800">{seoMetadata}</p>}
                    </div>
                )}

                 {crossCheckedResult !== null && (
                    <div className="mt-4">
                        <h4 className="text-md font-semibold">Cross-Check Result:</h4>
                         {crossCheckedResult.startsWith('Error:') ? <p className="text-red-500">{crossCheckedResult}</p> : 
                         <div className="prose dark:prose-invert whitespace-pre-wrap text-sm text-gray-800">
                            <ReactMarkdown>{crossCheckedResult}</ReactMarkdown>
                         </div>}
                    </div>
                )}

                 {/* Optional: Show raw output for debugging */}
                 {/*
                 <div className="mt-4">
                    <h4 className="text-md font-semibold">Raw Stream Output:</h4>
                    <ScrollArea className="h-[20vh] p-4 border rounded-md bg-gray-50 whitespace-pre-wrap text-sm text-gray-800">
                        {output}
                    </ScrollArea>
                 </div>
                 */}

                {!isLoading && !error && keyInfo === null && nouns === null && rephrasedArticle === null && scoringResult === null && seoMetadata === null && crossCheckedResult === null && (
                     <p className="text-gray-500">Enter a URL and click 'Process Article' to see the AI output here.</p>
                )}

              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
