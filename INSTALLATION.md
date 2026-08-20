# QuickCaptcha Installation Guide

## Quick Start

### Option 1: CDN (Recommended for Production)

Add this single line to your HTML:

```html
<script src="https://cdn.example.com/quickcaptcha.min.js"></script>
```

Then add the widget anywhere:

```html
<div data-quickcaptcha></div>
```

### Option 2: Self-Hosted

1. Download the files from the repository
2. Upload to your server or CDN
3. Reference in your HTML:

```html
<script src="/path/to/quickcaptcha.min.js"></script>
```

## File Structure

```
quickcaptcha/
├── quickcaptcha.js       # Full source code (27KB)
├── quickcaptcha.min.js   # Minified production version (18KB)
├── quickcaptcha.css      # Standalone CSS (optional, auto-injected)
├── index.html           # Complete demo page
├── README.md            # Full documentation
├── WCAG_COMPLIANCE.md   # Accessibility compliance report
└── package.json         # NPM package file
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## Integration Examples

### Basic Integration

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>
<body>
    <form>
        <!-- Your form fields -->
        <input type="text" name="username" placeholder="Username">
        <input type="password" name="password" placeholder="Password">
        
        <!-- Add CAPTCHA -->
        <div data-quickcaptcha></div>
        
        <button type="submit">Submit</button>
    </form>
    
    <script src="quickcaptcha.min.js"></script>
    <script>
        // Handle verification
        const captcha = QuickCaptcha.get('quickcaptcha-1');
        captcha.onVerify(function(isVerified) {
            if (isVerified) {
                // Enable form submission
                document.querySelector('button[type="submit"]').disabled = false;
            }
        });
    </script>
</body>
</html>
```

### Advanced Configuration

```html
<div data-quickcaptcha 
     data-theme="dark" 
     data-size="large" 
     data-language="es"
     data-challenge-type="click"
     data-max-attempts="5"
     data-cooldown="10000">
</div>
```

## CDN Deployment

### Recommended CDN Settings

- **Cache-Control**: `public, max-age=31536000, immutable`
- **Compression**: Enable gzip/brotli
- **SSL**: Always serve over HTTPS
- **CORS**: Allow cross-origin if needed

### Example CDN Configuration

For Cloudflare:
```
Cache Level: Standard
Browser Cache TTL: 1 year
Auto Minify: JavaScript (enabled)
Brotli: Enabled
```

For AWS CloudFront:
```
Compress Objects: Yes
Cache Policy: CachingOptimized
Origin Request Policy: CORS-S3Origin
```

## Troubleshooting

### Widget Not Appearing

1. Check browser console for errors
2. Verify script path is correct
3. Ensure element has `data-quickcaptcha` attribute
4. Check for CSS conflicts

### Verification Not Working

1. Ensure JavaScript is enabled
2. Check for conflicting event handlers
3. Verify z-index and element positioning
4. Test in different browsers

### Performance Issues

1. Use minified version (`quickcaptcha.min.js`)
2. Enable CDN compression
3. Consider lazy loading for non-critical pages
4. Limit number of instances per page

## Support

For issues and questions:
- Check the main README.md documentation
- Review the index.html for examples
- See WCAG_COMPLIANCE.md for accessibility info
- Open an issue on GitHub

## Security Notes

While QuickCaptcha is client-side and suitable for many use cases:

1. **Always validate** verification results on your server
2. **Implement rate limiting** at the server level
3. **Use HTTPS** to prevent script tampering
4. **Monitor for abuse** using the analytics hook
5. **Consider hybrid approach** for high-security applications

## Version History

### v1.0.0 (Current)
- Initial release
- Multiple challenge types
- Multi-language support
- WCAG 2.1 AA compliant
- Analytics integration
- Rate limiting
