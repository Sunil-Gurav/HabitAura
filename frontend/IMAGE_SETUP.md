# Image Setup Instructions

## Required Images

Please add the following images to the `src/assets/images/` folder:

### Logo
- `logo.png` - Your HabitSpark logo (used in navbar and footer)

### Login Page Images
- `login-left.svg` - Left panel illustration (sign up side)
- `login-right.svg` - Right panel illustration (sign in side)

### Hero Images
- `hero-img1.jpg` - Progress tracking image (used in secondary image position)
- `hero-img2.jpg` - Progress visualization image (used in features section)
- `hero-img3.jpg` - Main habit building image (used as main hero image)

### Feature Images
- `hero-img4.jpg` - Stay organized image (used in features section)
- `hero-img5.jpg` - Habit tutorials image (used in features section)
- `hero-img6.jpg` - Smart analytics image (used in features section)
- `hero-img7.jpg` - Responsive design image (used in features section)
- `hero-img8.jpg` - Privacy & security image (used in features section)

## Image Specifications

### Logo
- **Format**: PNG (recommended for transparency) or JPG
- **Recommended size**: 100x100px to 200x200px
- **Aspect ratio**: 1:1 (square) works best
- **Background**: Transparent PNG preferred

### Hero Images
- **Format**: JPG or PNG
- **Recommended size**: 800x600px or higher
- **Aspect ratio**: 4:3 or 16:9 works best
- **File size**: Keep under 500KB for optimal loading

## File Structure

```
frontend/
├── src/
│   ├── assets/
│   │   ├── images/
│   │   │   ├── logo.png
│   │   │   ├── hero-img1.jpg
│   │   │   ├── hero-img2.jpg
│   │   │   ├── hero-img3.jpg
│   │   │   ├── hero-img4.jpg
│   │   │   ├── hero-img5.jpg
│   │   │   ├── hero-img6.jpg
│   │   │   ├── hero-img7.jpg
│   │   │   └── hero-img8.jpg
│   │   └── react.svg
│   ├── components/
│   │   ├── Landing.jsx
│   │   └── Landing.css
│   └── ...
```

## Usage in Code

The images are referenced in the Landing component as:
- `/src/assets/images/hero-img1.jpg`
- `/src/assets/images/hero-img2.jpg`
- etc.

Once you add the images to the correct folder, they will automatically appear in your landing page.

## Alternative: Placeholder Images

If you don't have the images yet, you can use placeholder services like:
- `https://picsum.photos/800/600` (random images)
- `https://via.placeholder.com/800x600` (solid color placeholders)

Just replace the image paths in `Landing.jsx` temporarily.