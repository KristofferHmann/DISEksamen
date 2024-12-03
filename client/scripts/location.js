// Constants and Configuration
const CONFIG = {
    MAP_TILE_URL: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    MAX_ZOOM: 20,
    DEFAULT_ZOOM: 1,
    ROUTE_COLOR: 'pink',
    GEOCODING_DELAY: 1100,
    MAX_RETRIES: 3,
    RETRY_DELAY: 2000,
    DEFAULT_CENTER: {
        lat: 55.6761,
        lon: 12.5683
    },
};

class LocationRouter {
    constructor() {
        this.map = null;
        this.userLocation = null;
        this.markers = [];
        this.selectedDestination = null;
        this.currentRoute = null;
    }

    async init() {
        try {
            this.updateStatus('Initializing map...');
            this.initializeMap();

            this.updateStatus('Getting user location...');
            await this.getUserLocation();

            this.updateStatus('Fetching locations...');
            const locations = await this.fetchLocations();

            this.updateStatus('Adding markers...');
            this.addMarkers(locations);

            this.updateStatus('Klar. Vælg en destination og click "Vis Rute".');
        } catch (error) {
            this.updateStatus('Initialization error: ' + error.message);
            console.error('Initialization error:', error);
        }

        // Add listener for the Generate Route button
        document.getElementById('generateRoute').addEventListener('click', () => {
            this.generateRoute();
        });
    }

    initializeMap() {
        this.map = L.map('map', {
            minZoom: 5, // Prevent zooming out beyond level 10
            maxBounds: [
                [54.0, 10.0], // Southwest corner (expanded south-west)
                [57.0, 15.0], // Northeast corner (expanded north-east)
            ],
            maxBoundsViscosity: 1.0, // Smooth stopping at the bounds
        }).setView([CONFIG.DEFAULT_CENTER.lat, CONFIG.DEFAULT_CENTER.lon], CONFIG.DEFAULT_ZOOM);
    
        L.tileLayer(CONFIG.MAP_TILE_URL, {
            maxZoom: CONFIG.MAX_ZOOM,
            attribution: CONFIG.MAP_ATTRIBUTION
        }).addTo(this.map);
         // Define custom icons
    this.userIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [0, -41]
    });

    this.addressIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [0, -41]
    });

    this.highlightedAddressIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png', // Highlight icon for selected destination
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [0, -41]
    });
    }
    

    async getUserLocation() {
        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    };

                    L.marker([this.userLocation.lat, this.userLocation.lon], { icon: this.userIcon })
                        .addTo(this.map)
                        .bindPopup('Din Lokation')
                        .openPopup();

                    resolve(this.userLocation);
                },
                () => {
                    this.userLocation = CONFIG.DEFAULT_CENTER;
                    resolve(this.userLocation);
                }
            );
        });
    }

    async fetchLocations() {
        try {
            const response = await fetch('/api/joeJuiceLocations');
            if (!response.ok) throw new Error('Failed to fetch locations');
            const data = await response.json();
            return data;
        } catch (error) {
            throw new Error('Error fetching locations: ' + error.message);
        }
    }

    addMarkers(locations) {
        const storeDropdown = document.getElementById('storeDropdown');
      
        locations.forEach((location, index) => {
          const lat = Number(location.Latitude);
          const lon = Number(location.Longitude);
      
          if (!this.isValidCoordinate(lat, lon)) {
            console.error(`Invalid coordinates for location: ${location.Street}`, { lat, lon });
            return;
          }
      
          // Create a marker for the map
          const marker = L.marker([lat, lon], { icon: this.addressIcon })
            .addTo(this.map)
            .bindPopup(`<strong>${location.Street}</strong><br>${location.City || 'Unknown City'}`);
      
          marker.on('click', () => this.handleMarkerClick(marker, { lat, lon }));
          this.markers.push(marker);
      
          // Add an option to the dropdown
          const option = document.createElement('option');
          option.value = index;
          option.textContent = `${location.Street}, ${location.City || 'Unknown City'}`;
          storeDropdown.appendChild(option);
        });
      
        // Handle store selection
        storeDropdown.addEventListener('change', (e) => {
          const selectedIndex = e.target.value;
          const selectedLocation = locations[selectedIndex];
          const lat = Number(selectedLocation.Latitude);
          const lon = Number(selectedLocation.Longitude);
      
          if (this.isValidCoordinate(lat, lon)) {
            this.selectedDestination = { lat, lon };
            this.updateStatus(`Selected: ${selectedLocation.Street}`);
            document.getElementById('generateRoute').disabled = false; // Enable the route button
      
            // Highlight the selected marker
            const marker = this.markers[selectedIndex];
            this.resetMarkers();
            marker.setIcon(this.highlightedAddressIcon);
            this.map.setView([lat, lon], 15); // Zoom to the selected location
          }
        });
      
        if (this.markers.length > 0) {
          const group = new L.featureGroup(this.markers);
          this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
        }
      }
    

    handleMarkerClick(marker, coordinates) {
        this.resetMarkers();
        this.selectedDestination = coordinates;
        marker.setIcon(this.highlightedAddressIcon);
        this.updateStatus('Destination valgt. Click "Vis Rute" for at fortsætte.');
        document.getElementById('generateRoute').disabled = false;
    }

    async generateRoute() {
        if (!this.userLocation || !this.selectedDestination) {
            this.updateStatus('Vær sød at vælge en destination først.');
            return;
        }
    
        try {
            this.updateStatus('Generating route...');
            const { coordinates, distance, duration } = await this.fetchRoute(this.userLocation, this.selectedDestination);
    
            if (coordinates && coordinates.length > 0) {
                this.addRouteToMap(coordinates);
    
                // Convert distance to kilometers and duration to minutes
                const distanceKm = (distance / 1000).toFixed(2);
                const durationMinutes = Math.ceil(duration / 60);
    
                this.updateStatus(
                    `Ruten blev succesfuldt vist.<br> Afstand: ${distanceKm} km.<br> Anslåede gå tid: ${durationMinutes} minutter.`
                );
            } else {
                throw new Error('No valid route coordinates received.');
            }
        } catch (error) {
            console.error('Error generating route:', error);
            this.updateStatus('Failed to generate route: ' + error.message);
        }
    }
    
    

    async fetchRoute(start, end) {
        try {
            const response = await fetch('/api/directions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ start, end }),
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Route API error response:', errorText);
                throw new Error(errorText);
            }
    
            const data = await response.json();
            console.log('Route API response:', data);
    
            if (!data.routes || data.routes.length === 0) {
                throw new Error('No routes available in response');
            }
    
            const route = data.routes[0];
            if (!route.geometry) {
                console.error('Route geometry missing or invalid:', route);
                throw new Error('No valid route geometry received');
            }
    
            // Decode the encoded geometry string
            const decodedCoordinates = polyline.decode(route.geometry);
            console.log('Decoded route coordinates:', decodedCoordinates);
    
            // Extract distance and duration from the route summary
            const distance = route.summary?.distance || 0; // in meters
            const duration = route.summary?.duration || 0; // in seconds
    
            return { coordinates: decodedCoordinates.map(coord => [coord[1], coord[0]]), distance, duration };
        } catch (error) {
            console.error('Error fetching route:', error);
            throw error;
        }
    }
    




    addRouteToMap(coordinates) {
        if (this.currentRoute) {
            this.map.removeLayer(this.currentRoute);
        }

        this.currentRoute = L.polyline(coordinates.map(coord => [coord[1], coord[0]]), {
            color: CONFIG.ROUTE_COLOR,
            weight: 6,
            opacity: 0.7
        }).addTo(this.map);

        this.map.fitBounds(this.currentRoute.getBounds(), { padding: [50, 50] });
    }

    isValidCoordinate(lat, lon) {
        return !isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
    }

    resetMarkers() {
        this.markers.forEach(marker => marker.setIcon(this.addressIcon));
    }


    updateStatus(message) {
        const statusElement = document.getElementById('statusText');
        if (statusElement) {
            statusElement.innerHTML = message;
        }
    }
}


// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const router = new LocationRouter();
    router.init().catch(error => {
        console.error('Failed to initialize LocationRouter:', error);
    });
});