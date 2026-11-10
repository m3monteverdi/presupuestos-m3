-- Agregar columna de anulado/nulo a presupuestos
ALTER TABLE presupuestos
ADD COLUMN IF NOT EXISTS nulo BOOLEAN DEFAULT FALSE;

-- Permitir lectura y actualizacion de nulo a autenticados
DROP POLICY IF EXISTS "permite editar nulo" ON presupuestos;
CREATE POLICY "permite editar nulo" ON presupuestos
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
