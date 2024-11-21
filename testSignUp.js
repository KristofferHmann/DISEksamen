const database = require('./database.js'); // Sørg for, at denne sti passer

(async () => {
  try {
    const newUser = {
      username: 'hans',
      password: 'hans',
      email: 'hans@hans.com',
      phonenumber: '12345678',
      created_at: new Date().toISOString(),
    };

    const userId = await database.signupUser(newUser);
    console.log('New user created with ID:', userId);
  } catch (err) {
    console.error('Error during signup:', err.message);
  }
})();