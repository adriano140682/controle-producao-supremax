-- Remove RLS policies that require authentication since we removed the login system

-- Drop existing restrictive policies for production_entries
DROP POLICY IF EXISTS "Users can view their production entries" ON public.production_entries;
DROP POLICY IF EXISTS "Users can insert their production entries" ON public.production_entries;
DROP POLICY IF EXISTS "Users can update their production entries" ON public.production_entries;
DROP POLICY IF EXISTS "Users can delete their production entries" ON public.production_entries;

-- Drop existing restrictive policies for packaging_entries
DROP POLICY IF EXISTS "Users can view their packaging entries" ON public.packaging_entries;
DROP POLICY IF EXISTS "Users can insert their packaging entries" ON public.packaging_entries;
DROP POLICY IF EXISTS "Users can update their packaging entries" ON public.packaging_entries;
DROP POLICY IF EXISTS "Users can delete their packaging entries" ON public.packaging_entries;

-- Drop existing restrictive policies for stoppages
DROP POLICY IF EXISTS "Users can view their stoppages" ON public.stoppages;
DROP POLICY IF EXISTS "Users can insert their stoppages" ON public.stoppages;
DROP POLICY IF EXISTS "Users can update their stoppages" ON public.stoppages;
DROP POLICY IF EXISTS "Users can delete their stoppages" ON public.stoppages;

-- Create new permissive policies that allow all operations
CREATE POLICY "Allow all operations on production_entries" ON public.production_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on packaging_entries" ON public.packaging_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on stoppages" ON public.stoppages FOR ALL USING (true) WITH CHECK (true);