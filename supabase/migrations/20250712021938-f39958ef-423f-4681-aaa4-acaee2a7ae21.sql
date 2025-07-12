
-- Criar tabela de produtos
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  weight DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de funcionários
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sector TEXT NOT NULL DEFAULT 'embalagem',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de entradas de produção
CREATE TABLE public.production_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  time TIME NOT NULL,
  box TEXT NOT NULL CHECK (box IN ('caixa01', 'caixa02')),
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  observations TEXT,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de entradas de embalagem
CREATE TABLE public.packaging_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  employee_id UUID REFERENCES public.employees(id),
  employee_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  batch TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de paradas
CREATE TABLE public.stoppages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sector TEXT NOT NULL CHECK (sector IN ('caixa01', 'caixa02', 'embalagem')),
  start_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_date DATE,
  end_time TIME,
  reason TEXT NOT NULL,
  duration BIGINT,
  timestamp BIGINT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS (Row Level Security) para todas as tabelas
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packaging_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stoppages ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para permitir acesso a todos os dados (sistema interno)
CREATE POLICY "Allow all operations on products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on production_entries" ON public.production_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on packaging_entries" ON public.packaging_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on stoppages" ON public.stoppages FOR ALL USING (true) WITH CHECK (true);

-- Inserir dados iniciais
INSERT INTO public.products (name, weight) VALUES 
  ('Ração Premium', 30.00),
  ('Proteinado Bovino', 25.00);

INSERT INTO public.employees (name, sector) VALUES 
  ('Jeiza Vieira', 'embalagem'),
  ('Cristina Vargas', 'embalagem');
