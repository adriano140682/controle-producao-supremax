
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Package, Users, Settings } from 'lucide-react';
import { useProductionStore } from '@/store/productionStore';
import { toast } from '@/hooks/use-toast';

const SettingsTab = () => {
  const {
    products,
    employees,
    addProduct,
    updateProduct,
    deleteProduct,
    addEmployee,
    updateEmployee,
    deleteEmployee,
  } = useProductionStore();

  // Product form state
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [productFormData, setProductFormData] = useState({
    name: '',
    weightPerBag: '',
  });

  // Employee form state
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [employeeFormData, setEmployeeFormData] = useState({
    name: '',
  });

  // Product handlers
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productFormData.name || !productFormData.weightPerBag) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    const productData = {
      name: productFormData.name,
      weightPerBag: parseFloat(productFormData.weightPerBag),
    };

    if (editingProduct) {
      updateProduct(editingProduct, productData);
      toast({
        title: "Sucesso",
        description: "Produto atualizado",
      });
    } else {
      addProduct(productData);
      toast({
        title: "Sucesso",
        description: "Produto adicionado",
      });
    }

    resetProductForm();
  };

  const resetProductForm = () => {
    setProductFormData({ name: '', weightPerBag: '' });
    setEditingProduct(null);
    setIsProductDialogOpen(false);
  };

  const handleEditProduct = (product: any) => {
    setProductFormData({
      name: product.name,
      weightPerBag: product.weightPerBag.toString(),
    });
    setEditingProduct(product.id);
    setIsProductDialogOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduct(id);
      toast({
        title: "Sucesso",
        description: "Produto excluído",
      });
    }
  };

  // Employee handlers
  const handleEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeFormData.name) {
      toast({
        title: "Erro",
        description: "Informe o nome da colaboradora",
        variant: "destructive",
      });
      return;
    }

    const employeeData = {
      name: employeeFormData.name,
      sector: 'packaging' as const,
    };

    if (editingEmployee) {
      updateEmployee(editingEmployee, employeeData);
      toast({
        title: "Sucesso",
        description: "Colaboradora atualizada",
      });
    } else {
      addEmployee(employeeData);
      toast({
        title: "Sucesso",
        description: "Colaboradora adicionada",
      });
    }

    resetEmployeeForm();
  };

  const resetEmployeeForm = () => {
    setEmployeeFormData({ name: '' });
    setEditingEmployee(null);
    setIsEmployeeDialogOpen(false);
  };

  const handleEditEmployee = (employee: any) => {
    setEmployeeFormData({ name: employee.name });
    setEditingEmployee(employee.id);
    setIsEmployeeDialogOpen(true);
  };

  const handleDeleteEmployee = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta colaboradora?')) {
      deleteEmployee(id);
      toast({
        title: "Sucesso",
        description: "Colaboradora excluída",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-primary" />
            <span>Configurações do Sistema</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="products" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="products" className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Produtos</span>
              </TabsTrigger>
              <TabsTrigger value="employees" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Colaboradoras</span>
              </TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Package className="h-5 w-5 text-primary" />
                      <span>Cadastro de Produtos</span>
                    </CardTitle>
                    <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => resetProductForm()}>
                          <Plus className="h-4 w-4 mr-2" />
                          Novo Produto
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>
                            {editingProduct ? 'Editar' : 'Novo'} Produto
                          </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleProductSubmit} className="space-y-4">
                          <div>
                            <Label htmlFor="productName">Nome do Produto *</Label>
                            <Input
                              id="productName"
                              value={productFormData.name}
                              onChange={(e) => setProductFormData({...productFormData, name: e.target.value})}
                              placeholder="Ex: Ração Premium"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="weightPerBag">Peso por Saco (kg) *</Label>
                            <Input
                              id="weightPerBag"
                              type="number"
                              step="0.1"
                              min="0"
                              value={productFormData.weightPerBag}
                              onChange={(e) => setProductFormData({...productFormData, weightPerBag: e.target.value})}
                              placeholder="Ex: 30"
                              required
                            />
                          </div>

                          <div className="flex space-x-2">
                            <Button type="submit" className="flex-1">
                              {editingProduct ? 'Atualizar' : 'Adicionar'}
                            </Button>
                            <Button type="button" variant="outline" onClick={resetProductForm}>
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
                          <TableHead>Nome do Produto</TableHead>
                          <TableHead>Peso por Saco</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.weightPerBag} kg</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleEditProduct(product)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleDeleteProduct(product.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {products.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                              Nenhum produto cadastrado
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Employees Tab */}
            <TabsContent value="employees">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span>Cadastro de Colaboradoras</span>
                    </CardTitle>
                    <Dialog open={isEmployeeDialogOpen} onOpenChange={setIsEmployeeDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => resetEmployeeForm()}>
                          <Plus className="h-4 w-4 mr-2" />
                          Nova Colaboradora
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>
                            {editingEmployee ? 'Editar' : 'Nova'} Colaboradora
                          </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEmployeeSubmit} className="space-y-4">
                          <div>
                            <Label htmlFor="employeeName">Nome da Colaboradora *</Label>
                            <Input
                              id="employeeName"
                              value={employeeFormData.name}
                              onChange={(e) => setEmployeeFormData({...employeeFormData, name: e.target.value})}
                              placeholder="Ex: Maria Silva"
                              required
                            />
                          </div>

                          <div className="flex space-x-2">
                            <Button type="submit" className="flex-1">
                              {editingEmployee ? 'Atualizar' : 'Adicionar'}
                            </Button>
                            <Button type="button" variant="outline" onClick={resetEmployeeForm}>
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
                          <TableHead>Nome</TableHead>
                          <TableHead>Setor</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {employees.map((employee) => (
                          <TableRow key={employee.id}>
                            <TableCell className="font-medium">{employee.name}</TableCell>
                            <TableCell>
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">
                                Embalagem
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleEditEmployee(employee)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleDeleteEmployee(employee.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {employees.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                              Nenhuma colaboradora cadastrada
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
