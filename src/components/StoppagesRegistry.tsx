
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle, Play, Square, Clock, Trash2 } from 'lucide-react';
import { useProductionStore } from '@/store/productionStore';
import { toast } from '@/hooks/use-toast';

const StoppagesRegistry = () => {
  const {
    stoppages,
    startStoppage,
    endStoppage,
    deleteStoppage,
  } = useProductionStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    sector: 'Caixa 01' as 'Caixa 01' | 'Caixa 02' | 'Embalagem',
    startDate: new Date().toISOString().split('T')[0],
    startTime: new Date().toTimeString().split(' ')[0].slice(0, 5),
    reason: '',
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reason.trim()) {
      toast({
        title: "Erro",
        description: "Informe o motivo da parada",
        variant: "destructive",
      });
      return;
    }

    startStoppage(formData);
    toast({
      title: "Parada Iniciada",
      description: `Parada registrada no setor ${formData.sector}`,
      variant: "destructive",
    });

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      sector: 'Caixa 01',
      startDate: new Date().toISOString().split('T')[0],
      startTime: new Date().toTimeString().split(' ')[0].slice(0, 5),
      reason: '',
    });
    setIsDialogOpen(false);
  };

  const handleEndStoppage = (id: string) => {
    endStoppage(id);
    toast({
      title: "Parada Encerrada",
      description: "Parada encerrada com sucesso",
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      deleteStoppage(id);
      toast({
        title: "Sucesso",
        description: "Registro excluído",
      });
    }
  };

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getActiveDuration = (stoppage: any) => {
    if (!stoppage.isActive) return null;
    const startDateTime = new Date(`${stoppage.startDate} ${stoppage.startTime}`);
    const duration = currentTime.getTime() - startDateTime.getTime();
    return formatDuration(duration);
  };

  const activeStoppages = stoppages.filter(s => s.isActive);
  const completedStoppages = stoppages.filter(s => !s.isActive);

  const getTotalStoppageTime = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayStoppages = stoppages.filter(s => s.startDate === today && !s.isActive);
    return todayStoppages.reduce((sum, s) => sum + (s.duration || 0), 0);
  };

  return (
    <div className="space-y-6">
      {/* Active Stoppages Alert */}
      {activeStoppages.length > 0 && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-400">
              <AlertTriangle className="h-5 w-5 animate-pulse-slow" />
              <span>Paradas Ativas ({activeStoppages.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {activeStoppages.map((stoppage) => (
                <div key={stoppage.id} className="flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant="destructive" className="animate-pulse-slow">
                        {stoppage.sector}
                      </Badge>
                      <span className="font-medium">{stoppage.reason}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Iniciado em: {stoppage.startTime} - {new Date(stoppage.startDate).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-lg font-bold text-red-400 mt-1">
                      Duração: {getActiveDuration(stoppage)}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleEndStoppage(stoppage.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Encerrar Parada
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Paradas Ativas</p>
                <p className="text-2xl font-bold text-red-400">{activeStoppages.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tempo Total Hoje</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {Math.round(getTotalStoppageTime() / (1000 * 60))}m
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-500/10 to-gray-500/5 border-gray-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Paradas</p>
                <p className="text-2xl font-bold text-gray-400">{stoppages.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stoppage Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <span>Registro de Paradas</span>
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" onClick={() => resetForm()}>
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Parada
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Registrar Nova Parada</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="sector">Setor *</Label>
                    <Select 
                      value={formData.sector} 
                      onValueChange={(value: 'Caixa 01' | 'Caixa 02' | 'Embalagem') => 
                        setFormData({...formData, sector: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o setor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Caixa 01">Caixa 01</SelectItem>
                        <SelectItem value="Caixa 02">Caixa 02</SelectItem>
                        <SelectItem value="Embalagem">Embalagem</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Data *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="startTime">Hora *</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reason">Motivo da Parada *</Label>
                    <Textarea
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => setFormData({...formData, reason: e.target.value})}
                      placeholder="Descreva o motivo da parada..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button type="submit" variant="destructive" className="flex-1">
                      Iniciar Parada
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>Data/Hora Início</TableHead>
                  <TableHead>Data/Hora Fim</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stoppages
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .map((stoppage) => (
                  <TableRow key={stoppage.id}>
                    <TableCell>
                      <Badge 
                        variant={stoppage.isActive ? "destructive" : "secondary"}
                        className={stoppage.isActive ? "animate-pulse-slow" : ""}
                      >
                        {stoppage.isActive ? 'ATIVA' : 'ENCERRADA'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{stoppage.sector}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {new Date(stoppage.startDate).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-sm text-muted-foreground">{stoppage.startTime}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {stoppage.endDate && stoppage.endTime ? (
                        <div>
                          <div className="font-medium">
                            {new Date(stoppage.endDate).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="text-sm text-muted-foreground">{stoppage.endTime}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {stoppage.isActive ? (
                        <div className="font-medium text-red-400">
                          {getActiveDuration(stoppage)}
                        </div>
                      ) : stoppage.duration ? (
                        <div className="font-medium">
                          {formatDuration(stoppage.duration)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={stoppage.reason}>
                        {stoppage.reason}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {stoppage.isActive ? (
                          <Button 
                            size="sm" 
                            onClick={() => handleEndStoppage(stoppage.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDelete(stoppage.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {stoppages.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhuma parada registrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoppagesRegistry;
