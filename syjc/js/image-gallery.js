/**
 * Image Gallery Module
 * Replaces PHP functionality for displaying image galleries
 */

class ImageGallery {
  constructor(config) {
    this.config = config;
    this.icon = config.icon;
    this.pics = config.pics;
    this.folders = config.folders;
  }

  /**
   * Load image gallery for a specific folder
   * @param {string} folderId - The folder ID (e.g., '201804sgz')
   * @param {string} containerId - The container element ID where images will be rendered
   */
  loadGallery(folderId, containerId = "masonry") {
    const folderInfo = this.folders[folderId];
    if (!folderInfo) {
      console.error(`Folder ${folderId} not found in configuration`);
      return;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container element #${containerId} not found`);
      return;
    }

    // Get images from the global manifest variable
    // Normalize folder ID to uppercase, replacing hyphens with underscores
    const normalizedId = folderId.toUpperCase().replace(/-/g, "_");
    const manifestVar = `MANIFEST_${normalizedId}`;
    const images = window[manifestVar];

    if (!images || !Array.isArray(images)) {
      console.error(
        `Manifest ${manifestVar} not found. Make sure to load the manifest script first.`,
      );
      console.error(
        `Available manifests:`,
        Object.keys(window).filter((k) => k.startsWith("MANIFEST_")),
      );
      return;
    }

    // Render images
    this.renderImages(images, folderInfo, container);

    // Note: masonry will be initialized after images load in renderImages
  }

  /**
   * Render images in the container
   */
  renderImages(images, folderInfo, container) {
    container.innerHTML = ""; // Clear existing content

    let imagesToLoad = images.length;
    let imagesLoaded = 0;

    images.forEach((imageName) => {
      const imageUrl = folderInfo.path + imageName;
      const remoteUrl = this.pics + "/" + folderInfo.remotePath + imageName;

      // Create img element (not wrapped in anchor for masonry to work)
      const img = document.createElement("img");
      img.src = imageUrl;
      img.alt = imageName;

      // Don't set any display styles - let masonry handle it
      img.style.cursor = "pointer";

      // Add data attribute for the link
      img.dataset.href = remoteUrl;

      // Load image to get dimensions
      const self = this;
      img.onload = function () {
        // Set width and height attributes for masonry
        this.setAttribute("width", this.naturalWidth);
        this.setAttribute("height", this.naturalHeight);

        imagesLoaded++;
        // Re-run masonry after all images have dimensions
        if (imagesLoaded === imagesToLoad) {
          self.initMasonry(container.id);
        }
      };

      // Make image clickable
      img.onclick = function () {
        window.open(remoteUrl, "_blank");
      };

      container.appendChild(img);
    });
  }

  /**
   * Initialize Masonry layout
   */
  initMasonry(containerId) {
    // Use jQuery masonry plugin
    if (typeof jQuery !== "undefined" && jQuery.fn.masonry) {
      const $container = jQuery(`#${containerId}`);
      const images = $container.find("img");

      // Verify all images have width/height attributes
      let allHaveDimensions = true;
      images.each(function () {
        if (!jQuery(this).attr("width") || !jQuery(this).attr("height")) {
          allHaveDimensions = false;
          console.warn("Image missing dimensions:", jQuery(this).attr("src"));
        }
      });

      if (allHaveDimensions && images.length > 0) {
        console.log("Initializing masonry with", images.length, "images");
        // Try with much lower ratio or no ratio parameter
        $container.masonry({
          rowMinAspectRatio: 1.2,
        });
        console.log("Masonry initialized");
      } else {
        console.warn("Not all images have dimensions yet");
      }
    }
  }

  /**
   * Load gallery with static image list (alternative approach)
   * This can be used when we have a pre-defined list of images
   */
  loadGalleryWithImages(folderId, imageList, containerId = "masonry") {
    const folderInfo = this.folders[folderId];
    if (!folderInfo) {
      console.error(`Folder ${folderId} not found in configuration`);
      return;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container element #${containerId} not found`);
      return;
    }

    this.renderImages(imageList, folderInfo, container);
    this.initMasonry(containerId);
  }
}

// Export for use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = ImageGallery;
}
