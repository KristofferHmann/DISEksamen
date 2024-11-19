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
            const phone = document.getElementById('phone');

            // Samler brugerdata fra inputfelterne i et objekt
            const userData = {
                username: username.value,
                password: password.value,
                email: email.value,
                phone: phone.value,
            };
        });
    }
});