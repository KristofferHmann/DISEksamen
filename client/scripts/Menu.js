document.addEventListener('DOMContentLoaded', async () => {
    const menuContainer = document.querySelector('.menu-container');
    const modal = document.getElementById('purchase-modal');
  const purchaseDetails = document.getElementById('purchase-details');
  const confirmPurchaseButton = document.getElementById('confirm-purchase');
  const cancelPurchaseButton = document.getElementById('cancel-purchase');
  let selectedMenuItem = null; // Store the selected menu item for confirmation
  
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
              </div>
              <div class="item-actions">
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
    async function userIsLoggedIn() {
        try {
          const response = await fetch('/api/auth-status', { method: 'GET' });
          return response.ok; // If the server returns a 200 status, the user is logged in
        } catch (error) {
          console.error('Error verifying login status:', error);
          return false;
        }
      }
  
    // Function to attach click listeners to purchase buttons
    function addPurchaseListeners() {
        const purchaseButtons = document.querySelectorAll('.purchase-button');
        purchaseButtons.forEach((button) => {
          button.addEventListener('click', async (e) => {
            const loggedIn = await userIsLoggedIn();
            if (!loggedIn) {
              alert('You need to be logged in to purchase items.');
              window.location.href = '/login';
              return;
            }
    
            const menuItem = e.target.closest('.menu-item');
            selectedMenuItem = {
              id: menuItem.getAttribute('data-menu-id'),
              name: menuItem.querySelector('h3').textContent,
              cost: menuItem.querySelector('.price').textContent.split(' ')[1],
            };
    
            // Show confirmation modal
            purchaseDetails.textContent = `You are about to purchase ${selectedMenuItem.name} for ${selectedMenuItem.cost} points.`;
            modal.classList.remove('hidden');
          });
        });
      }
    
      confirmPurchaseButton.addEventListener('click', async () => {
        if (!selectedMenuItem) return;
    
        try {
          const response = await fetch('/purchaseItems', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ menuId: selectedMenuItem.id }),
          });
    
          const data = await response.json();
    
          if (response.ok) {
            alert(`${data.message} ${data.suggestion}`);
            modal.classList.add('hidden');
          } else {
            alert(data.error);
          }
        } catch (error) {
          console.error('Error processing purchase:', error.message);
          alert('An error occurred while processing your purchase.');
        }
      });
    
      cancelPurchaseButton.addEventListener('click', () => {
        modal.classList.add('hidden'); // Close the modal
        selectedMenuItem = null; // Clear selected item
      });
    });
    //mm