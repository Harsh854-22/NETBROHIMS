/**
 * Create Admin Account - admin2@hospital.com
 * Run this script to create/update the admin account with correct password
 */

const bcrypt = require('bcryptjs');

// Admin credentials
const EMAIL = 'admin2@hospital.com';
const PASSWORD = 'Harsh@123';
const NAME = 'Admin User';
const PHONE = '+91 7021478704';

async function generateAdminAccount() {
  console.log('\n=== Creating Admin Account ===\n');
  
  console.log('Email:', EMAIL);
  console.log('Password:', PASSWORD);
  console.log('Name:', NAME);
  console.log('Phone:', PHONE);
  
  // Generate password hash
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  
  console.log('\n=== Generated Password Hash ===');
  console.log(passwordHash);
  
  console.log('\n=== SQL Query to Run in Supabase ===\n');
  console.log(`
-- Delete existing admin if any (to start fresh)
DELETE FROM users WHERE email = '${EMAIL}';

-- Insert admin with correct password hash
INSERT INTO users (email, name, role, phone, password_hash)
VALUES (
  '${EMAIL}',
  '${NAME}',
  'admin',
  '${PHONE}',
  '${passwordHash}'
);

-- Verify the admin was created
SELECT id, email, name, role, phone, created_at 
FROM users 
WHERE email = '${EMAIL}';
  `);
  
  console.log('\n=== Instructions ===');
  console.log('1. Copy the SQL query above');
  console.log('2. Go to Supabase SQL Editor (https://supabase.com/dashboard)');
  console.log('3. Paste and run the query');
  console.log('4. Try logging in again with:');
  console.log('   Email:', EMAIL);
  console.log('   Password:', PASSWORD);
  console.log('\n');
}

generateAdminAccount().catch(console.error);
