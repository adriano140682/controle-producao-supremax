
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Factory, Package, Plus } from 'lucide-react';
import { useProductionEntries } from '@/hooks/useProductionEntries';
import { useProducts } from '@/hooks/useProducts';
import { toast } from '@/hooks/use-toast';

const ProductionRegistry = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [box, setBox] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [observations, setObservations] = useState('');

  const { products } = useProducts();
  const { entries: productionEntries, addEntry } = useProductionEntries();
  
  const getProductionByDate = (date: string) => {
    return productionEntries.filter(entry => entry.date === date);
  };
  
  const todayEntries = getProductionByDate(date);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!box || !productId || !quantity) return;

    const product = products.find(p => p.id === productId);
    if (!product) return;

    try {
      await addEntry({
        date,
        time,
        box: box as 'caixa01' | 'caixa02',
        product_name: product.name,
        product_id: productId,
        quantity: parseInt(quantity),
        observations: observations || null
      });

      toast({
        title: "Sucesso",
        description: "Produção registrada com sucesso!",
      });

      setBox('');
      setProductId('');
      setQuantity('');
      setObservations('');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao registrar produção. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Filter out any products with empty names or IDs
  const validProducts = products.filter(product => product.id && product.name && product.id.trim() !== '' && product.name.trim() !== '');

  return (
    <div className="space-y-6">
      {/* Registration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Factory className="h-5 w-5 text-primary" />
            <span>Registro de Produção - Ensacamento</span>
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
                <Label htmlFor="time">Hora</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="box">Caixa</Label>
                <Select value={box} onValueChange={setBox} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a caixa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="caixa01">Caixa 01</SelectItem>
                    <SelectItem value="caixa02">Caixa 02</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="product">Produto</Label>
                <Select value={productId} onValueChange={setProductId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {validProducts.length > 0 ? (
                      validProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - {product.weight}kg
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-products" disabled>
                        Nenhum produto cadastrado
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantidade (sacos)</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Ex: 100"
                  min="1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="observations">Observações (opcional)</Label>
                <Textarea
                  id="observations"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Observações sobre a produção..."
                  rows={2}
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full md:w-auto" disabled={validProducts.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Produção
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Production History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Registros de Produção - {new Date(date).toLocaleDateString('pt-BR')}</span>
            <Badge variant="outline">
              {todayEntries.length} registros
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayEntries.length > 0 ? (
            <div className="space-y-3">
              {todayEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <Badge variant={entry.box === 'caixa01' ? 'default' : 'secondary'}>
                        {entry.box === 'caixa01' ? 'Caixa 01' : 'Caixa 02'}
                      </Badge>
                      <span className="font-medium">{entry.product_name}</span>
                      <span className="text-sm text-muted-foreground">
                        {entry.quantity} sacos
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {entry.time}
                      </span>
                    </div>
                    {entry.observations && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {entry.observations}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum registro de produção para esta data</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionRegistry;
