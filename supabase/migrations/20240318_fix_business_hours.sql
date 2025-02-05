-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view their own business hours" ON business_hours;
DROP POLICY IF EXISTS "Users can insert their own business hours" ON business_hours;
DROP POLICY IF EXISTS "Users can update their own business hours" ON business_hours;

-- Recriar a tabela com a estrutura correta
DROP TABLE IF EXISTS business_hours;
CREATE TABLE business_hours (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    starttime TIME NOT NULL DEFAULT '09:00',
    endtime TIME NOT NULL DEFAULT '18:00',
    daysoff INTEGER[] NOT NULL DEFAULT '{0}',
    lunchbreak JSONB,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(owner_id)
);

-- Habilitar RLS
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Enable all operations for authenticated users"
ON business_hours
FOR ALL
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS business_hours_owner_id_idx ON business_hours(owner_id);

-- Trigger para atualizar o updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_business_hours_updated_at
    BEFORE UPDATE
    ON business_hours
    FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column(); 