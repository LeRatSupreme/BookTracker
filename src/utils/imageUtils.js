/**
 * Resize and compress an image file for optimized storage.
 * @param {File} file - The image file to process.
 * @param {number} maxWidth - Maximum width (default 300px).
 * @param {number} maxHeight - Maximum height (default 300px).
 * @param {number} quality - Compression quality (0 to 1, default 0.7).
 * @returns {Promise<string>} - Resolves with Base64 Data URL.
 */
export const resizeImage = (file, maxWidth = 300, maxHeight = 300, quality = 0.7) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Calculate ratios
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height *= maxWidth / width));
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width *= maxHeight / height));
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Export as WebP for better compression, fallback to JPEG
                const dataUrl = canvas.toDataURL('image/webp', quality);
                resolve(dataUrl);
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};
