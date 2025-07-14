
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Factory, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Clock,
  Users,
  Target,
  Activity
} from 'lucide-react';
import { useProductionEntries } from '@/hooks/useProductionEntries';
import { usePackagingEntries } from '@/hooks/usePackagingEntries';
import { useStoppages } from '@/hooks/useStoppages';
import { useProducts } from '@/hooks/useProducts';
import { useEmployees } from '@/hooks/useEmployees';

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  
  const { entries: productionEntries } = useProductionEntries();
  const { entries: packagingEntries } = usePackagingEntries();
  const { stoppages } = useStoppages();
  const { products } = useProducts();
  const { employees } = useEmployees();

  const getProductionByDate = (date: string) => {
    return productionEntries.filter(entry => entry.date === date);
  };

  const getPackagingByDate = (date: string) => {
    return packagingEntries.filter(entry => entry.date === date);
  };

  const getStoppagesByDate = (date: string) => {
    return stoppages.filter(stoppage => stoppage.start_date === date);
  };

  const getTotalProductionByBox = (date: string) => {
    const entries = getProductionByDate(date);
    return {
      caixa01: entries.filter(e => e.box === 'caixa01').reduce((sum, e) => sum + e.quantity, 0),
      caixa02: entries.filter(e => e.box === 'caixa02').reduce((sum, e) => sum + e.quantity, 0)
    };
  };

  const getProductionByHour = (date: string) => {
    const entries = getProductionByDate(date);
    const hourlyData: { [key: string]: { hour: string; caixa01: number; caixa02: number; } } = {};
    
    for (let hour = 0; hour < 24; hour++) {
      const hourString = hour.toString().padStart(2, '0') + ':00';
      hourlyData[hourString] = { hour: hourString, caixa01: 0, caixa02: 0 };
    }
    
    entries.forEach(entry => {
      const hour = entry.time.split(':')[0] + ':00';
      if (hourlyData[hour]) {
        if (entry.box === 'caixa01') {
          hourlyData[hour].caixa01 += entry.quantity;
        } else {
          hourlyData[hour].caixa02 += entry.quantity;
        }
      }
    });
    
    return Object.values(hourlyData);
  };

  const hourlyData = getProductionByHour(selectedDate);
  const totalProduction = getTotalProductionByBox(selectedDate);
  const packagingData = getPackagingByDate(selectedDate);
  const stoppagesData = getStoppagesByDate(selectedDate);
  const activeStoppages = stoppages.filter(s => s.is_active);

  const totalPackaged = packagingData.reduce((sum, entry) => sum + entry.quantity, 0);
  const totalStoppageTime = stoppagesData.reduce((sum, stoppage) => {
    if (stoppage.duration) {
      return sum + stoppage.duration;
    }
    return sum;
  }, 0);

  const productionEfficiency = totalProduction.caixa01 + totalProduction.caixa02 > 0 
    ? ((totalProduction.caixa01 + totalProduction.caixa02) / (totalProduction.caixa01 + totalProduction.caixa02 + totalStoppageTime / 3600000)) * 100
    : 0;

  const pieData = [
    { name: 'Caixa 01', value: totalProduction.caixa01, color: '#22c55e' },
    { name: 'Caixa 02', value: totalProduction.caixa02, color: '#3b82f6' }
  ];

  return (
    <div className="space-y-6">
      {/* Date Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Dashboard de Produção</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Data:</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Ensacado</p>
                <p className="text-2xl font-bold text-green-400">
                  {(totalProduction.caixa01 + totalProduction.caixa02).toLocaleString()}
                </p>
                <p className="text-xs text-green-400">sacos</p>
              </div>
              <Factory className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Embalagens Carimbadas</p>
                <p className="text-2xl font-bold text-blue-400">
                  {totalPackaged.toLocaleString()}
                </p>
                <p className="text-xs text-blue-400">sacos</p>
              </div>
              <Package className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tempo de Parada</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {Math.round(totalStoppageTime / (1000 * 60))}
                </p>
                <p className="text-xs text-yellow-400">minutos</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Eficiência</p>
                <p className="text-2xl font-bold text-purple-400">
                  {productionEfficiency.toFixed(1)}%
                </p>
                <p className="text-xs text-purple-400">do tempo</p>
              </div>
              <Target className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Production Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Produção por Hora</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="hour" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
                <Bar dataKey="caixa01" fill="#22c55e" name="Caixa 01" />
                <Bar dataKey="caixa02" fill="#3b82f6" name="Caixa 02" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Production Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição da Produção</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Active Stoppages */}
      {activeStoppages.length > 0 && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <span>Paradas Ativas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeStoppages.map((stoppage) => (
                <div key={stoppage.id} className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div>
                    <div className="font-medium text-red-400">{stoppage.sector}</div>
                    <div className="text-sm text-muted-foreground">{stoppage.reason}</div>
                    <div className="text-xs text-muted-foreground">
                      Iniciado em: {stoppage.start_time} - {new Date(stoppage.start_date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <Badge variant="destructive" className="animate-pulse-slow">
                    ATIVA
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Produtos Cadastrados</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Colaboradores</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Paradas Hoje</p>
                <p className="text-2xl font-bold">{stoppagesData.length}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
