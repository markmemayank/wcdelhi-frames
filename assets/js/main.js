/**
 * WordCamp Kerala Profile Picture Frame Generator
 * Ver: 2.3
 * Author: Ajith
 * URL: https://ajithrn.com
 * JS
 */

document
  .getElementById('uploadImage')
  .addEventListener('change', handleImageUpload);
document
  .getElementById('userName')
  .addEventListener('input', renderCompositeImage);
document
  .getElementById('companyName')
  .addEventListener('input', renderCompositeImage);
const framesContainer = document.getElementById('framesContainer');
const resultCanvas = document.getElementById('resultCanvas');
const ctx = resultCanvas.getContext('2d');
const previewImage = document.getElementById('previewImage');
let uploadedImage = null;
let selectedFrame = null;

// Set canvas size to match frame dimensions
resultCanvas.width = 1920;
resultCanvas.height = 1920;

// Handle the file upload event
function handleImageUpload(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    uploadedImage = new Image();
    uploadedImage.onload = renderCompositeImage;
    uploadedImage.src = e.target.result;
  };
  reader.readAsDataURL(event.target.files[0]);
}

// This helper function crops and positions the image within the specified area
function cropAndPositionImage(imageObj, context) {
  const targetWidth = 560;
  const targetHeight = 560;
  const targetAspectRatio = targetWidth / targetHeight;

  let sourceWidth, sourceHeight, sourceX, sourceY;

  if (imageObj.width / imageObj.height > targetAspectRatio) {
    sourceHeight = imageObj.height;
    sourceWidth = sourceHeight * targetAspectRatio;
    sourceX = (imageObj.width - sourceWidth) / 2;
    sourceY = 0;
  } else {
    sourceWidth = imageObj.width;
    sourceHeight = sourceWidth / targetAspectRatio;
    sourceX = 0;
    sourceY = (imageObj.height - sourceHeight) / 2;
  }

  context.drawImage(
    imageObj,
    sourceX, sourceY,
    sourceWidth, sourceHeight,
    280, 445,
    targetWidth, targetHeight
  );
}

// Function to render text on the canvas
function renderText(context, text, y, font, color, maxWidth) {
  context.font = font;
  context.fillStyle = color;
  context.textAlign = 'center';
  context.textBaseline = 'top';
  
  const centerX = (280 + 840) / 2; // Center point between 280px and 840px
  
  // Split text into words
  const words = text.split(' ');
  let line = '';
  let lineY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, centerX, lineY);
      line = words[n] + ' ';
      lineY += 50; // Increased line height for larger font
    } else {
      line = testLine;
    }
  }
  context.fillText(line, centerX, lineY);
}

// Function to render the composite image
function renderCompositeImage() {
  if (!uploadedImage || !selectedFrame) return;
  ctx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);

  // Draw the uploaded image first
  cropAndPositionImage(uploadedImage, ctx);

  // Then draw the frame on top
  ctx.drawImage(selectedFrame, 0, 0, resultCanvas.width, resultCanvas.height);

  // Render name
  const name = document.getElementById('userName').value;
  renderText(ctx, name, 1100, 'bold 48px Poppins', '#000000', 560);

  // Render company name
  const company = document.getElementById('companyName').value;
  renderText(ctx, company, 1165, '30px Poppins', '#000000', 560);

  updatePreviewImage();
}

// This function should update the previewImage's src attribute to show the composite image
function updatePreviewImage() {
  previewImage.src = resultCanvas.toDataURL('image/png');
  previewImage.style.display = 'block';
}

// Download button click event
document.getElementById('downloadBtn').addEventListener('click', function () {
  const downloadLink = document.createElement('a');
  downloadLink.href = resultCanvas
    .toDataURL('image/png')
    .replace('image/png', 'image/octet-stream');
  downloadLink.download = 'wordcamp_kerala_profile_picture.png';
  downloadLink.click();
});

// For share options, you can use the Web Share API where supported
document.getElementById('shareBtn').addEventListener('click', function () {
  if (navigator.share) {
    resultCanvas.toBlob((blob) => {
      const file = new File([blob], 'wordcamp_kerala_profile_picture.png', {
        type: 'image/png',
      });
      navigator
        .share({
          files: [file],
          title: 'WordCamp Kerala 2024',
          text: 'Check out my WordCamp Kerala 2024 profile picture!',
        })
        .then(() => console.log('Share was successful.'))
        .catch(console.error);
    }, 'image/png');
  } else {
    // Fall back to displaying social share links / error message
    const fallbackShareLinks = document.getElementById('fallbackShare');
    fallbackShareLinks.classList.add('visible');

    //  TODO: adding fall back social share options.
    // Update the share URLs with the link to the current photo
    fallbackShareLinks.querySelectorAll('a').forEach(function(anchor) {
        const originalHref = anchor.href;
        const service = anchor.textContent.toLowerCase();
        
        if (service === 'facebook' || service === 'twitter' || service === 'linkedin') {
            // Replace 'URL' in each service's URL with the encoded photo URL
            anchor.href = originalHref.replace('URL', currentPhotoUrl);
        }
    });
  }
});

/**
 * Constructs an absolute URL for a given image path.
 * @param {string} imagePath - The relative path to the image.
 * @returns {string} The absolute URL to the image.
 */
function getAbsoluteImageUrl(imagePath) {
  const baseUrl = window.location.href;
  const absoluteUrl = new URL(imagePath, baseUrl).href;
  return absoluteUrl;
}

// Initialize frames
function initializeFrames() {
  const frameSource = [
    getAbsoluteImageUrl('assets/frames/attendee-tag.png'),
  ];
  frameSource.forEach((src) => {
    const frameImg = new Image();
    frameImg.src = src;
    frameImg.onload = function() {
      this.style.display = 'inline-block';
      this.style.cursor = 'pointer';
    };
    frameImg.onclick = function () {
      selectedFrame = frameImg;
      renderCompositeImage();
    };
    framesContainer.appendChild(frameImg);
  });
}

// Call initializeFrames when the DOM content is loaded
document.addEventListener('DOMContentLoaded', initializeFrames);
