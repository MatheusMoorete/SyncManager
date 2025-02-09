-- Drop existing table if exists
DROP TABLE IF EXISTS "public"."loyalty_points";

-- Create loyalty_points table
CREATE TABLE "public"."loyalty_points" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    points_earned INTEGER NOT NULL DEFAULT 0,
    points_spent INTEGER NOT NULL DEFAULT 0,
    createdAt TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(client_id)
);

-- Enable RLS
ALTER TABLE "public"."loyalty_points" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Owners can view their loyalty points"
ON "public"."loyalty_points"
FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert their loyalty points"
ON "public"."loyalty_points"
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their loyalty points"
ON "public"."loyalty_points"
FOR UPDATE
USING (auth.uid() = owner_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_loyalty_points_updated_at
    BEFORE UPDATE ON public.loyalty_points
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Drop points_history if exists
DROP TABLE IF EXISTS "public"."points_history";

-- Create points_history table
CREATE TABLE "public"."points_history" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    points INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('earned', 'spent', 'expired', 'adjusted')),
    description TEXT,
    createdAt TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on points_history
ALTER TABLE "public"."points_history" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for points_history
CREATE POLICY "Owners can view their points history"
ON "public"."points_history"
FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert points history"
ON "public"."points_history"
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Create indexes for faster queries
CREATE INDEX points_history_client_id_idx ON public.points_history(client_id);
CREATE INDEX points_history_appointment_id_idx ON public.points_history(appointment_id); 