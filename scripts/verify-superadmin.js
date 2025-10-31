/**
 * Verify and Create SuperAdmin Account
 * Run this script to check if your superadmin account exists and create it if needed
 */

const bcrypt = require('bcryptjs');

// Your credentials
const EMAIL = 'harshsingh050607@gmail.com';
const PASSWORD = 'SuperAdmin@123';
const NAME = 'Super Administrator';
const PHONE = '+91 7021478704';

async function generatePasswordHash() {
  console.log('\n=== SuperAdmin Account Setup ===\n');
  
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
-- Delete existing user if any (to start fresh)
DELETE FROM users WHERE email = '${EMAIL}';

-- Insert superadmin with correct password hash
INSERT INTO users (email, name, role, phone, password_hash)
VALUES (
  '${EMAIL}',
  '${NAME}',
  'superadmin',
  '${PHONE}',
  '${passwordHash}'
);

-- Verify the user was created
SELECT id, email, name, role, phone, created_at 
FROM users 
WHERE email = '${EMAIL}';
  `);
  
  console.log('\n=== Instructions ===');
  console.log('1. Copy the SQL query above');
  console.log('2. Go to Supabase SQL Editor');
  console.log('3. Paste and run the query');
  console.log('4. Try logging in again with:');
  console.log('   Email:', EMAIL);
  console.log('   Password:', PASSWORD);
  console.log('\n');
}

generatePasswordHash().catch(console.error);
