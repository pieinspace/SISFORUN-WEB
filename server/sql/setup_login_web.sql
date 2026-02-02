-- =============================================
-- Setup login_web table - JALANKAN SATU PER SATU
-- =============================================

-- STEP 1: Hapus tabel lama dan buat ulang (jalankan ini dulu)
DROP TABLE IF EXISTS login_web;

CREATE TABLE login_web (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 2: Insert admin (jalankan setelah step 1 berhasil)
INSERT INTO login_web (username, password_hash, role, name, is_active)
VALUES 
    ('admin', '$2b$10$N9qo8uLOickgx2ZMRZoMye.qLmV.HV8p.pNXYJq6pJjXJ5xNcKXHu', 'admin', 'Administrator', true),
    ('superadmin', '$2b$10$RlZhSnVYVzZXVmZYWVp6dOJQWkxGR3pKWlhWVkVGVlZYWVpjZGVm', 'superadmin', 'Super Administrator', true);

-- STEP 3: Cek hasil
SELECT * FROM login_web;
