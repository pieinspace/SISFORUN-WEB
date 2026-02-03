-- SQL Reference for Master Data & Personnel Import
-- Database: postgresql://postgres:admin123@localhost:5432/postgres

-- 1. Verify Master Tables
SELECT count(*) FROM kotama; -- Should be around 58+
SELECT count(*) FROM kesatuan; -- Should be around 1300+
SELECT count(*) FROM corps; -- Should be around 18+
SELECT count(*) FROM pangkat; -- Should be around 53+

-- 2. Verify Personnel
SELECT * FROM users WHERE nrp LIKE '1A0B%' LIMIT 10; -- Military from YONIF 100
SELECT * FROM users WHERE nrp LIKE '1A0B02%' LIMIT 10; -- ASN from YONIF 100

-- 3. Verify Admins
SELECT * FROM login_web WHERE username LIKE 'admin_ktm%';

-- Note: The data has already been inserted via the node script.
-- If you don't see the changes in DBeaver, please right-click on your 
-- 'public' schema or the 'Tables' folder and select 'Refresh' (F5).
