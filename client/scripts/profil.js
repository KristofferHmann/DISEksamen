// Fetch and pre-fill profile data
document.addEventListener('DOMContentLoaded', async () => {
    try {
      const response = await fetch('/api/profile', { method: 'GET' });
      if (response.ok) {
        const user = await response.json();
        document.getElementById('name').value = user.username;
        document.getElementById('email').value = user.email;
      } else {
        console.error('Error fetching profile data:', response.status);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error.message);
    }
  });
  
  // Update profile
  document.getElementById('edit-profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
  
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });
  
      if (response.ok) {
        document.getElementById('update-message').innerText = 'Profile updated successfully!';
      } else {
        const error = await response.text();
        document.getElementById('update-message').innerText = `Error: ${error}`;
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
        }, 2000);
      } else {
        const error = await response.text();
        document.getElementById('delete-message').innerText = `Error: ${error}`;
      }
    } catch (error) {
      document.getElementById('delete-message').innerText = 'Error deleting account.';
    }
  });