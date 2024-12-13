document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const registerForm = document.getElementById('registerForm');
    const sendOtpButton = document.getElementById('sendOtp');
    const otpModal = document.getElementById('otpModal');
    const closeModal = document.getElementById('closeModal');
    const verifyOtpButton = document.getElementById('verifyOtpButton');
    const otpInput = document.getElementById('otp');
    const detailsStep = document.getElementById('detailsStep');
    const phoneStep = document.getElementById('phoneStep');
    document.getElementById('phonenumber').removeAttribute('disabled');

    let userData = {}; // Store user data temporarily
    let isOtpVerified = false; // Track OTP verification status

    // Send OTP
    sendOtpButton.addEventListener('click', async () => {
        const countryCode = document.getElementById('countryCode').value;
        const phonenumber = document.getElementById('phonenumber').value;

        if (!phonenumber) {
            return alert('Indtast venligst dit telefonnummer for at sende OTP.');
        }
        const fullPhoneNumber = `${countryCode}${phonenumber}`;

    try {
        // Check if phone number already exists
        const checkPhoneResponse = await fetch('/api/check-phone', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phonenumber: fullPhoneNumber }),
        });

        if (!checkPhoneResponse.ok) {
            const errorData = await checkPhoneResponse.json();
            console.error('Phone number validation failed:', errorData.error);
            return alert(errorData.error); // Display error if phone number exists
        }
        // Send OTP via server
        const otpResponse = await fetch('/sendOtp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phonenumber: fullPhoneNumber }),
        });

        if (otpResponse.ok) {
            alert('OTP sendt til din SMS. Kontroller din besked.');
            otpModal.style.display = 'block'; // Show OTP modal
        } else {
            const error = await otpResponse.json();
            console.error('Error sending OTP:', error);
            alert('Kunne ikke sende OTP. Prøv venligst igen.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Der opstod en fejl ved afsendelse af OTP.');
    }
});

    // Close the OTP modal
    closeModal.addEventListener('click', () => {
        otpModal.style.display = 'none';
    });

    // Verify OTP and complete signup
    verifyOtpButton.addEventListener('click', async () => {
        const countryCode = document.getElementById('countryCode').value;
        const phonenumber = document.getElementById('phonenumber').value;
        const otp = otpInput.value;

        if (!otp) {
            return alert('Indtast venligst OTP.');
        }
        const fullPhoneNumber = `${countryCode}${phonenumber}`;
        try {
            // Verify OTP via server
            const response = await fetch('/verifyOtp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullPhoneNumber, otp }),
            });

            if (response.ok) {
                alert('OTP verificeret. Du kan nu færdiggøre registreringen.');
                otpModal.style.display = 'none'; // Close OTP modal
                isOtpVerified = true; // Mark OTP as verified
                phoneStep.style.display = 'none'; // Hide phone step
                detailsStep.classList.remove('hidden'); // Show details step
            } else {
                const error = await response.json();
                console.error('Invalid OTP:', error);
                alert('Ugyldig OTP. Prøv igen.');
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            alert('Der opstod en fejl under OTP-verifikation.');
        }
    });

    // Handle form submission
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        // Collect user data
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const email = document.getElementById('email').value;
        const phonenumber = document.getElementById('phonenumber').value;
        const countryCode = document.getElementById('countryCode').value;
        
        if (!username || !password || !email || !phonenumber) {
            return alert('Alle felter er påkrævet. Udfyld venligst formularen.');
        }

        if (!isOtpVerified) {
            return alert('OTP skal verificeres, før du kan oprette en bruger.');
        }
        const fullPhoneNumber = `${countryCode}${phonenumber}`;
        // Prepare user data for signup
        const userData = { username, password, email, phonenumber: fullPhoneNumber };

        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                const result = await response.json();
                alert('Bruger oprettet med succes!');
                console.log('User created successfully:', result);
                alert(`En velkomstmail er blevet sendt til ${email}. Kontroller din indbakke.`);
                window.location.href ='/login'; //Sender brugeren til login siden

            } else {
                const error = await response.json();
                console.error('Error completing signup:', error);
                alert('Kunne ikke fuldføre registrering. Prøv igen.');
            }
        } catch (error) {
            console.error('Error completing signup:', error);
            alert('Der opstod en fejl under registrering.');
        }
    });
});
