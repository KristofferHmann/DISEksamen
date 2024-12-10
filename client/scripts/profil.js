// Fetch and pre-fill profile data
document.addEventListener('DOMContentLoaded', async () => {
    const pointsDisplay = document.getElementById('pointsDisplay');
    const recentPurchasesList = document.getElementById('recentPurchasesList');
  const allPurchasesList = document.getElementById('allPurchasesList');
  
    try {
      // Fetch user profile data
      const response = await fetch('/api/profile', { method: 'GET' });
  
      if (response.ok) {
        const user = await response.json();
  
        // Pre-fill profile details
        document.getElementById('name').value = user.username;
        document.getElementById('email').value = user.email;
  
        // Update points display
        if (pointsDisplay) {
          pointsDisplay.textContent = user.points; // Ensure the points are set
        }
  
        // Fetch purchased items
        const purchasesResponse = await fetch('/api/purchases', { method: 'GET' });
        if (purchasesResponse.ok) {
          const purchasedItems = await purchasesResponse.json();

            recentPurchasesList.innerHTML = '';
            allPurchasesList.innerHTML = '';
  
              // Show last 3 purchases in the main list
        purchasedItems.slice(0, 3).forEach((item) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${item.name} - ${item.cost} points`;
            recentPurchasesList.appendChild(listItem);
          });
  
          // Show all purchases in the dropdown
          purchasedItems.forEach((item) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${item.name} - ${item.cost} points`;
            allPurchasesList.appendChild(listItem);
          });
        } else {
          recentPurchasesList.innerHTML = '<li>Failed to fetch purchases.</li>';
          allPurchasesList.innerHTML = '<li>Failed to fetch purchases.</li>';
        }
      } else {
        console.error('Error fetching profile data:', response.status);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error.message);
      pointsDisplay.textContent = 'Error loading points.';
      recentPurchasesList.innerHTML = '<li>Error loading recent purchases.</li>';
      allPurchasesList.innerHTML = '<li>Error loading all purchases.</li>';
    }
  });
  
  // Update profile
  document.getElementById('edit-profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    console.log('Submitting profile update:', { username, email }); // Debugging log
  
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email }),
      });
  
      if (response.ok) {
        document.getElementById('update-message').innerText = 'Profile updated successfully!';
      } else {
        const error = await response.text();
        console.error('Error from server:', error);
        document.getElementById('update-message').innerText = `Error: ${error.error || 'Failed to update profile.'}`;
      }
    } catch (error) {
      document.getElementById('update-message').innerText = 'Error updating profile.';
    }
  });
  
  // Delete profile
  document.getElementById('delete-profile-button').addEventListener('click', async () => {
    if (!confirm('Are you sure you want to delete your account?')) return;
  
    try {
      const response = await fetch('/api/profile', { method: 'DELETE' });
      if (response.ok) {
        document.getElementById('delete-message').innerText = 'Account deleted successfully!';
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        const error = await response.text();
        document.getElementById('delete-message').innerText = `Error: ${error}`;
      }
    } catch (error) {
      document.getElementById('delete-message').innerText = 'Error deleting account.';
    }
  });