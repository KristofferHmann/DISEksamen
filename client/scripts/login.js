async function login() {
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      if (response.ok) {
        const data = await response.json();
        loginMessage.style.color = 'green';
        loginMessage.textContent = 'Login successful! Redirecting...';
  
        // Redirect to index.html
        setTimeout(() => {
          window.location.href = '../';
        }, 1000);
      } else {
        const errorData = await response.json();
        loginMessage.textContent = errorData.error || 'Login failed!';
      }
    } catch (error) {
      console.error('Error during login:', error);
      loginMessage.textContent = 'En fejl opstod. Prøv igen senere.';
    }
  }