import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { toast } from "sonner";
import brain from "brain";

interface MigrationResult {
  success: boolean;
  message: string;
  properties_processed?: number;
  images_created?: number;
  images_updated?: number;
  errors?: string[];
  sql_needed?: boolean;
  dry_run?: boolean;
  background?: boolean;
}

export interface Props {
  title?: string;
  description?: string;
}

export function PropertyImageMigrator({ 
  title = "Property Image Migration", 
  description = "Fix property image storage by migrating images from Supabase storage to the database"
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [propertyId, setPropertyId] = useState("");
  const [forceUpdate, setForceUpdate] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [result, setResult] = useState<MigrationResult | null>(null);

  const handleMigrate = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await brain.migrate_property_images({
        property_id: propertyId || null,
        force_update: forceUpdate,
        dry_run: dryRun
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message || "Migration failed");
      }
    } catch (error) {
      console.error("Migration error:", error);
      toast.error("Migration failed: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackgroundMigrate = async () => {
    setIsLoading(true);

    try {
      const response = await brain.migrate_property_images_background({
        property_id: propertyId || null,
        force_update: forceUpdate,
        dry_run: dryRun
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Background migration started");
        setResult({
          ...data,
          background: true
        });
      } else {
        toast.error(data.message || "Failed to start background migration");
      }
    } catch (error) {
      console.error("Background migration error:", error);
      toast.error("Failed to start background migration: " + 
        (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="propertyId">Property ID (optional)</Label>
            <Input
              id="propertyId"
              placeholder="Leave empty to migrate all properties"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="forceUpdate" 
              checked={forceUpdate}
              onCheckedChange={(checked) => setForceUpdate(checked === true)}
            />
            <Label htmlFor="forceUpdate" className="cursor-pointer">
              Force update existing images
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="dryRun" 
              checked={dryRun}
              onCheckedChange={(checked) => setDryRun(checked === true)}
            />
            <Label htmlFor="dryRun" className="cursor-pointer">
              Dry run (preview only, no changes)
            </Label>
          </div>
          
          {result && (
            <>
              <Separator className="my-2" />
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">
                  {result.background 
                    ? "Background Migration Started" 
                    : "Migration Result"}
                </h3>
                {result.background ? (
                  <p>The migration is running in the background. Check server logs for progress.</p>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-white p-3 rounded shadow-sm">
                        <p className="text-gray-500 text-sm">Properties Processed</p>
                        <p className="text-2xl font-bold">{result.properties_processed || 0}</p>
                      </div>
                      <div className="bg-white p-3 rounded shadow-sm">
                        <p className="text-gray-500 text-sm">Images Created</p>
                        <p className="text-2xl font-bold">{result.images_created || 0}</p>
                      </div>
                      <div className="bg-white p-3 rounded shadow-sm">
                        <p className="text-gray-500 text-sm">Images Updated</p>
                        <p className="text-2xl font-bold">{result.images_updated || 0}</p>
                      </div>
                    </div>

                    {result.errors && result.errors.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Errors:</h4>
                        <ul className="list-disc pl-5 text-sm text-red-600">
                          {result.errors.slice(0, 5).map((error: string, index: number) => (
                            <li key={index}>{error}</li>
                          ))}
                          {result.errors.length > 5 && (
                            <li>...and {result.errors.length - 5} more errors</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {result.sql_needed && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-yellow-800 font-medium">Database Table Missing</p>
                        <p className="text-sm mt-1">
                          The property_images table doesn't exist. Create it in the Supabase SQL Editor.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
        <Button 
          onClick={handleMigrate} 
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? "Running..." : dryRun ? "Preview Migration" : "Run Migration"}
        </Button>
        <Button 
          onClick={handleBackgroundMigrate} 
          disabled={isLoading}
          variant="outline"
          className="w-full sm:w-auto"
        >
          Run in Background
        </Button>
      </CardFooter>
    </Card>
  );
}
