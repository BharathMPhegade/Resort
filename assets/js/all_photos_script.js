// REPLACE THIS WITH YOUR ACTUAL GOOGLE APPS SCRIPT WEB APP URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzY4-4_SsKpHHk8wga_aSqtJEjxInK9rHTUAcjJ_YsvBty8p7LALnZZ2o6DwCwS3ZtI/exec';

const imageGallery = document.getElementById('image-gallery');
const loadingDiv = document.getElementById('loading');
const errorContainer = document.getElementById('error-container');
const imageCount = document.getElementById('image-count');
const fullscreenView = document.getElementById('fullscreen-view');
const fullscreenImage = document.getElementById('fullscreen-image');
const fullscreenImageName = document.getElementById('fullscreen-image-name');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

let imageFiles = [];
let currentImageIndex = 0;

async function fetchGoogleDriveImages() {
  loadingDiv.style.display = 'block';
  
  try {
    const response = await fetch(SCRIPT_URL + '?t=' + new Date().getTime());
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Server returned error');
    }
    
    const images = result.data;

    if (!Array.isArray(images)) {
      throw new Error('Invalid data format from server');
    }

    imageFiles = images;
    loadingDiv.style.display = 'none';

    if (imageFiles.length === 0) {
      imageGallery.innerHTML = '<div class="empty-message">No images found in Google Drive folder</div>';
      imageCount.textContent = '0 images';
      return;
    }

    renderGallery();
    
  } catch (error) {
    loadingDiv.style.display = 'none';
    showError(`Failed to load gallery: ${error.message}`);
    console.error('Gallery error:', error);
  }
}

function renderGallery() {
  imageGallery.innerHTML = '';
  imageCount.textContent = `${imageFiles.length} image${imageFiles.length !== 1 ? 's' : ''}`;

  imageFiles.forEach((file, index) => {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    galleryItem.style.animationDelay = `${index * 0.05}s`;

    const img = document.createElement('img');
    
    // Try multiple URL formats for better compatibility
    const imageUrl = file.thumbnailUrl || file.directUrl || file.url;
    img.src = imageUrl;
    img.alt = file.name;
    img.loading = 'lazy';

    // Enhanced error handling
    img.onerror = function() {
      console.warn('Image failed to load:', file.name, imageUrl);
      
      // Try fallback URL
      if (file.url && file.url !== imageUrl) {
        console.log('Trying fallback URL:', file.url);
        this.src = file.url;
      } else {
        // Show placeholder for failed images
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjRmNGY0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
        this.alt = 'Image not available: ' + file.name;
      }
    };

    img.onload = function() {
      console.log('Image loaded successfully:', file.name);
    };

    const overlay = document.createElement('div');
    overlay.className = 'image-overlay';

    const viewBtn = document.createElement('button');
    viewBtn.className = 'view-btn';
    viewBtn.textContent = '👁 View';
    viewBtn.onclick = (e) => {
      e.stopPropagation();
      openFullscreenView(getBestImageUrl(file), file.name, index);
    };

    overlay.appendChild(viewBtn);

    galleryItem.onclick = () => {
      openFullscreenView(getBestImageUrl(file), file.name, index);
    };

    galleryItem.appendChild(img);
    galleryItem.appendChild(overlay);
    imageGallery.appendChild(galleryItem);
  });
}

// Helper function to get the best available image URL
function getBestImageUrl(file) {
  return file.directUrl || file.url || file.thumbnailUrl;
}

function showError(message) {
  errorContainer.innerHTML = `
    <div class="error-message">
      <strong>Error loading gallery:</strong> ${message}
      <br><small>Please check:<br>
      • Google Apps Script is deployed correctly<br>
      • Google Drive folder is shared publicly<br>
      • Folder contains valid image files<br>
      • Browser console for detailed errors (F12 → Console)
      </small>
    </div>
  `;
}

function openFullscreenView(imageUrl, imageName, index) {
  currentImageIndex = index;
  fullscreenImage.src = imageUrl;
  fullscreenImageName.textContent = imageName;
  fullscreenView.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Add error handling for fullscreen image too
  fullscreenImage.onerror = function() {
    console.error('Fullscreen image failed to load:', imageUrl);
    fullscreenImageName.textContent = imageName + ' (Failed to load)';
  };
}

function closeFullscreenView() {
  fullscreenView.classList.remove('active');
  document.body.style.overflow = 'auto';
}

function navigateImages(direction) {
  if (direction === 'next') {
    currentImageIndex = (currentImageIndex + 1) % imageFiles.length;
  } else {
    currentImageIndex = (currentImageIndex - 1 + imageFiles.length) % imageFiles.length;
  }
  
  const file = imageFiles[currentImageIndex];
  openFullscreenView(getBestImageUrl(file), file.name, currentImageIndex);
}

// Event listeners
prevBtn.addEventListener('click', () => navigateImages('prev'));
nextBtn.addEventListener('click', () => navigateImages('next'));

fullscreenView.addEventListener('click', (e) => {
  if (e.target === fullscreenView) {
    closeFullscreenView();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && fullscreenView.classList.contains('active')) {
    closeFullscreenView();
  } else if (e.key === 'ArrowLeft' && fullscreenView.classList.contains('active')) {
    navigateImages('prev');
  } else if (e.key === 'ArrowRight' && fullscreenView.classList.contains('active')) {
    navigateImages('next');
  }
});

// Initialize the gallery
fetchGoogleDriveImages();