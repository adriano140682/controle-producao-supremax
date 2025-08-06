
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Play, Square, Clock } from 'lucide-react';
import { useStoppages } from '@/hooks/useStoppages';
import { toast } from '@/hooks/use-toast';
import { getBrazilDateForInput, getBrazilTimeForInput } from '@/utils/dateUtils';

const StoppagesRegistry = () => {
  const [date, setDate] = useState(getBrazilDateForInput());
  const [time, setTime] = useState(getBrazilTimeForInput());
  const [sector, setSector] = useState('');
  const [reason, setReason] = useState('');

  const { stoppages, addStoppage, endStoppage } = useStoppages();

  const getStoppagesByDate = (date: string) => {
    return stoppages.filter(stoppage => stoppage.start_date === date);
  };

  const stoppagesForDate = getStoppagesByDate(date);
  const activeStoppages = stoppages.filter(s => s.is_active);

  const handleStartStoppage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sector || !reason) return;

    try {
      await addStoppage({
        start_date: date,
        start_time: time,
        sector: sector as 'caixa01' | 'caixa02' | 'embalagem',
        reason
      });

      toast({
        title: "Sucesso",
        description: "Parada registrada com sucesso!",
      });

      setSector('');
      setReason('');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao registrar parada. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleEndStoppage = async (stoppageId: string) => {
    const endTime = getBrazilTimeForInput();
    try {
      await endStoppage(stoppageId, endTime);
      toast({
        title: "Sucesso",
        description: "Parada encerrada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao encerrar parada. Tente novamente.",
        variant: "destructive",
      });
    }
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
                        Iniciado: {stoppage.start_time} - {new Date(stoppage.start_date).toLocaleDateString('pt-BR')}
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
                      <Badge variant={stoppage.is_active ? "destructive" : "outline"}>
                        {stoppage.sector.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{stoppage.reason}</span>
                      {stoppage.is_active ? (
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
                    <span>Início: {stoppage.start_time}</span>
                    {stoppage.end_time && (
                      <span className="ml-4">Fim: {stoppage.end_time}</span>
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
