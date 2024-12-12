document.addEventListener('DOMContentLoaded', async () => {
    try {
      const response = await fetch('/api/profile', { method: 'GET' });
  
      if (response.status === 401 || response.status === 403) {
        alert('Du skal være logget ind for at kunne spille.');
        window.location.href = '/login';
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch profile data.');
      }

      const user = await response.json();
      const today = new Date().toISOString().split('T')[0];
      const spinButton = document.getElementById('spinButton');
      const spinResult = document.getElementById('spinResult');
  
      if (user.last_spin_date === today) {
        spinButton.disabled = true; // Disable spin button
        spinResult.textContent = 'Du har allerede spillet i dag. Kom tilbage i morgen!';
        return;
    }
  
      const wheel = document.getElementById('wheel');
      const segments = [0, 10, 20, 30, 50, 100]; 
      const segmentAngle = 360 / segments.length; 
  
      segments.forEach((point, index) => {
        const label = document.createElement('div');
        label.className = 'segment-label';
        label.textContent = point; // Assign the point value as text
  
        const angle = index * segmentAngle; // Calculate the rotation angle for the label
        label.style.setProperty('--rotate', `${angle}deg`); // Set custom property for rotation
        
        wheel.appendChild(label); // Add the label to the wheel
      });
  
      spinButton.addEventListener('click', async () => {
        const randomSpin = Math.floor(Math.random() * 360) + 360 * 5;
        const finalAngle = randomSpin % 360; 
  
        wheel.style.transition = 'transform 4s ease-out';
        wheel.style.transform = `rotate(${randomSpin}deg)`;
  
        setTimeout(async () => {
          const pointerOffset = segmentAngle / 2; // Pointer offset
          const normalizedAngle = (360 - (finalAngle % 360) + pointerOffset) % 360;
          const winningIndex = Math.floor(normalizedAngle / segmentAngle);
          const pointsWon = segments[winningIndex];
  
          try {
            const spinResponse = await fetch('/spin', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ pointsWon }),
            });
  
            if (spinResponse.ok) {
              const data = await spinResponse.json();
              spinResult.textContent = `You won ${pointsWon} points!`; // Display correct points
              spinButton.disabled = true; // Disable spin button
              
            } else if (spinResponse.status === 403) {
              const errorData = await spinResponse.json();
              alert(errorData.error); // Notify the user
              spinButton.disabled = true; // Disable the button
            } else {
              spinResult.textContent = 'Error spinning the wheel. Try again.';
            }
          } catch (spinError) {
            spinResult.textContent = 'Error spinning the wheel.';
            console.error('Error spinning the wheel:', spinError.message);
          }
        }, 4000); // Wait for the spin animation to complete
      });
    } catch (error) {
      console.error('Error checking login status:', error.message);
      alert('An error occurred while checking login status. Redirecting to login.');
      window.location.href = '/login';
    }
  });