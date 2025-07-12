
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Edit, Trash2, Package, User, Hash } from 'lucide-react';
import { useProductionStore } from '@/store/productionStore';
import { toast } from '@/hooks/use-toast';

const PackagingRegistry = () => {
  const {
    packagingEntries,
    employees,
    products,
    addPackagingEntry,
    updatePackagingEntry,
    deletePackagingEntry,
  } = useProductionStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    employeeId: '',
    quantity: '',
    batchNumber: '',
    productId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.quantity || !formData.batchNumber) {
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
      updatePackagingEntry(editingEntry, entryData);
      toast({
        title: "Sucesso",
        description: "Registro de embalagem atualizado",
      });
    } else {
      addPackagingEntry(entryData);
      toast({
        title: "Sucesso",
        description: "Registro de embalagem adicionado",
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      employeeId: '',
      quantity: '',
      batchNumber: '',
      productId: '',
    });
    setEditingEntry(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (entry: any) => {
    setFormData({
      date: entry.date,
      employeeId: entry.employeeId,
      quantity: entry.quantity.toString(),
      batchNumber: entry.batchNumber,
      productId: entry.productId || '',
    });
    setEditingEntry(entry.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      deletePackagingEntry(id);
      toast({
        title: "Sucesso",
        description: "Registro excluído",
      });
    }
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? employee.name : 'Colaborador não encontrado';
  };

  const getProductName = (productId: string) => {
    if (!productId) return '-';
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Produto não encontrado';
  };

  const calculateTodayTotal = () => {
    const today = new Date().toISOString().split('T')[0];
    return packagingEntries
      .filter(entry => entry.date === today)
      .reduce((sum, entry) => sum + entry.quantity, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Carimbado Hoje</p>
                <p className="text-2xl font-bold text-blue-400">{calculateTodayTotal()}</p>
                <p className="text-xs text-blue-400">sacos</p>
              </div>
              <Package className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Colaboradores Ativos</p>
                <p className="text-2xl font-bold text-green-400">{employees.length}</p>
                <p className="text-xs text-green-400">registrados</p>
              </div>
              <User className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Packaging Registry Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary" />
              <span>Registro de Embalagens Carimbadas</span>
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
                    {editingEntry ? 'Editar' : 'Novo'} Registro de Embalagem
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <Label htmlFor="employee">Colaboradora *</Label>
                    <Select 
                      value={formData.employeeId} 
                      onValueChange={(value) => setFormData({...formData, employeeId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a colaboradora" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name}
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
                      placeholder="Ex: 1000"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="batchNumber">Lote da Embalagem *</Label>
                    <Input
                      id="batchNumber"
                      value={formData.batchNumber}
                      onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                      placeholder="Ex: 00001"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="product">Produto (Opcional)</Label>
                    <Select 
                      value={formData.productId} 
                      onValueChange={(value) => setFormData({...formData, productId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o produto (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhum produto</SelectItem>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - {product.weightPerBag}kg
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  <TableHead>Data</TableHead>
                  <TableHead>Colaboradora</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packagingEntries
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="font-medium">
                        {new Date(entry.date).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{getEmployeeName(entry.employeeId)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{entry.quantity}</span> sacos
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline">
                          {entry.batchNumber}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{getProductName(entry.productId)}</TableCell>
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
                {packagingEntries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum registro de embalagem encontrado
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

export default PackagingRegistry;
