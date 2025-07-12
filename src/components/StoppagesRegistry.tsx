
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Play, Square, Clock } from 'lucide-react';
import { useProductionStore } from '@/store/productionStore';

const StoppagesRegistry = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [sector, setSector] = useState('');
  const [reason, setReason] = useState('');

  const { 
    addStoppage, 
    endStoppage, 
    getStoppagesByDate, 
    stoppages 
  } = useProductionStore();

  const stoppagesForDate = getStoppagesByDate(date);
  const activeStoppages = stoppages.filter(s => s.isActive);

  const handleStartStoppage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sector || !reason) return;

    addStoppage({
      startDate: date,
      startTime: time,
      sector: sector as 'caixa01' | 'caixa02' | 'embalagem',
      reason
    });

    setSector('');
    setReason('');
  };

  const handleEndStoppage = (stoppageId: string) => {
    const endTime = new Date().toTimeString().slice(0, 5);
    endStoppage(stoppageId, endTime);
  };

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}min`;
  };

  const sectorOptions = [
    { value: 'caixa01', label: 'Caixa 01' },
    { value: 'caixa02', label: 'Caixa 02' },
    { value: 'embalagem', label: 'Embalagem' }
  ];

  return (
    <div className="space-y-6">
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
                <div key={stoppage.id} className="flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <Badge variant="destructive" className="animate-pulse">
                        {stoppage.sector.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{stoppage.reason}</span>
                      <span className="text-sm text-muted-foreground">
                        Iniciado: {stoppage.startTime} - {stoppage.startDate}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleEndStoppage(stoppage.id)}
                    variant="outline"
                    size="sm"
                    className="border-red-500/30 hover:bg-red-500/10"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Encerrar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Registration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <span>Registro de Paradas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleStartStoppage} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="time">Hora de Início</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="sector">Setor</Label>
                <Select value={sector} onValueChange={setSector} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="reason">Motivo da Parada</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Descreva o motivo da parada..."
                required
              />
            </div>
            
            <Button type="submit" className="w-full md:w-auto">
              <Play className="h-4 w-4 mr-2" />
              Iniciar Parada
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Stoppages History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Histórico de Paradas - {new Date(date).toLocaleDateString('pt-BR')}</span>
            <Badge variant="outline">
              {stoppagesForDate.length} registros
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stoppagesForDate.length > 0 ? (
            <div className="space-y-3">
              {stoppagesForDate.map((stoppage) => (
                <div key={stoppage.id} className="p-4 rounded-lg border bg-card/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Badge variant={stoppage.isActive ? "destructive" : "outline"}>
                        {stoppage.sector.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{stoppage.reason}</span>
                      {stoppage.isActive ? (
                        <Badge variant="destructive" className="animate-pulse">
                          ATIVA
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          ENCERRADA
                        </Badge>
                      )}
                    </div>
                    {stoppage.duration && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(stoppage.duration)}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <span>Início: {stoppage.startTime}</span>
                    {stoppage.endTime && (
                      <span className="ml-4">Fim: {stoppage.endTime}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma parada registrada para esta data</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StoppagesRegistry;
