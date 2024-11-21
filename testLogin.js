const database = require('./database.js'); // Sørg for, at denne sti passer

(async () => {
  try {
    const username = 'per';
    const password = 'per';

    const user = await database.getUserByUsernameAndPassword(username, password);

    if (user) {
      console.log('User found:', user);
    } else {
      console.log('Invalid username or password.');
    }
  } catch (err) {
    console.error('Error during login:', err.message);
  }
})();