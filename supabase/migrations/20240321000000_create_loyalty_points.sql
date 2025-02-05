CREATE TABLE "public"."loyalty_points" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 0,
  points_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(client_id)
);

ALTER TABLE "public"."loyalty_points" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for authenticated users"
ON "public"."loyalty_points"
FOR ALL
USING (EXISTS (
  SELECT 1 FROM clients
  WHERE clients.id = loyalty_points.client_id
  AND clients.owner_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM clients
  WHERE clients.id = loyalty_points.client_id
  AND clients.owner_id = auth.uid()
)); 