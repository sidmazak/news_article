'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import ReactMarkdown from 'react-markdown';
// Assuming Accordion/Collapsible components are available in shadcn/ui or similar
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
// Import sonner components for toasting
import { Toaster, toast } from 'sonner';
// Import icons for collapsible
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function HomePage() {
  const [articleUrl, setArticleUrl] = useState('');
  const [additionalText, setAdditionalText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState('Idle'); // New state for current step
  const [keyInfo, setKeyInfo] = useState<string | null>(null);
  const [nouns, setNouns] = useState<string | null>(null);
  const [rephrasedArticle, setRephrasedArticle] = useState<string | null>(null);
  const [scoringResult, setScoringResult] = useState<string | null>(null);
  const [seoMetadata, setSeoMetadata] = useState<string | null>(null);
  const [crossCheckedResult, setCrossCheckedResult] = useState<string | null>(null);
  const [error, setError] = useState('');

  // State to manage which collapsible section is open
  const [openSection, setOpenSection] = useState<string | null>(null);

  const processArticle = async () => {
    setIsLoading(true);
    setProcessingStep('Starting...'); // Set initial step
    // Reset all state variables for a new process
    setKeyInfo(null);
    setNouns(null);
    setRephrasedArticle(null);
    setScoringResult(null);
    setSeoMetadata(null);
    setCrossCheckedResult(null);
    setError('');
    setOpenSection(null); // Close all sections initially

    // Show initial loading toast
    const loadingToastId = toast.loading('Starting article processing...');

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
        const errorMessage = `API error: ${response.status} ${response.statusText} - ${errorDetails}`;
        setError(errorMessage);
        setProcessingStep('Error');
        toast.error(errorMessage, { id: loadingToastId }); // Update loading toast to error
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      if (!reader) {
         const errorMessage = 'Failed to get stream reader.';
         setError(errorMessage);
         setProcessingStep('Error');
         toast.error(errorMessage, { id: loadingToastId }); // Update loading toast to error
         throw new Error(errorMessage);
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          setProcessingStep('Complete'); // Set complete step
          toast.success('Article processing complete!', { id: loadingToastId }); // Update loading toast to success
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        const messages = buffer.split('\n\n');
        buffer = messages.pop() || '';

        for (const message of messages) {
          if (message.startsWith('event: ')) {
            const eventType = message.substring('event: '.length, message.indexOf('\n'));
            const data = message.substring(message.indexOf('data: ') + 'data: '.length);

            try {
              const jsonData = JSON.parse(data);

              // Close previous section before opening the new one, unless it's an error
              if (eventType !== 'error') {
                 setOpenSection(eventType);
              }

              switch (eventType) {
                case 'extraction':
                  setKeyInfo(jsonData.keyInfo);
                  setProcessingStep('Extracted Key Information');
                  toast.loading('Processing Extracted Key Information...', { id: loadingToastId }); // Update loading toast
                  break;
                case 'nouns':
                  setNouns(jsonData.nouns);
                  setProcessingStep('Extracted Nouns');
                  toast.loading('Processing Extracted Nouns...', { id: loadingToastId }); // Update loading toast
                  break;
                case 'rephrase':
                  setRephrasedArticle(jsonData.rephraseArticle);
                  setProcessingStep('Rephrasing Article');
                  toast.loading('Processing Rephrased Article...', { id: loadingToastId }); // Update loading toast
                  break;
                case 'scoring':
                  setScoringResult(jsonData.scoringResult);
                  setProcessingStep('Scoring Result');
                  toast.loading('Processing Scoring Result...', { id: loadingToastId }); // Update loading toast
                  break;
                case 'seo':
                  setSeoMetadata(jsonData.seoMetadata);
                  setProcessingStep('Generating SEO Metadata');
                  toast.loading('Generating SEO Metadata...', { id: loadingToastId }); // Update loading toast
                  break;
                case 'crosscheck':
                  setCrossCheckedResult(jsonData.crossCheckResult);
                  setProcessingStep('Cross-Checking Results');
                  toast.loading('Performing Cross-Check...', { id: loadingToastId }); // Update loading toast
                   // Keep crosscheck open by setting openSection state in the switch, handled above
                  break;
                case 'error':
                  setError(jsonData.error || 'An error occurred during streaming.');
                  setProcessingStep('Error');
                  toast.error(`Error: ${jsonData.error}`, { id: loadingToastId }); // Update loading toast to error
                  break;
                case 'complete':
                  setProcessingStep('Complete');
                  setOpenSection('crosscheck'); // Ensure crosscheck stays open on completion
                  break;
                default:
                  console.warn(`Unknown event type: ${eventType}`);
                  setProcessingStep(`Unknown event: ${eventType}`);
                  toast.warning(`Received unknown event: ${eventType}`, { id: loadingToastId }); // Update loading toast for unknown event
              }
            } catch (jsonError) {
              console.error('Error parsing JSON data from stream:', jsonError);
              const errorMessage = 'Error processing streamed data.';
              setError(errorMessage);
              setProcessingStep('Error');
              toast.error(errorMessage, { id: loadingToastId }); // Update loading toast to error
            }
          }
        }
      }

    } catch (err: any) {
      console.error('Fetch or stream error:', err);
       // Error handling for the initial fetch or stream setup is done within the try block now
    } finally {
      setIsLoading(false);
       if (!error && processingStep !== 'Error') {
         setProcessingStep('Idle'); // Reset if no error occurred during fetch/stream setup or during processing
       }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white p-4 border-r flex flex-col">
        <Button className="mb-4 w-full">Create New</Button>
        <ScrollArea className="flex-grow pr-4">
          <h3 className="text-lg font-semibold mb-2">History</h3>
          {/* Placeholder for history items */}
          <p className="text-gray-500 text-sm">No history yet.</p>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
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
              <Button onClick={processArticle} disabled={isLoading || !articleUrl} className="w-full">
                {isLoading ? `Processing: ${processingStep}...` : 'Process Article'}
              </Button>

              <Separator className="my-6" />

              <div className="space-y-6">
                <h3 className="text-lg font-semibold">AI Output</h3>
                {error && <p className="text-red-500 mb-4">Error: {error}</p>}

                {/* Key Information */}
                {keyInfo !== null && (
                  <Collapsible open={openSection === 'extraction'} onOpenChange={(isOpen: boolean) => setOpenSection(isOpen ? 'extraction' : null)}>
                    <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border p-4 font-semibold transition-all hover:bg-gray-100">
                      Extracted Key Information
                       {openSection === 'extraction' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 rounded-md border p-4 bg-gray-50">
                      {keyInfo.startsWith('Error:') ? <p className="text-red-500">{keyInfo}</p> : 
                      <div className="prose dark:prose-invert whitespace-pre-wrap text-sm text-gray-800 max-w-none break-words">
                        <ReactMarkdown>{keyInfo}</ReactMarkdown>
                      </div>}
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Nouns */}
                {nouns !== null && (
                  <Collapsible open={openSection === 'nouns'} onOpenChange={(isOpen: boolean) => setOpenSection(isOpen ? 'nouns' : null)}>
                    <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border p-4 font-semibold transition-all hover:bg-gray-100">
                      Extracted Nouns
                       {openSection === 'nouns' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 rounded-md border p-4 bg-gray-50">
                      {nouns.startsWith('Error:') ? <p className="text-red-500">{nouns}</p> : 
                      <div className="prose dark:prose-invert whitespace-pre-wrap text-sm text-gray-800 max-w-none break-words">
                        <ReactMarkdown>{nouns}</ReactMarkdown>
                      </div>}
                    </CollapsibleContent>
                  </Collapsible>
                )}

                 {/* Rephrased Article */}
                 {rephrasedArticle !== null && (
                   <Collapsible open={openSection === 'rephrase'} onOpenChange={(isOpen: boolean) => setOpenSection(isOpen ? 'rephrase' : null)}>
                     <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border p-4 font-semibold transition-all hover:bg-gray-100">
                       Rephrased Article
                       {openSection === 'rephrase' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                     </CollapsibleTrigger>
                     <CollapsibleContent className="mt-2 rounded-md border p-4 bg-white shadow-sm">
                         {rephrasedArticle.startsWith('Error:') ? <p className="text-red-500">{rephrasedArticle}</p> : 
                         <div className="prose dark:prose-invert whitespace-pre-wrap text-sm text-gray-800 max-w-none break-words">
                           <ReactMarkdown>{rephrasedArticle}</ReactMarkdown>
                         </div>}
                     </CollapsibleContent>
                   </Collapsible>
                )}

                 {/* Scoring Result */}
                 {scoringResult !== null && (
                   <Collapsible open={openSection === 'scoring'} onOpenChange={(isOpen: boolean) => setOpenSection(isOpen ? 'scoring' : null)}>
                     <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border p-4 font-semibold transition-all hover:bg-gray-100">
                       Scoring Result
                       {openSection === 'scoring' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                     </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 rounded-md border p-4 bg-white shadow-sm">
                         {scoringResult.startsWith('Error:') ? <p className="text-red-500">{scoringResult}</p> : <p className="whitespace-pre-wrap text-sm text-gray-800 break-words">{scoringResult}</p>}
                      </CollapsibleContent>
                    </Collapsible>
                )}

                 {/* SEO Metadata */}
                 {seoMetadata !== null && (
                   <Collapsible open={openSection === 'seo'} onOpenChange={(isOpen: boolean) => setOpenSection(isOpen ? 'seo' : null)}>
                     <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border p-4 font-semibold transition-all hover:bg-gray-100">
                       SEO Metadata
                        {openSection === 'seo' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                     </CollapsibleTrigger>
                     <CollapsibleContent className="mt-2 rounded-md border p-4 bg-white shadow-sm">
                         {seoMetadata.startsWith('Error:') ? <p className="text-red-500">{seoMetadata}</p> : <p className="whitespace-pre-wrap text-sm text-gray-800 break-words">{seoMetadata}</p>}
                     </CollapsibleContent>
                   </Collapsible>
                )}

                 {/* Cross-Check Result */}
                 {crossCheckedResult !== null && (
                   <Collapsible open={openSection === 'crosscheck'} onOpenChange={(isOpen: boolean) => setOpenSection(isOpen ? 'crosscheck' : null)}>
                     <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border p-4 font-semibold transition-all hover:bg-gray-100">
                       Cross-Check Result
                       {openSection === 'crosscheck' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                     </CollapsibleTrigger>
                     <CollapsibleContent className="mt-2 rounded-md border p-4 bg-white shadow-sm">
                         {crossCheckedResult.startsWith('Error:') ? <p className="text-red-500">{crossCheckedResult}</p> : 
                         <div className="prose dark:prose-invert whitespace-pre-wrap text-sm text-gray-800 max-w-none break-words">
                            <ReactMarkdown>{crossCheckedResult}</ReactMarkdown>
                         </div>}
                     </CollapsibleContent>
                   </Collapsible>
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
        {/* Add the Sonner Toaster component */}
        <Toaster />
      </main>
    </div>
  );
}
