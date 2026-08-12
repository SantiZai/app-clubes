-- Migración: Asegurar esquema en español para torneos y entidades relacionadas
-- Revisa antes de ejecutar. Ejecutar desde SQL Editor de Supabase.

-- Extensión para gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla zonas (si no existe)
CREATE TABLE IF NOT EXISTS zonas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  torneo_id uuid,
  nombre text,
  creado_en timestamptz DEFAULT now()
);

-- Asegurar columnas en `torneos`
ALTER TABLE IF EXISTS torneos
  ADD COLUMN IF NOT EXISTS fecha date,
  ADD COLUMN IF NOT EXISTS fecha_fin date,
  ADD COLUMN IF NOT EXISTS inscripcion_hasta date,
  ADD COLUMN IF NOT EXISTS precio numeric,
  ADD COLUMN IF NOT EXISTS cupos integer,
  ADD COLUMN IF NOT EXISTS inscriptos integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS descripcion text,
  ADD COLUMN IF NOT EXISTS formato text,
  ADD COLUMN IF NOT EXISTS activo boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS club_id uuid,
  ADD COLUMN IF NOT EXISTS banner text,
  ADD COLUMN IF NOT EXISTS club_logo text,
  ADD COLUMN IF NOT EXISTS logo_key text;

-- Asegurar columnas en `torneo_parejas` (relación pareja <-> torneo)
ALTER TABLE IF EXISTS torneo_parejas
  ADD COLUMN IF NOT EXISTS scheduled_time text,
  ADD COLUMN IF NOT EXISTS zone_id uuid;

ALTER TABLE IF EXISTS tournament_pairs
  ADD COLUMN IF NOT EXISTS zone_id uuid;

CREATE TABLE IF NOT EXISTS partidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE IF EXISTS partidos
  ADD COLUMN IF NOT EXISTS torneo_id uuid,
  ADD COLUMN IF NOT EXISTS zone_id uuid,
  ADD COLUMN IF NOT EXISTS pareja_a_id uuid,
  ADD COLUMN IF NOT EXISTS pareja_b_id uuid,
  ADD COLUMN IF NOT EXISTS pareja_a_label text,
  ADD COLUMN IF NOT EXISTS pareja_b_label text,
  ADD COLUMN IF NOT EXISTS day text,
  ADD COLUMN IF NOT EXISTS time text,
  ADD COLUMN IF NOT EXISTS court integer,
  ADD COLUMN IF NOT EXISTS estado text DEFAULT 'PENDIENTE',
  ADD COLUMN IF NOT EXISTS creado_en timestamptz DEFAULT now();

CREATE OR REPLACE FUNCTION public.save_tournament_zones_and_matches(
    p_torneo_id uuid,
    p_zones jsonb,
    p_link_table text,
    p_tournament_key text,
    p_pair_key text
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    zone_rec jsonb;
    match_rec jsonb;
    pair_ids uuid[];
    zone_id uuid;
    rows_updated int;
    updated_count int := 0;
    inserted_match_count int := 0;
    existing_count int;
BEGIN
    SELECT count(*) INTO existing_count FROM zonas WHERE torneo_id = p_torneo_id;
    IF existing_count > 0 THEN
        RAISE EXCEPTION 'Zonas ya existen';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = p_link_table) THEN
        RAISE EXCEPTION 'Tabla de vínculo % no existe', p_link_table;
    END IF;

    FOR zone_rec IN SELECT * FROM jsonb_array_elements(p_zones) LOOP
        INSERT INTO zonas (torneo_id, nombre)
        VALUES (p_torneo_id, zone_rec->>'name')
        RETURNING id INTO zone_id;

        SELECT array_agg(value::uuid) INTO pair_ids
        FROM jsonb_array_elements_text(zone_rec->'pairIds') AS value;
        IF pair_ids IS NULL THEN
            RAISE EXCEPTION 'Los ids de las parejas de la zona % no son válidos', zone_rec->>'name';
        END IF;

        EXECUTE format('UPDATE %I SET zone_id = $1 WHERE %I = $2 AND %I = ANY($3)', p_link_table, p_tournament_key, p_pair_key)
            USING zone_id, p_torneo_id, pair_ids;
        GET DIAGNOSTICS rows_updated = ROW_COUNT;
        updated_count := updated_count + rows_updated;
        IF rows_updated <> array_length(pair_ids, 1) THEN
            RAISE EXCEPTION 'No se pudieron asignar todas las parejas para la zona %', zone_rec->>'name';
        END IF;

        FOR match_rec IN SELECT * FROM jsonb_array_elements(zone_rec->'matches') LOOP
            INSERT INTO partidos (
                torneo_id,
                zone_id,
                pareja_a_id,
                pareja_b_id,
                pareja_a_label,
                pareja_b_label,
                day,
                time,
                court,
                estado
            ) VALUES (
                p_torneo_id,
                zone_id,
                NULLIF(match_rec->>'aId', '')::uuid,
                NULLIF(match_rec->>'bId', '')::uuid,
                match_rec->>'aLabel',
                match_rec->>'bLabel',
                zone_rec->>'day',
                match_rec->>'time',
                (match_rec->>'court')::int,
                'PENDIENTE'
            );
            inserted_match_count := inserted_match_count + 1;
        END LOOP;
    END LOOP;

    RETURN jsonb_build_object(
        'zonesSaved', jsonb_array_length(p_zones),
        'pairsSaved', updated_count,
        'matchesSaved', inserted_match_count
    );
END;
$$;

-- Asegurar columnas en `usuarios` para compatibilidad con subida de jugadores
ALTER TABLE IF EXISTS usuarios
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS telefono text,
  ADD COLUMN IF NOT EXISTS ranking_points integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS creado_en timestamptz DEFAULT now();

-- Asegurar que `parejas` tiene los campos de jugadores (ya debería tenerlos)
ALTER TABLE IF EXISTS parejas
  ADD COLUMN IF NOT EXISTS jugador1_id uuid,
  ADD COLUMN IF NOT EXISTS jugador2_id uuid,
  ADD COLUMN IF NOT EXISTS nombre_equipo text;

-- Índices útiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_torneos_club_id') THEN
    CREATE INDEX idx_torneos_club_id ON torneos (club_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_torneo_parejas_torneo') THEN
    CREATE INDEX idx_torneo_parejas_torneo ON torneo_parejas (torneo_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_parejas_jugadores') THEN
    CREATE INDEX idx_parejas_jugadores ON parejas (jugador1_id, jugador2_id);
  END IF;
END$$;

-- (Opcional) Crear tabla de partidos horarios si no existe (horarios_partidos ya existe)
-- No modificamos tablas con lógica compleja ni alteramos tipos ENUM existentes.

-- Fin de migración
