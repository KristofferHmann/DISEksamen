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
  
    const segments = ['0', '20', '50', '0', '200', '1000'];
    const segmentAngle = 360 / segments.length; // Angle per segment
  
    spinButton.addEventListener('click', async () => {
      const randomSpin = Math.floor(Math.random() * 360) + 360 * 5; // Randomize spin with multiple full rotations
      const finalAngle = randomSpin % 360; // Get the stopping angle within 360 degrees
  
      wheel.style.transition = 'transform 4s ease-out';
      wheel.style.transform = `rotate(${randomSpin}deg)`; // Apply spin animation
  
      setTimeout(async () => {
        // Corrected normalized angle calculation
        const adjustedAngle = (finalAngle + segmentAngle / 2) % 360; // Adjust to align with pointer
        const winningIndex = Math.floor(adjustedAngle / segmentAngle); // Get the winning segment index
        const pointsWon = segments[winningIndex]; // Map index to points
  
        console.log({ randomSpin, finalAngle, adjustedAngle, winningIndex, pointsWon }); // Debugging log
  
        try {
          const response = await fetch('/spin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pointsWon }),
          });
  
          if (response.ok) {
            const data = await response.json();
            spinResult.textContent = `You won ${data.pointsWon} points!`;
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
  