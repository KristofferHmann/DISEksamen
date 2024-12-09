document.addEventListener('DOMContentLoaded', async () => {
    try {
      const response = await fetch('/api/profile', { method: 'GET' });
  
      if (response.status === 401 || response.status === 403) {
        alert('You have to be logged in to play.');
        window.location.href = '/login';
        return;
      }
    } catch (error) {
      console.error('Error checking login status:', error.message);
      alert('An error occurred while checking login status. Redirecting to login.');
      window.location.href = '/login';
      return;
    }
  
    const wheel = document.getElementById('wheel');
    const spinButton = document.getElementById('spinButton');
    const spinResult = document.getElementById('spinResult');
  
    const segments = [0, 20, 50, 0, 200, 1000]; 
    const segmentAngle = 360 / segments.length; 
  
    spinButton.addEventListener('click', async () => {
      const randomSpin = Math.floor(Math.random() * 360) + 360 * 5;
      const finalAngle = randomSpin % 360; 
  
      wheel.style.transition = 'transform 4s ease-out';
      wheel.style.transform = `rotate(${randomSpin}deg)`;
  
      setTimeout(async () => {
        
        const normalizedAngle = (360 - finalAngle + segmentAngle / 2) % 360;
        let winningIndex = Math.floor(normalizedAngle / segmentAngle); 
  
        if (winningIndex >= segments.length) {
          winningIndex = segments.length - 1;
        }
  
        const pointsWon = segments[winningIndex];
  
        console.log({
          randomSpin,
          finalAngle,
          normalizedAngle,
          winningIndex,
          pointsWon,
          segmentAngle,
        }); // Debugging log
  
        try {
          const response = await fetch('/spin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pointsWon }),
          });
  
          if (response.ok) {
            const data = await response.json();
            spinResult.textContent = `You won ${pointsWon} points!`; // Display correct points
          } else {
            const errorData = await response.json();
            spinResult.textContent = errorData.error || 'Error spinning the wheel. Try again.';
          }
        } catch (error) {
          spinResult.textContent = 'Error spinning the wheel.';
          console.error('Error spinning the wheel:', error.message);
        }
      }, 4000); // Wait for the spin animation to complete
    });
  });