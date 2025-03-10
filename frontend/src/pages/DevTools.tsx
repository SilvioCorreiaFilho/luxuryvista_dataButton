import { useState } from 'react';
import { Navbar } from 'components/Navbar';
import { CodeReview } from '../components/CodeReview';
import { ModuleFixer } from 'components/ModuleFixer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { fixAllModules } from "utils/moduleFixerUtils";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function DevTools() {
  const [isFixing, setIsFixing] = useState(false);
  const [fixResult, setFixResult] = useState<string | null>(null);

  const handleQuickFix = async () => {
    setIsFixing(true);
    setFixResult("Fixing all API modules...");

    try {
      const result = await fixAllModules();
      setFixResult(`${result.message}\n\nFixed: ${result.fixed.length} items\nRemaining issues: ${result.issues.length}`);
    } catch (error) {
      setFixResult(`Error fixing modules: ${error.message}`);
    } finally {
      setIsFixing(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-5xl mx-auto py-12 px-4">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-light tracking-wide">
                Development Tools
              </h1>
              <p className="text-gray-600 text-lg">
                A collection of tools to help you develop better code.
              </p>
            </div>
            <Button 
              variant="default" 
              onClick={handleQuickFix} 
              disabled={isFixing}
            >
              {isFixing ? "Fixing..." : "Quick Fix All Modules"}
            </Button>
          </div>

          {fixResult && (
            <Card className="p-6">
              <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded text-sm">
                {fixResult}
              </pre>
              <div className="mt-4">
                <Button variant="outline" onClick={() => setFixResult(null)} size="sm">
                  Clear
                </Button>
              </div>
            </Card>
          )}

          <Tabs defaultValue="code-review" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="code-review">Code Review</TabsTrigger>
              <TabsTrigger value="module-fixer">Module Fixer</TabsTrigger>
            </TabsList>

            <TabsContent value="code-review" className="mt-0">
              <CodeReview />
            </TabsContent>

            <TabsContent value="module-fixer">
              <ModuleFixer />
            </TabsContent>
          </Tabs>
          
          <Separator className="my-4" />
          
          <div className="text-sm text-gray-500">
            <p>These developer tools help maintain the LuxuryVista application. The Module Fixer can fix common syntax issues in backend modules without consuming credits.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
