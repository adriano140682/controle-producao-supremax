-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  production_type TEXT NOT NULL CHECK (production_type IN ('ração', 'mineral')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Function to create profile automatically when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, production_type)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'name', 'Usuário'),
    COALESCE(new.raw_user_meta_data ->> 'production_type', 'ração')
  );
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update existing tables to filter by production type
-- Add user_id to production_entries
ALTER TABLE public.production_entries ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Add user_id to packaging_entries  
ALTER TABLE public.packaging_entries ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Add user_id to stoppages
ALTER TABLE public.stoppages ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update RLS policies for production_entries
DROP POLICY IF EXISTS "Allow all operations on production_entries" ON public.production_entries;

CREATE POLICY "Users can view their production entries" 
ON public.production_entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their production entries" 
ON public.production_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their production entries" 
ON public.production_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their production entries" 
ON public.production_entries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Update RLS policies for packaging_entries
DROP POLICY IF EXISTS "Allow all operations on packaging_entries" ON public.packaging_entries;

CREATE POLICY "Users can view their packaging entries" 
ON public.packaging_entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their packaging entries" 
ON public.packaging_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their packaging entries" 
ON public.packaging_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their packaging entries" 
ON public.packaging_entries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Update RLS policies for stoppages
DROP POLICY IF EXISTS "Allow all operations on stoppages" ON public.stoppages;

CREATE POLICY "Users can view their stoppages" 
ON public.stoppages 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their stoppages" 
ON public.stoppages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their stoppages" 
ON public.stoppages 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their stoppages" 
ON public.stoppages 
FOR DELETE 
USING (auth.uid() = user_id);