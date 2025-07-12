
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, User } from 'lucide-react';
import { useProductionStore } from '@/store/productionStore';

const PackagingRegistry = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [employeeId, setEmployeeId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [batch, setBatch] = useState('');
  const [productId, setProductId] = useState('');

  const { 
    employees, 
    products, 
    addPackagingEntry, 
    getPackagingByDate 
  } = useProductionStore();
  
  const packagingEntries = getPackagingByDate(date);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !quantity || !batch) return;

    const employee = employees.find(emp => emp.id === employeeId);
    const product = products.find(prod => prod.id === productId);
    
    if (!employee) return;

    addPackagingEntry({
      date,
      employeeName: employee.name,
      quantity: parseInt(quantity),
      batch,
      product: product?.name
    });

    setEmployeeId('');
    setQuantity('');
    setBatch('');
    setProductId('');
  };

  // Filter out employees and products with empty values
  const validEmployees = employees.filter(emp => emp.id && emp.name && emp.id.trim() !== '' && emp.name.trim() !== '');
  const validProducts = products.filter(prod => prod.id && prod.name && prod.id.trim() !== '' && prod.name.trim() !== '');

  return (
    <div className="space-y-6">
      {/* Registration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-primary" />
            <span>Registro de Embalagens Carimbadas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <Label htmlFor="employee">Colaboradora</Label>
                <Select value={employeeId} onValueChange={setEmployeeId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a colaboradora" />
                  </SelectTrigger>
                  <SelectContent>
                    {validEmployees.length > 0 ? (
                      validEmployees
                        .filter(employee => employee.sector === 'embalagem')
                        .map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name}
                          </SelectItem>
                        ))
                    ) : (
                      <SelectItem value="no-employees" disabled>
                        Nenhuma colaboradora cadastrada
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="quantity">Quantidade (sacos)</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Ex: 500"
                  min="1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="batch">Lote da Embalagem</Label>
                <Input
                  id="batch"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  placeholder="Ex: 00001"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product">Produto (opcional)</Label>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não especificado</SelectItem>
                    {validProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - {product.weight}kg
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button type="submit" className="w-full md:w-auto" disabled={validEmployees.filter(emp => emp.sector === 'embalagem').length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Embalagem
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Packaging History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Registros de Embalagem - {new Date(date).toLocaleDateString('pt-BR')}</span>
            <Badge variant="outline">
              {packagingEntries.length} registros
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {packagingEntries.length > 0 ? (
            <div className="space-y-3">
              {packagingEntries.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-medium">{entry.employeeName}</span>
                      </div>
                      <Badge variant="outline">
                        Lote: {entry.batch}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {entry.quantity} sacos
                      </span>
                      {entry.product && (
                        <Badge variant="secondary">
                          {entry.product}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum registro de embalagem para esta data</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PackagingRegistry;
