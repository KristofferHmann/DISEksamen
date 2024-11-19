// Tilføjer en event listener til dokumentet, der afventer at alt indhold er indlæst
document.addEventListener('DOMContentLoaded', () => {
    // Finder registreringsformularen i dokumentet
    const registerForm = document.getElementById('registerForm');

    // Tjekker om registreringsformularen eksisterer, før der tilføjes en event listener
    if (registerForm) {
        // Tilføjer en event listener til formularen, der afventer at formularen indsendes
        registerForm.addEventListener('submit', async (event) => {
            // Forhindrer formularen i at indsende som standard, så vi kan håndtere indsendelsen manuelt
            event.preventDefault();

            // Finder inputfelterne for brugernavn, adgangskode, vægt, alder og køn i dokumentet
            const username = document.getElementById('username');
            const password = document.getElementById('password');
            const email = document.getElementById('email');
            const phonenumber = document.getElementById('phonenumber');

            // Samler brugerdata fra inputfelterne i et objekt
            const userData = {
                username: username.value,
                password: password.value,
                email: email.value,
                phonenumber: phonenumber.value,
            };
            console.log('User Data:', userData);

            if (!username || !password || !email || !phonenumber) {
                console.error('All fields are required.');
                return alert('All fields are required. Please fill out the form.');
            }
            try {
                // Sender brugerdata til serveren via en POST-anmodning
                const response = await fetch('/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData),
                });

                // Håndterer serverens svar
                if (response.ok) {
                    const result = await response.json();
                    console.log('User created successfully:', result);
                    // Eventuelt vis en succesbesked til brugeren
                } else {
                    console.error('Error creating user:', response.statusText);
                    // Eventuelt vis en fejlbesked til brugeren
                }
            } catch (error) {
                console.error('Error creating user:', error);
                // Eventuelt vis en fejlbesked til brugeren
            }
        });
    }
});