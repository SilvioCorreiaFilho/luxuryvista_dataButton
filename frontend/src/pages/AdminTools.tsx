import React from 'react';
import { PropertyImageUpdater } from '../components/PropertyImageUpdater';
import { PropertyImageMigrator } from '../components/PropertyImageMigrator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export default function AdminTools() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <div className="mb-8 flex items-center">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Admin Tools</h1>
      </div>
      
      <div className="flex flex-col space-y-8">
        <PropertyImageMigrator />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <PropertyImageUpdater />
          
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">Database Management</CardTitle>
              <CardDescription>
                Tools for managing the property database
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-600 mb-4">
                Manage database connections and configuration settings for your luxury properties.
              </p>
              <div className="flex flex-col space-y-2">
                <Button 
                  variant="outline"
                  className="justify-start"
                  onClick={() => navigate('/database-setup')}
                >
                  Database Setup
                </Button>
                <Button 
                  variant="outline"
                  className="justify-start"
                  onClick={() => navigate('/property-generator')}
                >
                  Property Generator
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}