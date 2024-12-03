/*async function displayUploads() {
    try {
      // Fetch data from the API
      const response = await fetch("/api/uploads");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const uploads = await response.json();
  
      // Get the container where the uploads will be displayed
      const uploadsContainer = document.getElementById("uploads-container");
  
      // Clear the container
      uploadsContainer.innerHTML = "";
  
      // Iterate through the uploads and create HTML elements for each one
      uploads.forEach((upload) => {
        const uploadElement = document.createElement("div");
        uploadElement.className = "upload";
        uploadElement.innerHTML = `
          <img src="${upload.url}" alt="${upload.caption}" style="max-width: 200px; height: auto; display: block; ">`;
        uploadsContainer.appendChild(uploadElement);
      });
    } catch (error) {
      console.error("Error fetching uploads:", error.message);
    }
  }
  
  // Call the function when the DOM is fully loaded
  document.addEventListener("DOMContentLoaded", displayUploads);*/
