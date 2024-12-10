document.addEventListener('DOMContentLoaded', async () => {
    try {
      const response = await fetch('/api/profile', { method: 'GET' });
  
      if (response.status === 401 || response.status === 403) {
        alert('You have to be logged in to play.');
        window.location.href = '/login';
        return;
      }
    if (!response.ok) {
      throw new Error('Failed to fetch profile data.');
    }
    const user = await response.json();
    console.log('Fetched user profile:', user);
    // Use user data as needed
  } catch (error) {
    console.error('Error checking login status:', error.message);
    alert('An error occurred while checking login status. Redirecting to login.');
    window.location.href = '/login';
  }
  
    const wheel = document.getElementById('wheel');
    const spinButton = document.getElementById('spinButton');
    const spinResult = document.getElementById('spinResult');
  
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
  
        console.log({
          randomSpin,
          finalAngle,
          normalizedAngle,
          winningIndex,
          pointsWon,
          segmentAngle,
        });
  
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