import React, { useState, useRef, useEffect } from 'react';
import { LanguageProvider } from '../utils/languageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Upload, Code, Terminal } from 'lucide-react';
import { Navbar } from 'components/Navbar';
import { toast } from 'sonner';
import brain from 'brain';
import { TranslatedText } from 'components/TranslatedText';

function ScriptUploaderContent() {
  const [scriptContent, setScriptContent] = useState('');
  const [fileType, setFileType] = useState<'python' | 'tsx' | 'ts' | 'js'>('python');
  const [fileName, setFileName] = useState('script.py');
  const [isLoading, setIsLoading] = useState(false);
  const [scriptOutput, setScriptOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('editor');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update placeholder when fileType changes
  useEffect(() => {
    if (fileType === 'python') {
      setFileName(fileName.endsWith('.py') ? fileName : 'script.py');
    } else if (fileType === 'tsx') {
      setFileName(fileName.endsWith('.tsx') ? fileName : 'component.tsx');
    } else if (fileType === 'ts') {
      setFileName(fileName.endsWith('.ts') ? fileName : 'utility.ts');
    } else {
      setFileName(fileName.endsWith('.js') ? fileName : 'script.js');
    }
  }, [fileType, fileName]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Set file type based on extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'tsx') {
      setFileType('tsx');
      setFileName(file.name);
    } else if (extension === 'ts') {
      setFileType('ts');
      setFileName(file.name);
    } else if (extension === 'js') {
      setFileType('js');
      setFileName(file.name);
    } else {
      setFileType('python');
      setFileName(file.name);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setScriptContent(content);
      setActiveTab('editor');
    };
    reader.readAsText(file);
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const executeScript = async () => {
    if (!scriptContent.trim()) {
      toast.error('Please enter a script or upload a file first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setScriptOutput('');

    try {
      // Create a Blob with the script content
      const blob = new Blob([scriptContent], { type: 'text/plain' });
      
      // Create a File object from the Blob with appropriate name
      const file = new File([blob], fileName, { 
        type: fileType === 'python' ? 'text/x-python' : 
               fileType === 'tsx' ? 'text/typescript-jsx' : 
               fileType === 'ts' ? 'text/typescript' : 'text/javascript' 
      });
      
      // Use the brain client to upload the script
      const response = await brain.upload_script({ body: { script: file } });
      const data = await response.json();

      if (data.success) {
        setScriptOutput(data.output || 'Script executed successfully with no output.');
        toast.success('Script executed successfully');
      } else {
        setError(data.error || 'Unknown error occurred');
        setScriptOutput(data.output || '');
        toast.error('Script execution failed');
      }
      
      // Switch to the output tab to show results
      setActiveTab('output');
    } catch (err) {
      setError(`Error executing script: ${err instanceof Error ? err.message : String(err)}`);
      toast.error('Failed to execute script');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="container max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-light text-gray-900 mb-6">
          <TranslatedText text="Script Uploader" fromLang="pt-BR" />
        </h1>
        
        <div className="mb-8">
          <p className="text-lg text-gray-600 mb-2">
            <TranslatedText 
              text="Upload or paste Python (.py), JavaScript (.js), TypeScript (.ts) or React (.tsx) files to execute for database maintenance or UI component testing." 
              fromLang="pt-BR" 
            />
          </p>
          <div className="flex flex-wrap gap-4 mt-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".py,.tsx,.ts,.js"
              className="hidden"
            />
            <Button
              onClick={handleFileUploadClick}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload size={16} />
              <TranslatedText text="Upload Script File" fromLang="pt-BR" />
            </Button>
            <Button 
              onClick={executeScript} 
              disabled={isLoading} 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Terminal size={16} />
              {isLoading ? 
                <TranslatedText text="Executing..." fromLang="pt-BR" /> : 
                <TranslatedText text="Execute Script" fromLang="pt-BR" />
              }
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="editor" className="flex items-center gap-2">
                  <Code size={16} />
                  <TranslatedText text="Script Editor" fromLang="pt-BR" />
                </TabsTrigger>
                <TabsTrigger value="output" className="flex items-center gap-2">
                  <Terminal size={16} />
                  <TranslatedText text="Execution Output" fromLang="pt-BR" />
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant={fileType === 'python' ? 'default' : 'outline'}
                  onClick={() => setFileType('python')}
                  className="text-xs"
                >
                  Python
                </Button>
                <Button 
                  size="sm" 
                  variant={fileType === 'js' ? 'default' : 'outline'}
                  onClick={() => setFileType('js')}
                  className="text-xs"
                >
                  JS
                </Button>
                <Button 
                  size="sm" 
                  variant={fileType === 'ts' ? 'default' : 'outline'}
                  onClick={() => setFileType('ts')}
                  className="text-xs"
                >
                  TS
                </Button>
                <Button 
                  size="sm" 
                  variant={fileType === 'tsx' ? 'default' : 'outline'}
                  onClick={() => setFileType('tsx')}
                  className="text-xs"
                >
                  TSX
                </Button>
              </div>
            </div>
            
            <TabsContent value="editor">
              <Card className="p-0 overflow-hidden border shadow-sm">
                <Textarea
                  value={scriptContent}
                  onChange={(e) => setScriptContent(e.target.value)}
                  placeholder={fileType === 'python' ? 
`# Enter your Python script here or upload a file
import databutton as db

# Example: Fix property types
print('Starting database repair script...')

# Your database fix code here

print('Script completed successfully')` : 
fileType === 'tsx' ? 
`// Enter your TypeScript/React code here
import React from 'react';
import { Button } from '@/components/ui/button';

export interface Props {
  text: string;
}

export function MyComponent({ text }: Props) {
  return (
    <div>
      <Button>{text}</Button>
    </div>
  );
}` : 
fileType === 'ts' ?
`// Enter your TypeScript utility code here

export interface PropertyData {
  id: string;
  title: string;
  price: number;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
}

export function sortProperties(properties: PropertyData[], order: 'asc' | 'desc' = 'desc'): PropertyData[] {
  return [...properties].sort((a, b) => {
    return order === 'asc' ? a.price - b.price : b.price - a.price;
  });
}` :
`// Enter your JavaScript code here

/**
 * Format a number as Brazilian currency (BRL)
 * @param {number} amount - The amount to format
 * @returns {string} The formatted currency string
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
}

/**
 * Sort properties by price
 * @param {Array} properties - Array of property objects
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted array of properties
 */
function sortProperties(properties, order = 'desc') {
  return [...properties].sort((a, b) => {
    return order === 'asc' ? a.price - b.price : b.price - a.price;
  });
}`}
                  className="font-mono text-sm p-4 min-h-[50vh] resize-none rounded-none border-0 focus-visible:ring-0"
                />
              </Card>
            </TabsContent>
            
            <TabsContent value="output">
              <Card className="p-0 overflow-hidden border shadow-sm">
                <div className="bg-gray-100 p-2 border-b flex items-center">
                  <h3 className="text-sm font-medium">
                    <TranslatedText text="Execution Results" fromLang="pt-BR" />
                  </h3>
                  {error ? (
                    <div className="ml-auto flex items-center text-red-500 text-sm">
                      <AlertCircle size={16} className="mr-1" />
                      <TranslatedText text="Failed" fromLang="pt-BR" />
                    </div>
                  ) : scriptOutput ? (
                    <div className="ml-auto flex items-center text-green-500 text-sm">
                      <CheckCircle size={16} className="mr-1" />
                      <TranslatedText text="Success" fromLang="pt-BR" />
                    </div>
                  ) : null}
                </div>
                <div className="p-4 font-mono text-sm whitespace-pre-wrap bg-gray-950 text-gray-200 min-h-[50vh] overflow-auto">
                  {error ? (
                    <div className="text-red-400">
                      {error}
                      {scriptOutput && (
                        <>
                          <div className="my-2 border-t border-gray-700 pt-2">
                            <TranslatedText text="Output before error:" fromLang="pt-BR" />
                          </div>
                          <div className="text-gray-300">{scriptOutput}</div>
                        </>
                      )}
                    </div>
                  ) : scriptOutput ? (
                    scriptOutput
                  ) : (
                    <span className="text-gray-500 italic">
                      <TranslatedText text="No output yet. Execute a script to see results here." fromLang="pt-BR" />
                    </span>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

export default function ScriptUploader() {
  return (
    <LanguageProvider>
      <ScriptUploaderContent />
    </LanguageProvider>
  );
}