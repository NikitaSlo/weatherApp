const apiKey = "AIzaSyAUSSskWl6w4ztUfVJpGbrMMjsa9kT1P-c";
const searchEngineId = "b5abc30e7ffdf4173";
const inputField = document.getElementById("city-input");
const searchButton = document.getElementById("search-btn");

const spinner = document.getElementById("loading-spinner");


// Cache to store images for the session
const imageCache = new Map();

searchButton.addEventListener("click", async () => {
    const cityName = inputField.value.trim();
    
    if (!cityName) {
        alert("Please enter a city name!");
        return;
    }

    showSpinner();

    // Check if the city image is already cached
    if (imageCache.has(cityName)) {
        setBackground(imageCache.get(cityName));
        return;
    }

    try {
        const imageUrl = await fetchHighResImage(cityName);
        if (imageUrl) {
            imageCache.set(cityName, imageUrl); // Store the image in the session cache
            setBackground(imageUrl); // Set as background
        } else {
            alert("No suitable images found for this city. Please try another one.");
        }
    } catch (error) {
        console.error("Error fetching image:", error);
        alert("An error occurred while fetching the image. Please try again.");
    } finally {
        hideSpinner();
    }
});

// Function to fetch high-resolution images
async function fetchHighResImage(query) {
    const apiUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
        query
    )}&cx=${searchEngineId}&key=${apiKey}&searchType=image&num=5`; // Fetch up to 5 images

    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error("Failed to fetch images from API");
    }

    const data = await response.json();
    const images = data.items;

    if (!images || images.length === 0) {
        return null; // No images found
    }

    // Loop through the images to find one with the required resolution
    for (const image of images) {
        const imageUrl = image.link;

        try {
            const isHighRes = await checkImageResolution(imageUrl);
            if (isHighRes) {
                console.log("High-resolution image found:", imageUrl);
                return imageUrl; // Return the first high-resolution image URL
            }
        } catch (error) {
            console.warn(`Error checking resolution for ${imageUrl}:`, error);
            continue; // Skip to the next image
        }
    }

    return null; // No high-resolution images found
}

// Function to check if an image meets the resolution requirement
async function checkImageResolution(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
            const isHighRes = img.width >= 1366 && img.height >= 768;
            resolve(isHighRes);
        };
        img.onerror = () => {
            reject(new Error("Failed to load image"));
        };
    });
}

// Function to set the background image
function setBackground(imageUrl) {
    document.body.style.backgroundImage = `url('${imageUrl}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
}



function showSpinner() {
    spinner.classList.add("visible");
}

function hideSpinner() {
    spinner.classList.remove("visible");
}