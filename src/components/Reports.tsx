import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Download, 
  Calendar, 
  Factory,
  Package,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { useProductionStore } from '@/store/productionStore';
import { toast } from '@/hooks/use-toast';

const Reports = () => {
  const {
    productionEntries,
    packagingEntries,
    stoppages,
    products,
    employees,
    getProductionByDate,
    getPackagingByDate,
    getStoppagesByDate,
  } = useProductionStore();

  const [reportType, setReportType] = useState<'day' | 'week' | 'custom'>('day');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const getDateRange = () => {
    const today = new Date();
    let start = new Date(startDate);
    let end = new Date(endDate);

    switch (reportType) {
      case 'day':
        start = end = new Date(startDate);
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        start = weekStart;
        end = weekEnd;
        break;
      case 'custom':
        start = new Date(startDate);
        end = new Date(endDate);
        break;
    }

    return { start, end };
  };

  const generateReportData = () => {
    const { start, end } = getDateRange();
    const dates = [];
    const current = new Date(start);

    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    const reportData = {
      period: {
        start: start.toLocaleDateString('pt-BR'),
        end: end.toLocaleDateString('pt-BR'),
        type: reportType
      },
      production: {
        total: { caixa01: 0, caixa02: 0, combined: 0 },
        byDate: dates.map(date => {
          const entries = getProductionByDate(date);
          const caixa01 = entries.filter(e => e.box === 'caixa01').reduce((sum, e) => sum + e.quantity, 0);
          const caixa02 = entries.filter(e => e.box === 'caixa02').reduce((sum, e) => sum + e.quantity, 0);
          return {
            date: new Date(date).toLocaleDateString('pt-BR'),
            caixa01,
            caixa02,
            total: caixa01 + caixa02
          };
        }),
        byProduct: products.map(product => {
          const totalQuantity = dates.reduce((sum, date) => {
            const entries = getProductionByDate(date).filter(e => e.product === product.name);
            return sum + entries.reduce((entrySum, e) => entrySum + e.quantity, 0);
          }, 0);
          
          return {
            name: product.name,
            weight: product.weight,
            quantity: totalQuantity,
            totalWeight: totalQuantity * product.weight
          };
        }).filter(p => p.quantity > 0)
      },
      packaging: {
        total: 0,
        byEmployee: employees.map(employee => {
          const totalQuantity = dates.reduce((sum, date) => {
            const entries = getPackagingByDate(date).filter(e => e.employeeName === employee.name);
            return sum + entries.reduce((entrySum, e) => entrySum + e.quantity, 0);
          }, 0);
          
          const batches = dates.reduce((batches, date) => {
            const entries = getPackagingByDate(date).filter(e => e.employeeName === employee.name);
            return [...batches, ...entries.map(e => e.batch)];
          }, [] as string[]);
          
          return {
            name: employee.name,
            quantity: totalQuantity,
            batches: [...new Set(batches)]
          };
        }).filter(e => e.quantity > 0)
      },
      stoppages: {
        total: 0,
        totalTime: 0,
        bySector: ['Caixa 01', 'Caixa 02', 'Embalagem'].map(sector => {
          const sectorStoppages = dates.reduce((stoppages, date) => {
            return [...stoppages, ...getStoppagesByDate(date).filter(s => s.sector === sector)];
          }, [] as any[]);
          
          const totalTime = sectorStoppages
            .filter(s => s.duration)
            .reduce((sum, s) => sum + s.duration, 0);
          
          return {
            sector,
            count: sectorStoppages.length,
            totalTime,
            avgTime: sectorStoppages.length > 0 ? totalTime / sectorStoppages.length : 0,
            reasons: sectorStoppages.map(s => s.reason)
          };
        }),
        list: dates.reduce((stoppages, date) => {
          return [...stoppages, ...getStoppagesByDate(date)];
        }, [] as any[])
      }
    };

    // Calculate totals
    reportData.production.total = reportData.production.byDate.reduce(
      (acc, day) => ({
        caixa01: acc.caixa01 + day.caixa01,
        caixa02: acc.caixa02 + day.caixa02,
        combined: acc.combined + day.total
      }),
      { caixa01: 0, caixa02: 0, combined: 0 }
    );

    reportData.packaging.total = reportData.packaging.byEmployee.reduce(
      (sum, emp) => sum + emp.quantity, 0
    );

    reportData.stoppages.total = reportData.stoppages.list.length;
    reportData.stoppages.totalTime = reportData.stoppages.list
      .filter(s => s.duration)
      .reduce((sum, s) => sum + s.duration, 0);

    return reportData;
  };

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const exportToPDF = () => {
    const reportData = generateReportData();
    
    // Simulate PDF generation
    toast({
      title: "Relatório PDF",
      description: "Funcionalidade em desenvolvimento. Use a exportação para Excel.",
    });
  };

  const exportToExcel = () => {
    const reportData = generateReportData();
    
    // Create CSV content
    let csvContent = "RELATÓRIO DE PRODUÇÃO DE RAÇÃO\n";
    csvContent += `Período: ${reportData.period.start} a ${reportData.period.end}\n`;
    csvContent += `Tipo: ${reportData.period.type === 'day' ? 'Diário' : reportData.period.type === 'week' ? 'Semanal' : 'Personalizado'}\n\n`;
    
    csvContent += "=== PRODUÇÃO (ENSACAMENTO) ===\n";
    csvContent += "Data;Caixa 01;Caixa 02;Total\n";
    reportData.production.byDate.forEach(day => {
      csvContent += `${day.date};${day.caixa01};${day.caixa02};${day.total}\n`;
    });
    csvContent += `TOTAL;${reportData.production.total.caixa01};${reportData.production.total.caixa02};${reportData.production.total.combined}\n\n`;
    
    csvContent += "=== PRODUÇÃO POR PRODUTO ===\n";
    csvContent += "Produto;Peso/Saco;Quantidade;Peso Total (kg)\n";
    reportData.production.byProduct.forEach(product => {
      csvContent += `${product.name};${product.weight};${product.quantity};${product.totalWeight}\n`;
    });
    csvContent += "\n";
    
    csvContent += "=== EMBALAGENS CARIMBADAS ===\n";
    csvContent += "Colaboradora;Quantidade;Lotes\n";
    reportData.packaging.byEmployee.forEach(emp => {
      csvContent += `${emp.name};${emp.quantity};"${emp.batches.join(', ')}"\n`;
    });
    csvContent += `TOTAL;${reportData.packaging.total};\n\n`;
    
    csvContent += "=== PARADAS ===\n";
    csvContent += "Setor;Quantidade;Tempo Total;Tempo Médio\n";
    reportData.stoppages.bySector.forEach(sector => {
      csvContent += `${sector.sector};${sector.count};${formatDuration(sector.totalTime)};${formatDuration(sector.avgTime)}\n`;
    });
    csvContent += `TOTAL;${reportData.stoppages.total};${formatDuration(reportData.stoppages.totalTime)};\n\n`;
    
    csvContent += "=== DETALHES DAS PARADAS ===\n";
    csvContent += "Data;Setor;Motivo;Duração\n";
    reportData.stoppages.list.forEach(stoppage => {
      csvContent += `${new Date(stoppage.startDate).toLocaleDateString('pt-BR')};${stoppage.sector};"${stoppage.reason}";${stoppage.duration ? formatDuration(stoppage.duration) : 'Em andamento'}\n`;
    });

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_producao_${reportData.period.start.replace(/\//g, '-')}_${reportData.period.end.replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Sucesso",
      description: "Relatório exportado com sucesso!",
    });
  };

  const reportData = generateReportData();

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Gerar Relatórios</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <Label htmlFor="reportType">Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={(value: 'day' | 'week' | 'custom') => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Diário</SelectItem>
                  <SelectItem value="week">Semanal</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(reportType === 'day' || reportType === 'custom') && (
              <div>
                <Label htmlFor="startDate">
                  {reportType === 'day' ? 'Data' : 'Data Inicial'}
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            )}
            
            {reportType === 'custom' && (
              <div>
                <Label htmlFor="endDate">Data Final</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            )}
            
            <div className="flex space-x-2">
              <Button onClick={exportToExcel} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button onClick={exportToPDF} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Prévia do Relatório</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Período: {reportData.period.start} a {reportData.period.end}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Production Summary */}
          <div>
            <h3 className="flex items-center space-x-2 text-lg font-semibold mb-4">
              <Factory className="h-5 w-5 text-green-500" />
              <span>Produção (Ensacamento)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-400">{reportData.production.total.caixa01}</p>
                  <p className="text-sm text-muted-foreground">Caixa 01</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-blue-400">{reportData.production.total.caixa02}</p>
                  <p className="text-sm text-muted-foreground">Caixa 02</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-purple-400">{reportData.production.total.combined}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </CardContent>
              </Card>
            </div>
            
            {reportData.production.byProduct.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Por Produto:</h4>
                <div className="space-y-2">
                  {reportData.production.byProduct.map((product, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <span>{product.name}</span>
                      <span className="font-medium">{product.quantity} sacos ({product.totalWeight}kg)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Packaging Summary */}
          <div>
            <h3 className="flex items-center space-x-2 text-lg font-semibold mb-4">
              <Package className="h-5 w-5 text-blue-500" />
              <span>Embalagens Carimbadas</span>
            </h3>
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 mb-4">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-400">{reportData.packaging.total}</p>
                <p className="text-sm text-muted-foreground">Total de Sacos</p>
              </CardContent>
            </Card>
            
            {reportData.packaging.byEmployee.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Por Colaboradora:</h4>
                <div className="space-y-2">
                  {reportData.packaging.byEmployee.map((employee, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <span>{employee.name}</span>
                      <span className="font-medium">{employee.quantity} sacos</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Stoppages Summary */}
          <div>
            <h3 className="flex items-center space-x-2 text-lg font-semibold mb-4">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Paradas</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-red-400">{reportData.stoppages.total}</p>
                  <p className="text-sm text-muted-foreground">Total de Paradas</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-400">
                    {Math.round(reportData.stoppages.totalTime / (1000 * 60))}m
                  </p>
                  <p className="text-sm text-muted-foreground">Tempo Total</p>
                </CardContent>
              </Card>
            </div>
            
            {reportData.stoppages.bySector.some(s => s.count > 0) && (
              <div>
                <h4 className="font-medium mb-2">Por Setor:</h4>
                <div className="space-y-2">
                  {reportData.stoppages.bySector
                    .filter(sector => sector.count > 0)
                    .map((sector, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <span>{sector.sector}</span>
                      <span className="font-medium">
                        {sector.count} paradas - {formatDuration(sector.totalTime)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
