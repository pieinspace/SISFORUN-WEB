/**
 * Script untuk generate bcrypt password hash
 * Gunakan script ini untuk menambah admin baru
 * 
 * Usage: npx ts-node scripts/generate_password_hash.ts <password>
 * Example: npx ts-node scripts/generate_password_hash.ts mySecurePassword123
 */

import bcrypt from "bcrypt";

const password = process.argv[2];

if (!password) {
    console.error("Usage: npx ts-node scripts/generate_password_hash.ts <password>");
    process.exit(1);
}

const SALT_ROUNDS = 10;

bcrypt.hash(password, SALT_ROUNDS).then((hash) => {
    console.log("\n=== Password Hash Generated ===");
    console.log("Password:", password);
    console.log("Hash:", hash);
    console.log("\nGunakan hash di atas untuk INSERT ke tabel login_web:");
    console.log(`
INSERT INTO login_web (username, password_hash, role, name, is_active)
VALUES (
    'username_baru',
    '${hash}',
    'admin',
    'Nama Lengkap',
    true
);
`);
});
