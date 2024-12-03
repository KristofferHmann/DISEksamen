document.addEventListener('DOMContentLoaded', async () => {
    const menuContainer = document.querySelector('.menu-container');
  
    try {
      // Fetch menu items from the backend
      const response = await fetch('api/menu');
      const menuItems = await response.json();
  
      // Dynamically populate the menu
      menuItems.forEach((item) => {
        const menuItem = `
          <div class="menu-item" data-menu-id="${item.id}">
            <img src="${item.image_url}" alt="${item.name}">
            <div class="item-details">
              <h3>${item.name}</h3>
              <p>${item.ingredient}</p>
              <span class="price">Cost: ${item.cost} points</span>
              <button class="purchase-button">Purchase</button>
            </div>
          </div>
        `;
        menuContainer.innerHTML += menuItem;
      });
  
      // Add purchase functionality after dynamically loading menu
      addPurchaseListeners();
  
    } catch (error) {
      console.error('Error fetching menu items:', error.message);
    }
  
    // Function to check if the user is logged in
    function userIsLoggedIn() {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      return !!token; // Return true if the token exists
    }
  
    // Function to attach click listeners to purchase buttons
    function addPurchaseListeners() {
      const purchaseButtons = document.querySelectorAll('.purchase-button');
  
      purchaseButtons.forEach((button) => {
        button.addEventListener('click', async (e) => {
          // Check if the user is logged in
          if (!userIsLoggedIn()) {
            alert('You need to be logged in to purchase items.');
            window.location.href = '/login'; // Redirect to login page
            return; // Stop further execution
          }
  
          // Proceed with the purchase
          const menuItem = e.target.closest('.menu-item'); // Get the parent menu-item
          const menuId = menuItem.getAttribute('data-menu-id'); // Get the menu ID
  
          try {
            const response = await fetch('/purchase', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ menuId }),
            });
  
            const data = await response.json();
  
            if (response.ok) {
              alert(data.message); // Show success message
            } else {
              alert(data.error); // Show error message
            }
          } catch (error) {
            console.error('Error processing purchase:', error.message);
            alert('An error occurred while processing your purchase.');
          }
        });
      });
    }
  });