import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fixModule, fixAllModules, checkModule, checkAllModules } from "utils/moduleFixerUtils";
import { checkHealth, HealthCheckResult, ModuleHealth } from "utils/healthCheckUtils";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";

export function ModuleFixer() {
  const [healthResult, setHealthResult] = useState<HealthCheckResult | null>(null);
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [fixType, setFixType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);

  const runHealthCheck = async () => {
    setIsLoading(true);
    try {
      const result = await checkHealth();
      setHealthResult(result);
      setResult(null);
    } catch (error) {
      console.error("Health check error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFixModule = async () => {
    if (!selectedModule) return;
    
    setIsLoading(true);
    try {
      const result = await fixModule({
        modulePath: selectedModule,
        fixType: fixType as any
      });
      setResult(result);
    } catch (error) {
      console.error("Fix module error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFixAll = async () => {
    setIsLoading(true);
    try {
      const result = await fixAllModules();
      setResult(result);
    } catch (error) {
      console.error("Fix all modules error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewModule = async () => {
    if (!selectedModule) return;
    
    setIsLoading(true);
    try {
      const result = await checkModule({
        modulePath: selectedModule,
        fixType: fixType as any
      });
      setResult(result);
    } catch (error) {
      console.error("Review module error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Module Health Status</CardTitle>
            <CardDescription>
              Check the health of all API modules in the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div>
                {healthResult && (
                  <Badge 
                    variant={healthResult.status === "healthy" ? "default" : "destructive"}
                    className="text-sm"
                  >
                    Status: {healthResult.status}
                  </Badge>
                )}
              </div>
              <Button onClick={runHealthCheck} disabled={isLoading}>
                {isLoading ? "Running..." : "Run Health Check"}
              </Button>
            </div>
            
            {healthResult && (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <div>Total Modules: {healthResult.total_modules}</div>
                  <div className="text-green-600">Healthy: {healthResult.healthy_count}</div>
                  <div className="text-red-600">Unhealthy: {healthResult.unhealthy_count}</div>
                </div>

                {healthResult.unhealthy_modules.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2 text-red-600">Unhealthy Modules:</h3>
                    <div className="max-h-48 overflow-y-auto">
                      {healthResult.unhealthy_modules.map((module, index) => (
                        <div key={index} className="bg-red-50 p-3 rounded mb-2 text-sm">
                          <div className="font-semibold">{module.module_name}</div>
                          <div className="text-red-700 text-xs mt-1 whitespace-pre-wrap">{module.error}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <p className="text-xs text-gray-500">
              Select a module below to fix issues
            </p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Module Fixer</CardTitle>
            <CardDescription>
              Fix common issues in API modules without spending credits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="module">Select Module</Label>
                <Select 
                  value={selectedModule} 
                  onValueChange={setSelectedModule}
                >
                  <SelectTrigger id="module">
                    <SelectValue placeholder="Select a module" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="app.apis">All APIs (app.apis)</SelectItem>
                    {healthResult?.unhealthy_modules.map((module) => (
                      <SelectItem key={module.module_name} value={module.module_name}>
                        {module.module_name} ⚠️
                      </SelectItem>
                    ))}
                    {healthResult?.healthy_modules.map((module) => (
                      <SelectItem key={module.module_name} value={module.module_name}>
                        {module.module_name} ✓
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fix-type">Fix Type</Label>
                <Select 
                  value={fixType} 
                  onValueChange={setFixType}
                >
                  <SelectTrigger id="fix-type">
                    <SelectValue placeholder="Select fix type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Fixes</SelectItem>
                    <SelectItem value="syntax">String Literals</SelectItem>
                    <SelectItem value="router">Router Definitions</SelectItem>
                    <SelectItem value="operation_id">Operation IDs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex space-x-3 pt-2">
                <Button onClick={handleFixModule} disabled={!selectedModule || isLoading}>
                  Fix Selected Module
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleReviewModule}
                  disabled={!selectedModule || isLoading}
                >
                  Review Only
                </Button>
              </div>
              
              <div className="flex justify-center pt-4">
                <Button 
                  variant="secondary"
                  onClick={handleFixAll}
                  disabled={isLoading}
                  className="w-full"
                >
                  Fix All Modules
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-gray-500">
              No credits are used when fixing modules with this utility
            </p>
          </CardFooter>
        </Card>
      </div>
      
      {result && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center">
              <CardTitle className="mr-2">
                Operation Result
              </CardTitle>
              <Badge 
                variant={result.success ? "default" : "destructive"}
              >
                {result.success ? "Success" : "Error"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{result.message}</p>
            
            {result.fixed && result.fixed.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Fixed Items:</h3>
                <div className="bg-green-50 p-3 rounded max-h-48 overflow-y-auto">
                  {result.fixed.map((fix, index) => (
                    <div key={index} className="mb-1 text-sm flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                      <span>{fix}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {result.issues && result.issues.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Issues:</h3>
                <div className="bg-red-50 p-3 rounded max-h-48 overflow-y-auto">
                  {result.issues.map((issue, index) => (
                    <div key={index} className="mb-1 text-sm flex items-start">
                      <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-amber-600" />
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={runHealthCheck}>
              Run Health Check Again
            </Button>
          </CardFooter>
        </Card>
      )}
      
      <Alert className="bg-blue-50">
        <AlertTitle>Usage Instructions</AlertTitle>
        <AlertDescription>
          <ol className="list-decimal pl-6 space-y-2 text-sm mt-2">
            <li>
              <strong>Run Health Check</strong> to see the status of all modules
            </li>
            <li>
              <strong>Select a Module</strong> - prioritize unhealthy modules (marked with ⚠️)
            </li>
            <li>
              <strong>Choose Fix Type</strong> - usually "All Fixes" works best
            </li>
            <li>
              <strong>Click "Fix Selected Module"</strong> to apply fixes
            </li>
            <li>
              <strong>Run Health Check Again</strong> to verify the module is now healthy
            </li>
            <li>
              For quick fixing of all modules, use the <strong>"Fix All Modules"</strong> button
            </li>
          </ol>
        </AlertDescription>
      </Alert>
    </div>
  );
}
