# Media Library & Asset Management

This guide covers uploading images, managing the media library, using images in content, file constraints, naming conventions, and best practices for image sizing and web optimization.

---

## Overview

The Media Library is the central repository for all images used on the SOWA platform. All Editors and Admins can upload and delete images. The media library stores original files and provides URLs for use in content.

### Accessing the Media Library

1. Go to **Media** in the admin sidebar
2. You see a grid or list view of all uploaded images
3. Each image shows a thumbnail, filename, upload date, and file size
4. Use the search bar to find images by name

---

## File Constraints

Before uploading, check that your image meets the following requirements.

### Accepted Formats

The platform accepts the following image formats:

- **JPEG** (.jpg, .jpeg) — For photographs and complex images
- **PNG** (.png) — For graphics, logos, and images with transparency
- **GIF** (.gif) — For animated images
- **WebP** (.webp) — Modern, efficient format (recommended)
- **SVG** (.svg) — Scalable vector graphics (for logos and icons)

### File Size Limits

- **Maximum file size:** 5 MB
- **Recommended size:** 500 KB to 2 MB

Large files slow down page load times. See "Best Practices" section for guidance on resizing.

### Unsupported Formats

The following formats are NOT accepted:

- BMP, TIFF, PSD, ICO, HEIC
- Video formats (MP4, MOV, etc.)
- Documents (PDF, Word, Excel)

If you have an image in an unsupported format, convert it to JPEG, PNG, or WebP using free tools like:

- Online: TinyPNG, Convertio, CloudConvert
- Desktop: Preview (macOS), Paint.NET (Windows), GIMP (cross-platform)

---

## Uploading Images

**Steps:**

1. Navigate to **Media** in the sidebar
2. Click **Upload** (top right)
3. Select an image file from your computer (or drag and drop)
4. The upload begins and the image appears in the library
5. The system automatically assigns a filename with a timestamp to prevent conflicts

**Upload Tips:**

- You can upload multiple images at once by selecting multiple files
- The upload progress bar shows the status
- After upload, you can copy the image URL to use in content

### Naming Images Before Upload

While the system renames files to prevent conflicts, naming your image sensibly before uploading makes it easier to find later. Use descriptive filenames:

**Good naming:**

- `wind-turbine-maintenance.jpg`
- `offshore-platform-sunset.png`
- `skillnet-logo.svg`
- `event-2026-q1-speaker.jpg`

**Avoid:**

- `image1.jpg`, `photo.jpg` — Too generic
- `IMG_12345.jpg` — Camera defaults; unclear content
- `turbine_new_final_FINAL_v2.jpg` — Unclear versioning

**File naming convention:**

- Use lowercase letters
- Replace spaces with hyphens
- Keep names under 50 characters
- Avoid special characters except hyphens and underscores
- Include a descriptive keyword at the start (e.g. `event-`, `career-`, `course-`)

### What to Do After Upload

Once the image is uploaded:

1. Copy its URL from the media library (usually shown below the thumbnail)
2. Use this URL in the image field of your content (Careers, Courses, Events, News, Research)
3. Do not move or rename the file after uploading; the URL remains stable

---

## Using Images in Content

When editing content (Careers, Courses, Events, News, Research), you will see an "Image" field or a file picker.

**To add an image to content:**

1. Click the image field or file picker button
2. A media browser or picker opens
3. Select the image you want to use (search or browse the library)
4. Click **Select** or **Insert**
5. The image URL is populated into the field
6. When you save the content, the image appears on the public page

**If using the URL field directly:**

1. Copy the full URL from the media library (should start with `https://`)
2. Paste the URL into the image field
3. Save

### Image Usage Rules

Each image can be used in multiple pieces of content. There are no limits on how many times an image can be referenced. However:

- If you plan to delete an image, ensure it is not currently used in published content (see "Deleting Images" section)
- If you significantly modify an image and re-upload it with the same URL, all content using that URL will display the new version
- Always test images on the public site after publishing to ensure they display correctly

---

## Finding and Organizing Images

### Searching

The media library includes a search function to find images by filename or metadata.

1. In the Media library, enter a search term in the search bar
2. Matching images appear instantly
3. Search works on filenames only (not on image content)

**Tips:**

- Search by keyword prefix: `event-`, `career-`, `course-` to find images by type
- Search by date or topic if you remember when the image was uploaded
- Use descriptive filenames so searching is easy

### Sorting

Depending on the platform interface, you may be able to sort by:

- Upload date (newest first, oldest first)
- Filename (alphabetical)
- File size

### Viewing Image Details

Click an image in the library to see:

- Filename
- Upload date and time
- File size
- Dimensions (width × height in pixels)
- Full URL
- "Copy URL" button
- "Delete" button

---

## Deleting Images

Only delete images that are no longer needed.

**To delete an image:**

1. Find the image in the media library
2. Click the **Delete** button (usually a trash icon)
3. A confirmation dialog appears: "Are you sure? If this image is used in content, deleting it will break those image links."
4. If you confirm, the image is permanently deleted

**Before Deleting:**

- Check if the image is used in any published content
- If the image is used, you have two options:
  - Replace the image in all content before deleting, or
  - Keep the image in the library unused (it takes minimal space)
- Document which content uses the image if you are unsure

**Caution:**

- Deletion is permanent; the file cannot be recovered
- If you delete an image while it is still linked in content, visitors will see a broken image (a broken link icon)
- If you need to replace an image, upload a new version instead of deleting the old one

---

## Image Sizing and Web Optimization

To ensure fast page load times and a good user experience, optimize images before uploading.

### Recommended Image Dimensions

Different content types use images at different sizes. Plan accordingly:

| Content Type                   | Image Usage               | Recommended Dimensions       | Aspect Ratio  |
| ------------------------------ | ------------------------- | ---------------------------- | ------------- |
| **Careers, Courses, Research** | Hero/thumbnail on listing | 1200 × 675 px                | 16:9          |
| **Events**                     | Hero image on event page  | 1200 × 675 px                | 16:9          |
| **News Articles**              | Hero image at top         | 1200 × 675 px                | 16:9          |
| **Content Sections**           | Inline images within text | 800 × 400 px                 | 2:1           |
| **Logos/Icons**                | Branding, small graphics  | 200 × 200 px to 500 × 500 px | 1:1 or varies |

**Note:** The platform may automatically resize or crop images depending on where they are used. Always preview on the public site after publishing to see how the image displays.

### Compression and File Size Reduction

Before uploading, compress your image to reduce file size while maintaining quality. Options:

**Online Tools (free):**

- TinyPNG / TinyJPG (www.tinypng.com) — Excellent quality at smaller file sizes
- Optimizilla (www.optimizilla.com) — Interactive compression control
- Compressor.io — Multiple format support
- Cloudinary — Drag-and-drop compression

**Desktop Software:**

- Preview (macOS) — File > Export, adjust Quality slider
- Paint.NET (Windows) — File > Export As
- GIMP (cross-platform) — File > Export As, adjust compression

**Typical Compression Results:**

- JPEG at 80% quality: 10–300 KB (from larger files)
- PNG (with optimization): 50–400 KB depending on complexity
- WebP format: 30–50% smaller than JPEG at same quality

### Image Formats: When to Use Which

- **JPEG** — Photographs, complex images with many colors. Best for outdoor, event, and landscape photos. Smaller file size.
- **PNG** — Graphics, screenshots, images with transparency (e.g. logos with no background). Larger file size but lossless.
- **WebP** — Modern format combining JPEG and PNG benefits. Smaller than both but less universal browser support. Recommended for new uploads.
- **SVG** — Logos, icons, and simple graphics. Scalable to any size without quality loss. Recommended for branding.
- **GIF** — Animated images or simple graphics. Larger file size; use only when animation is essential.

### Best Practices for Web Images

1. **Start large, compress afterwards.** Begin with a high-quality source and compress down to 500 KB–2 MB, not the reverse.
2. **Choose the right format.** JPEG for photos, PNG for graphics, SVG for logos, WebP for the modern web.
3. **Resize to content dimensions.** Do not upload a 6000 × 4000 px image if it will display at 800 × 450 px. Resize before uploading.
4. **Use consistent dimensions.** When uploading multiple images for similar content (e.g. career photos), use the same dimensions for a consistent look.
5. **Optimize filenames.** Descriptive filenames help with SEO and make the library maintainable.
6. **Test on the public site.** After publishing, visit the public page and verify the image displays correctly, loads quickly, and looks good on mobile and desktop.
7. **Archive outdated images.** Instead of deleting, you can keep old images unused in the library if they may be needed for reference. Unused images take minimal space.

---

## Image Storage and Backup

The platform automatically stores uploaded images on a secure server. Images are:

- Backed up regularly as part of platform backups
- Accessible via permanent URLs that do not change
- Cached for faster delivery to users

You do not need to manually back up images. However, if you want to preserve a copy of all images locally:

1. Periodically download images from the media library
2. Store them in a local folder with clear naming and dates
3. Use this as a reference archive

---

## Troubleshooting Image Issues

| Issue                                             | Solution                                                                                                                                                                |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Upload fails or shows "File too large"            | Check that the image is under 5 MB. Compress using TinyPNG or similar tools.                                                                                            |
| Upload is slow                                    | This is normal for images over 2 MB. Compress before uploading.                                                                                                         |
| Image appears blurry or pixelated on public site  | The image resolution may be too low for the display size. Try uploading a higher-resolution version or reducing the display size.                                       |
| Image does not appear in content after publishing | Verify the image URL is correct. Check that the image file is still in the media library and has not been deleted.                                                      |
| Broken image (broken link icon) on public page    | The image was deleted from the media library but is still referenced in content. Re-upload the image with the same URL, or update the content to use a different image. |
| Cannot find an image in the media library         | Use the search function with a keyword from the filename. Sort by upload date if you remember roughly when it was uploaded.                                             |
| Image appears in wrong colors                     | The original image may have color profile issues. Try re-exporting from your design software or converting to sRGB color space.                                         |
| Image file format not accepted                    | Convert the image to JPEG, PNG, or WebP using one of the free online tools mentioned above.                                                                             |

---

## Summary: Image Upload Checklist

Before uploading an image to the media library:

- [ ] File format is JPEG, PNG, WebP, GIF, or SVG
- [ ] File size is under 5 MB (ideally 500 KB–2 MB)
- [ ] Image is compressed using TinyPNG, Compressor.io, or similar
- [ ] Dimensions are appropriate for the content type (see table above)
- [ ] Filename is descriptive and uses lowercase with hyphens (e.g. `wind-farm-2026.jpg`)
- [ ] Image is high-quality and relevant to the content
- [ ] Image is licensed for use (no copyright issues)
- [ ] Image will display correctly at the intended size

**After uploading:**

- [ ] Copy the image URL for use in content
- [ ] Add the image to your content using the URL
- [ ] Publish the content
- [ ] Visit the public page to verify the image appears and loads quickly
- [ ] Document where the image is used (in your content notes or version history)
