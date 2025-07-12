
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Factory, 
  Package, 
  Users, 
  Activity, 
  AlertTriangle, 
  FileText,
  Settings,
  Play,
  Pause,
  StopCircle
} from 'lucide-react';
import Dashboard from '@/components/Dashboard';
import ProductionRegistry from '@/components/ProductionRegistry';
import PackagingRegistry from '@/components/PackagingRegistry';
import StoppagesRegistry from '@/components/StoppagesRegistry';
import Reports from '@/components/Reports';
import SettingsTab from '@/components/SettingsTab';
import { useProductionStore } from '@/store/productionStore';

const Index = () => {
  const { getProductionStatus, currentStoppages } = useProductionStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const productionStatus = getProductionStatus();
  const activeStoppages = currentStoppages();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Factory className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold">Sistema de Produção de Ração</h1>
                  <p className="text-sm text-muted-foreground">
                    Controle Completo de Produção
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium">
                  {currentTime.toLocaleDateString('pt-BR')}
                </div>
                <div className="text-lg font-bold text-primary">
                  {currentTime.toLocaleTimeString('pt-BR')}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Badge variant={productionStatus.caixa01 ? "default" : "secondary"} className="status-running">
                  <Play className="h-3 w-3 mr-1" />
                  Caixa 01
                </Badge>
                <Badge variant={productionStatus.caixa02 ? "default" : "secondary"} className="status-running">
                  <Play className="h-3 w-3 mr-1" />
                  Caixa 02
                </Badge>
                {activeStoppages > 0 && (
                  <Badge variant="destructive" className="status-stopped">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {activeStoppages} Paradas
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-flex">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="production" className="flex items-center space-x-2">
              <Factory className="h-4 w-4" />
              <span className="hidden sm:inline">Produção</span>
            </TabsTrigger>
            <TabsTrigger value="packaging" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Embalagem</span>
            </TabsTrigger>
            <TabsTrigger value="stoppages" className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Paradas</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Cadastro</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="animate-slide-in">
            <Dashboard />
          </TabsContent>
          
          <TabsContent value="production" className="animate-slide-in">
            <ProductionRegistry />
          </TabsContent>
          
          <TabsContent value="packaging" className="animate-slide-in">
            <PackagingRegistry />
          </TabsContent>
          
          <TabsContent value="stoppages" className="animate-slide-in">
            <StoppagesRegistry />
          </TabsContent>
          
          <TabsContent value="reports" className="animate-slide-in">
            <Reports />
          </TabsContent>
          
          <TabsContent value="settings" className="animate-slide-in">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
