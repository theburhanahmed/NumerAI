# Image Optimization Guide

## Overview
This guide documents the image optimization strategy for NumerAI.

## Next.js Image Component Usage

All images should use Next.js `Image` component instead of `<img>` tags for:
- Automatic optimization
- Lazy loading
- Responsive images
- WebP format conversion

## Implementation

### Basic Usage
```tsx
import Image from 'next/image'

<Image
  src="/path/to/image.jpg"
  alt="Descriptive alt text"
  width={400}
  height={300}
  className="rounded-lg"
/>
```

### With Fill (for responsive containers)
```tsx
<div className="relative w-full h-64">
  <Image
    src="/path/to/image.jpg"
    alt="Descriptive alt text"
    fill
    className="object-cover rounded-lg"
  />
</div>
```

### External Images
External images must be added to `next.config.mjs`:
```js
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'images.unsplash.com',
    },
  ],
}
```

## Image Formats

- **WebP**: Preferred format (automatic conversion by Next.js)
- **AVIF**: Supported for modern browsers
- **PNG**: For images requiring transparency
- **JPG**: For photographs

## Optimization Checklist

- [x] Testimonials component uses Next.js Image
- [x] Remedies page uses Next.js Image
- [ ] Audit all pages for remaining `<img>` tags
- [ ] Convert all images to WebP where possible
- [ ] Add blur placeholders for above-fold images
- [ ] Ensure all images have proper alt text

## Performance Tips

1. Use appropriate sizes for images
2. Add `priority` prop for above-fold images
3. Use `loading="lazy"` for below-fold images (default)
4. Optimize image dimensions before upload
5. Use responsive images with `sizes` prop

