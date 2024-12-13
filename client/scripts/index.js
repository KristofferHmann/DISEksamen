const responseDom = document.getElementById("response");

function discoverMenu() {
  window.location.href = './menu'; // Redirect to menu.html
}


document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/api/uploads?caption=Logo');
    const images = await response.json();

    if (images.length > 0) {
      const logoContainer = document.getElementById('logo-container');
      if (logoContainer) {
        logoContainer.innerHTML = `<img src="${images[0].url}" alt="Logo" style="max-height: 50px;">`; // Adjust styles as needed
      }
    }
  } catch (error) {
    console.error('Error loading logo:', error.message);
  }
});

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

// async funktion med await
async function getResponse() {
  // try catch blok
  const responseDom = document.getElementById("responseTime");
  try {
    // fetch data fra /res endpoint og await responsen
    const response = await fetch('/res');

    // hvis responsen ikke er ok, kast en fejl
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // konverter responsen til tekst
    const data = await response.text();

    // håndter succes
    console.log(data);
    responseDom.innerHTML = data;
  } catch (error) {
    // håndter fejl
    console.log(error);
    responseDom.innerHTML = `<p>Error: ${error.message}</p>`;
  }
}

async function userIsLoggedIn() {
  try {
    const response = await fetch('/api/auth-status', { method: 'GET' });

    if (!response.ok) {
      throw new Error('Failed to fetch authentication status');
    }

    const data = await response.json();
    return data.loggedIn; // Return the actual loggedIn status from the response
  } catch (error) {
    console.error('Error verifying login status:', error);
    return false; // Default to not logged in on error
  }
}
// Når siden loader, ændr navigationen hvis brugeren er logget ind
// When the page loads, modify the navigation bar based on login state
document.addEventListener('DOMContentLoaded', async () => {
  const navProfile = document.getElementById('nav-profile');
  const navContainer = document.querySelector('.right-tabs'); // Assuming .right-tabs contains the navigation buttons

  const isLoggedIn = await userIsLoggedIn();

  if (isLoggedIn) {
    // Display profile link for logged-in users
    navProfile.innerText = 'PROFIL';
    navProfile.href = '/profile';

    // Add a logout button/icon if not already present
    let logoutButton = document.getElementById('logout-btn');
    if (!logoutButton) {
      logoutButton = document.createElement('button');
      logoutButton.id = 'logout-btn';
      logoutButton.innerHTML = `<i class="fas fa-sign-out-alt" style="font-size: 20px;"></i>`;
      logoutButton.style.background = 'none';
      logoutButton.style.border = 'none';
      logoutButton.style.cursor = 'pointer';

      // Append the logout button to the navigation container
      navContainer.appendChild(logoutButton);

      // Add logout functionality
      logoutButton.addEventListener('click', async () => {
        const confirmLogout = confirm('Are you sure you want to log out?');
        if (confirmLogout) {
          try {
            const response = await fetch('/logout', { method: 'POST' });
            if (response.ok) {
              alert('You have been logged out.');
              document.cookie = 'token=; Max-Age=0'; // Clear the token
              window.location.href = '/'; // Redirect to the homepage
            } else {
              alert('Error during logout.');
            }
          } catch (err) {
            console.error('Logout error:', err);
          }
        } else {
          console.log('Logout cancelled');
        }
      });
    }
  } else {
    // Display login/sign-up options for not logged-in users
    navProfile.innerText = 'LOG IN / SIGN UP';
    navProfile.href = '/login';

    // Remove logout button if it exists
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
      logoutButton.remove();
    }
  }
});