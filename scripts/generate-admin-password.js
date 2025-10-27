const bcrypt = require('bcryptjs');

async function hashPassword() {
  const password = 'admin123'; // Default admin password
  const saltRounds = 10;
  
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('Password hash for "admin123":');
  console.log(hash);
  console.log('\nUse this hash in your SQL migration file.');
}

hashPassword();
