-- Clean up duplicate Kotama entries by merging them based on ur_ktm
DO $$ 
DECLARE 
    r RECORD;
    survivor_ktm VARCHAR;
BEGIN
    FOR r IN (
        SELECT ur_ktm, array_agg(kd_ktm ORDER BY kd_ktm) as codes 
        FROM kotama 
        GROUP BY ur_ktm 
        HAVING count(*) > 1
    ) LOOP
        -- Pick the first one as survivor (usually smaller code or CSV-based)
        survivor_ktm := r.codes[1];
        
        RAISE NOTICE 'Merging duplicates for % into code %', r.ur_ktm, survivor_ktm;

        -- Update kesatuan
        UPDATE kesatuan SET kd_ktm = survivor_ktm 
        WHERE kd_ktm = ANY(r.codes) AND kd_ktm != survivor_ktm;

        -- Update users
        UPDATE users SET kd_ktm = survivor_ktm 
        WHERE kd_ktm = ANY(r.codes) AND kd_ktm != survivor_ktm;

        -- Update login_web
        UPDATE login_web SET kd_ktm = survivor_ktm 
        WHERE kd_ktm = ANY(r.codes) AND kd_ktm != survivor_ktm;

        -- Delete redundant kotama entries
        DELETE FROM kotama 
        WHERE ur_ktm = r.ur_ktm AND kd_ktm != survivor_ktm;
    END LOOP;
END $$;

-- Also check for duplicate ur_smkl within the same Kotama in kesatuan
-- (Not strictly requested but good for "jangan ada double")
DELETE FROM kesatuan a USING kesatuan b
WHERE a.id > b.id 
  AND a.kd_ktm = b.kd_ktm 
  AND a.ur_smkl = b.ur_smkl;
