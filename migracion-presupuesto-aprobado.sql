-- Agregar columna de aprobacion a presupuestos
ALTER TABLE presupuestos
ADD COLUMN IF NOT EXISTS aprobado BOOLEAN DEFAULT FALSE;

-- Permitir lectura y actualizacion de aprobado a autenticados
-- (ajustar segun politicas RLS existentes)
