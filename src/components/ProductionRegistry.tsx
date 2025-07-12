
import React, { useState } from 'react';
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
import { Plus, Edit, Trash2, Factory, Clock, Package } from 'lucide-react';
import { useProductionStore } from '@/store/productionStore';
import { toast } from '@/hooks/use-toast';

const ProductionRegistry = () => {
  const {
    productionEntries,
    products,
    addProductionEntry,
    updateProductionEntry,
    deleteProductionEntry,
  } = useProductionStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].slice(0, 5),
    caixa: '01' as '01' | '02',
    productId: '',
    quantity: '',
    observations: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productId || !formData.quantity) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const entryData = {
      ...formData,
      quantity: parseInt(formData.quantity),
    };

    if (editingEntry) {
      updateProductionEntry(editingEntry, entryData);
      toast({
        title: "Sucesso",
        description: "Registro de produção atualizado",
      });
    } else {
      addProductionEntry(entryData);
      toast({
        title: "Sucesso",
        description: "Registro de produção adicionado",
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].slice(0, 5),
      caixa: '01',
      productId: '',
      quantity: '',
      observations: '',
    });
    setEditingEntry(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (entry: any) => {
    setFormData({
      date: entry.date,
      time: entry.time,
      caixa: entry.caixa,
      productId: entry.productId,
      quantity: entry.quantity.toString(),
      observations: entry.observations || '',
    });
    setEditingEntry(entry.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      deleteProductionEntry(id);
      toast({
        title: "Sucesso",
        description: "Registro excluído",
      });
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Produto não encontrado';
  };

  const calculateTotals = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = productionEntries.filter(entry => entry.date === today);
    
    const caixa01Total = todayEntries
      .filter(entry => entry.caixa === '01')
      .reduce((sum, entry) => sum + entry.quantity, 0);
    
    const caixa02Total = todayEntries
      .filter(entry => entry.caixa === '02')
      .reduce((sum, entry) => sum + entry.quantity, 0);

    return { caixa01Total, caixa02Total, total: caixa01Total + caixa02Total };
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header with Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Caixa 01 - Hoje</p>
                <p className="text-2xl font-bold text-green-400">{totals.caixa01Total}</p>
              </div>
              <Factory className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Caixa 02 - Hoje</p>
                <p className="text-2xl font-bold text-blue-400">{totals.caixa02Total}</p>
              </div>
              <Factory className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total - Hoje</p>
                <p className="text-2xl font-bold text-purple-400">{totals.total}</p>
              </div>
              <Package className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Registry Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Factory className="h-5 w-5 text-primary" />
              <span>Registro de Produção (Ensacamento)</span>
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Registro
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingEntry ? 'Editar' : 'Novo'} Registro de Produção
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Data *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Hora *</Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="caixa">Caixa *</Label>
                    <Select 
                      value={formData.caixa} 
                      onValueChange={(value: '01' | '02') => setFormData({...formData, caixa: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a caixa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="01">Caixa 01</SelectItem>
                        <SelectItem value="02">Caixa 02</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="product">Produto *</Label>
                    <Select 
                      value={formData.productId} 
                      onValueChange={(value) => setFormData({...formData, productId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - {product.weightPerBag}kg
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="quantity">Quantidade de Sacos *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      placeholder="Ex: 100"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="observations">Observações</Label>
                    <Textarea
                      id="observations"
                      value={formData.observations}
                      onChange={(e) => setFormData({...formData, observations: e.target.value})}
                      placeholder="Observações opcionais..."
                      rows={3}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button type="submit" className="flex-1">
                      {editingEntry ? 'Atualizar' : 'Registrar'}
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
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Caixa</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productionEntries
                  .sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime())
                  .map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {new Date(entry.date).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="text-sm text-muted-foreground">{entry.time}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.caixa === '01' ? 'default' : 'secondary'}>
                        Caixa {entry.caixa}
                      </Badge>
                    </TableCell>
                    <TableCell>{getProductName(entry.productId)}</TableCell>
                    <TableCell>
                      <span className="font-medium">{entry.quantity}</span> sacos
                    </TableCell>
                    <TableCell>{entry.observations || '-'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEdit(entry)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDelete(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {productionEntries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum registro de produção encontrado
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

export default ProductionRegistry;
