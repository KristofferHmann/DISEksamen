async function login(event) {
  event.preventDefault(); // Prevent the default form submission behavior
    const username = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;
    const loginMessage = document.getElementById('loginMessage');
  
    if (!username || !password) {
      loginMessage.textContent = 'Brugernavn og password skal udfyldes!';
      return;
    }
  
    try {
      const response = await fetch('/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      
      });
  
      if (response.ok) {
        const data = await response.json();
        loginMessage.style.color = 'green';
        loginMessage.textContent = 'Login successful! Redirecting...';
        window.location.href = '/';
      } else {
        const errorData = await response.json();
        loginMessage.textContent = errorData.error || 'Login failed!';
      }
    } catch (error) {
      console.error('Error during login:', error);
      loginMessage.textContent = 'En fejl opstod. Prøv igen senere.';
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      const response = await fetch('/api/uploads?caption=Hjemmeskærm');
      const images = await response.json();
  
      if (images.length > 0) {
        const background = document.querySelector('.background'); // Brug en klasse eller hele body
        if (background) {
          background.style.backgroundImage = `url(${images[0].url})`;
        }
      }
    } catch (error) {
      console.error('Error loading background image:', error.message);
    }
  });