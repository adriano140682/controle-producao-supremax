
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Settings, Trash2, Edit, Package, Users } from 'lucide-react';
import { useProductionStore } from '@/store/productionStore';
import { toast } from '@/hooks/use-toast';

const SettingsTab = () => {
  // Product form state
  const [productName, setProductName] = useState('');
  const [productWeight, setProductWeight] = useState('');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  // Employee form state
  const [employeeName, setEmployeeName] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);

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

  // Product handlers
  const handleAddProduct = () => {
    if (!productName.trim() || !productWeight) return;

    const weightNum = parseFloat(productWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      toast({
        title: "Erro",
        description: "Peso deve ser um número positivo",
        variant: "destructive",
      });
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct, {
        name: productName.trim(),
        weight: weightNum,
      });
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso!",
      });
      setEditingProduct(null);
    } else {
      addProduct({
        name: productName.trim(),
        weight: weightNum,
      });
      toast({
        title: "Sucesso",
        description: "Produto adicionado com sucesso!",
      });
    }

    setProductName('');
    setProductWeight('');
  };

  const handleEditProduct = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      setProductName(product.name);
      setProductWeight(product.weight.toString());
      setEditingProduct(id);
    }
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
    toast({
      title: "Sucesso",
      description: "Produto removido com sucesso!",
    });
  };

  const cancelProductEdit = () => {
    setProductName('');
    setProductWeight('');
    setEditingProduct(null);
  };

  // Employee handlers
  const handleAddEmployee = () => {
    if (!employeeName.trim()) return;

    if (editingEmployee) {
      updateEmployee(editingEmployee, {
        name: employeeName.trim(),
        sector: 'embalagem',
      });
      toast({
        title: "Sucesso",
        description: "Colaboradora atualizada com sucesso!",
      });
      setEditingEmployee(null);
    } else {
      addEmployee({
        name: employeeName.trim(),
        sector: 'embalagem',
      });
      toast({
        title: "Sucesso",
        description: "Colaboradora adicionada com sucesso!",
      });
    }

    setEmployeeName('');
  };

  const handleEditEmployee = (id: string) => {
    const employee = employees.find(e => e.id === id);
    if (employee) {
      setEmployeeName(employee.name);
      setEditingEmployee(id);
    }
  };

  const handleDeleteEmployee = (id: string) => {
    deleteEmployee(id);
    toast({
      title: "Sucesso",
      description: "Colaboradora removida com sucesso!",
    });
  };

  const cancelEmployeeEdit = () => {
    setEmployeeName('');
    setEditingEmployee(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-primary" />
            <span>Configurações do Sistema</span>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-green-500" />
              <span>Gestão de Produtos</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add/Edit Product Form */}
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium">
                {editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="productName">Nome do Produto</Label>
                  <Input
                    id="productName"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Ex: Ração Premium"
                  />
                </div>
                
                <div>
                  <Label htmlFor="productWeight">Peso por Saco (kg)</Label>
                  <Input
                    id="productWeight"
                    type="number"
                    value={productWeight}
                    onChange={(e) => setProductWeight(e.target.value)}
                    placeholder="Ex: 25"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleAddProduct} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  {editingProduct ? 'Atualizar' : 'Adicionar'}
                </Button>
                {editingProduct && (
                  <Button variant="outline" onClick={cancelProductEdit}>
                    Cancelar
                  </Button>
                )}
              </div>
            </div>

            {/* Products List */}
            <div className="space-y-2">
              <h4 className="font-medium">Produtos Cadastrados ({products.length})</h4>
              {products.length > 0 ? (
                <div className="space-y-2">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.weight}kg por saco</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProduct(product.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  Nenhum produto cadastrado
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Employees Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span>Gestão de Colaboradoras</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add/Edit Employee Form */}
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium">
                {editingEmployee ? 'Editar Colaboradora' : 'Adicionar Nova Colaboradora'}
              </h4>
              
              <div>
                <Label htmlFor="employeeName">Nome da Colaboradora</Label>
                <Input
                  id="employeeName"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="Ex: Maria Silva"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleAddEmployee} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  {editingEmployee ? 'Atualizar' : 'Adicionar'}
                </Button>
                {editingEmployee && (
                  <Button variant="outline" onClick={cancelEmployeeEdit}>
                    Cancelar
                  </Button>
                )}
              </div>
            </div>

            {/* Employees List */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center justify-between">
                <span>Colaboradoras Cadastradas ({employees.length})</span>
                <Badge variant="secondary">Setor: Embalagem</Badge>
              </h4>
              {employees.length > 0 ? (
                <div className="space-y-2">
                  {employees.map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Setor: {employee.sector === 'embalagem' ? 'Embalagem' : employee.sector}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditEmployee(employee.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteEmployee(employee.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  Nenhuma colaboradora cadastrada
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-green-400">{products.length}</p>
              <p className="text-sm text-muted-foreground">Produtos Cadastrados</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-blue-400">{employees.length}</p>
              <p className="text-sm text-muted-foreground">Colaboradoras Ativas</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-purple-400">v1.0</p>
              <p className="text-sm text-muted-foreground">Versão do Sistema</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
