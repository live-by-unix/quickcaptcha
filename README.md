# QuickCaptcha

A fully client-side, embeddable CAPTCHA widget that provides secure verification without any backend dependencies. QuickCaptcha is lightweight, accessible, and easy to integrate into any web application.

## Features

- **Zero Dependencies**: No external libraries or frameworks required
- **Client-Side Only**: Complete verification without backend infrastructure
- **Multiple Challenge Types**: Math problems, click detection, and pattern recognition
- **Accessible**: WCAG 2.1 AA compliant with full keyboard navigation and ARIA labels
- **Multi-Language Support**: Built-in translations for 6 languages
- **Rate Limiting**: Configurable attempt limits and cooldown periods
- **Analytics Hook**: Optional callback for tracking verification attempts
- **Theming**: Light and dark themes with customizable sizing
- **Privacy-Friendly**: No data sent to external servers

## Installation

### CDN Installation

Add the following script tag to your HTML, ideally before the closing `</body>` tag:

```html
<script src="https://cdn.example.com/quickcaptcha.min.js"></script>
```

### Self-Hosted Installation

1. Download the latest `quickcaptcha.min.js` file
2. Host it on your server or CDN
3. Reference it in your HTML:

```html
<script src="/path/to/quickcaptcha.min.js"></script>
```

## Quick Start

### Basic Usage

Simply add a `data-quickcaptcha` attribute to any element where you want the CAPTCHA to appear:

```html
<div data-quickcaptcha></div>
```

The widget will automatically initialize and inject itself into the element.

### With Verification Callback

```html
<div id="my-captcha" data-quickcaptcha></div>

<script>
  // Get the captcha instance
  const captcha = QuickCaptcha.get('quickcaptcha-1');
  
  // Register verification callback
  captcha.onVerify(function(isVerified) {
    if (isVerified) {
      console.log('User verified successfully!');
      // Proceed with form submission or other action
    } else {
      console.log('Verification failed');
    }
  });
</script>
```

## Configuration

### Data Attributes

Configure the widget using HTML data attributes:

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `data-theme` | `light`, `dark` | `light` | Color theme of the widget |
| `data-position` | `bottom-right`, `bottom-left`, `top-right`, `top-left` | `bottom-right` | Position when fixed |
| `data-size` | `small`, `normal`, `large` | `normal` | Size of the widget |
| `data-language` | `en`, `es`, `fr`, `de`, `ja`, `zh` | `en` | Language for UI text |
| `data-max-attempts` | Number (1-10) | `3` | Maximum verification attempts |
| `data-cooldown` | Number (milliseconds) | `5000` | Cooldown period between attempts |
| `data-challenge-type` | `math`, `click`, `pattern` | `math` | Type of verification challenge |

### Example Configuration

```html
<div data-quickcaptcha 
     data-theme="dark" 
     data-size="large" 
     data-language="es"
     data-challenge-type="click">
</div>
```

### JavaScript Configuration

You can also configure the widget programmatically:

```html
<div id="custom-captcha"></div>

<script>
  const captcha = QuickCaptcha.create(document.getElementById('custom-captcha'), {
    theme: 'dark',
    size: 'large',
    language: 'fr',
    maxAttempts: 5,
    cooldownPeriod: 10000,
    challengeType: 'pattern'
  });
  
  captcha.onVerify(function(isVerified) {
    console.log('Verification result:', isVerified);
  });
</script>
```

## API Reference

### QuickCaptcha Object

The global `QuickCaptcha` object provides the following methods:

#### `init(selector = '[data-quickcaptcha]')`

Auto-initializes all elements matching the selector.

```javascript
QuickCaptcha.init(); // Default selector
QuickCaptcha.init('.my-captcha-class'); // Custom selector
```

#### `create(element, options = {})`

Creates a new CAPTCHA instance on the specified element.

```javascript
const element = document.getElementById('captcha-container');
const captcha = QuickCaptcha.create(element, {
  theme: 'dark',
  language: 'es'
});
```

#### `get(id)`

Retrieves a CAPTCHA instance by its ID.

```javascript
const captcha = QuickCaptcha.get('quickcaptcha-1');
```

#### `onVerify(callback)`

Registers a verification callback for all instances.

```javascript
QuickCaptcha.onVerify(function(isVerified) {
  console.log('Global verification:', isVerified);
});
```

#### `onAnalytics(callback)`

Registers an analytics callback for all instances.

```javascript
QuickCaptcha.onAnalytics(function(data) {
  console.log('Analytics data:', data);
  // data includes: success, attempts, challengeType, timestamp
});
```

#### `resetAll()`

Resets all CAPTCHA instances to their initial state.

```javascript
QuickCaptcha.resetAll();
```

#### `destroyAll()`

Destroys all CAPTCHA instances and removes them from the DOM.

```javascript
QuickCaptcha.destroyAll();
```

### Instance Methods

Each CAPTCHA instance provides the following methods:

#### `onVerify(callback)`

Registers a callback function that receives the verification result.

```javascript
captcha.onVerify(function(isVerified) {
  if (isVerified) {
    // Handle successful verification
  }
});
```

#### `onAnalytics(callback)`

Registers an analytics callback that receives verification attempt data.

```javascript
captcha.onAnalytics(function(data) {
  // Track verification attempts
  console.log('Challenge type:', data.challengeType);
  console.log('Number of attempts:', data.attempts);
  console.log('Success:', data.success);
  console.log('Timestamp:', data.timestamp);
});
```

#### `reset()`

Resets the CAPTCHA to its initial state.

```javascript
captcha.reset();
```

#### `destroy()`

Destroys the CAPTCHA instance and removes it from the DOM.

```javascript
captcha.destroy();
```

## Integration Examples

### Login Form Integration

```html
<form id="login-form">
  <div>
    <label for="username">Username:</label>
    <input type="text" id="username" name="username" required>
  </div>
  
  <div>
    <label for="password">Password:</label>
    <input type="password" id="password" name="password" required>
  </div>
  
  <div data-quickcaptcha data-theme="light"></div>
  
  <button type="submit" id="submit-btn" disabled>Login</button>
</form>

<script>
  let isUserVerified = false;
  
  // Get the captcha instance
  const captcha = QuickCaptcha.get('quickcaptcha-1');
  
  // Register verification callback
  captcha.onVerify(function(isVerified) {
    isUserVerified = isVerified;
    document.getElementById('submit-btn').disabled = !isVerified;
  });
  
  // Handle form submission
  document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!isUserVerified) {
      alert('Please complete the CAPTCHA verification');
      return;
    }
    
    // Proceed with form submission
    const formData = new FormData(this);
    // Submit to your server...
  });
</script>
```

### Comment Box Integration

```html
<div class="comment-section">
  <textarea id="comment-text" placeholder="Write your comment..."></textarea>
  
  <div data-quickcaptcha 
       data-theme="dark" 
       data-size="small"
       data-language="en">
  </div>
  
  <button id="post-comment" disabled>Post Comment</button>
</div>

<script>
  const captcha = QuickCaptcha.get('quickcaptcha-1');
  let verified = false;
  
  captcha.onVerify(function(isVerified) {
    verified = isVerified;
    updateSubmitButton();
  });
  
  document.getElementById('comment-text').addEventListener('input', updateSubmitButton);
  
  function updateSubmitButton() {
    const hasText = document.getElementById('comment-text').value.trim().length > 0;
    document.getElementById('post-comment').disabled = !(hasText && verified);
  }
  
  document.getElementById('post-comment').addEventListener('click', function() {
    if (verified) {
      // Post the comment
      const comment = document.getElementById('comment-text').value;
      console.log('Posting comment:', comment);
    }
  });
</script>
```

### Multiple CAPTCHAs on One Page

```html
<div data-quickcaptcha data-theme="light" id="captcha-1"></div>
<div data-quickcaptcha data-theme="dark" id="captcha-2"></div>
<div data-quickcaptcha data-theme="light" id="captcha-3"></div>

<script>
  // Handle each captcha individually
  const captcha1 = QuickCaptcha.get('quickcaptcha-1');
  const captcha2 = QuickCaptcha.get('quickcaptcha-2');
  const captcha3 = QuickCaptcha.get('quickcaptcha-3');
  
  captcha1.onVerify(function(isVerified) {
    console.log('Captcha 1 verified:', isVerified);
  });
  
  captcha2.onVerify(function(isVerified) {
    console.log('Captcha 2 verified:', isVerified);
  });
  
  captcha3.onVerify(function(isVerified) {
    console.log('Captcha 3 verified:', isVerified);
  });
  
  // Or handle all captchas globally
  QuickCaptcha.onVerify(function(isVerified) {
    console.log('A captcha was verified:', isVerified);
  });
</script>
```

### With Analytics Tracking

```html
<div data-quickcaptcha data-challenge-type="math"></div>

<script>
  const captcha = QuickCaptcha.get('quickcaptcha-1');
  
  // Track verification attempts
  captcha.onAnalytics(function(data) {
    // Send to your analytics service
    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'captcha_attempt',
        data: data
      })
    });
  });
  
  captcha.onVerify(function(isVerified) {
    console.log('Final verification result:', isVerified);
  });
</script>
```

## Supported Languages

QuickCaptcha includes built-in translations for:

- **English** (`en`)
- **Spanish** (`es`)
- **French** (`fr`)
- **German** (`de`)
- **Japanese** (`ja`)
- **Chinese** (`zh`)

To add custom translations, modify the `translations` object in the source code.

## Challenge Types

### Math Challenge (Default)

Users solve simple arithmetic problems (addition, subtraction, multiplication). The math problems are rendered as canvas elements with noise and rotation to prevent copy-pasting and OCR attacks.

```html
<div data-quickcaptcha data-challenge-type="math"></div>
```

### Click Challenge

Users identify and click on a differently colored box in a grid.

```html
<div data-quickcaptcha data-challenge-type="click"></div>
```

### Pattern Challenge

Users select a specific shape from multiple options.

```html
<div data-quickcaptcha data-challenge-type="pattern"></div>
```

## Accessibility

QuickCaptcha is designed to be WCAG 2.1 AA compliant:

- **Keyboard Navigation**: Full keyboard support with Tab, Enter, and Space keys
- **ARIA Labels**: Proper ARIA attributes for screen readers
- **Focus Indicators**: Clear visual focus states
- **Color Contrast**: Meets WCAG AA contrast requirements
- **Screen Reader Support**: Announces verification status to screen readers

### Keyboard Shortcuts

- `Tab` - Navigate to the CAPTCHA widget
- `Enter`/`Space` - Activate the CAPTCHA
- `Escape` - Close the challenge modal
- `Tab` - Navigate between challenge options

## Security Considerations

While QuickCaptcha is client-side and suitable for many use cases, consider the following:

1. **Bot Protection**: Client-side CAPTCHAs can be bypassed by sophisticated bots. For high-security applications, consider server-side validation or hybrid approaches.

2. **Canvas Rendering**: Math challenges are rendered as canvas elements with noise, rotation, and random colors to prevent copy-pasting and basic OCR attacks.

2. **Rate Limiting**: The built-in rate limiting helps prevent brute force attacks but can be circumvented. Implement additional server-side rate limiting for production use.

3. **Verification Validation**: Always validate the CAPTCHA result on your server before performing sensitive actions.

4. **Session Management**: Consider tying CAPTCHA verification to user sessions for additional security.

## Browser Support

QuickCaptcha supports all modern browsers:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

Internet Explorer is not supported.

## Troubleshooting

### Widget Not Appearing

**Problem**: The CAPTCHA widget doesn't appear on the page.

**Solutions**:
- Ensure the script is loaded before initialization
- Check that the element has the `data-quickcaptcha` attribute
- Verify there are no JavaScript errors in the console
- Make sure the element is not hidden via CSS

### Verification Not Working

**Problem**: Clicking the widget doesn't trigger verification.

**Solutions**:
- Check if other event handlers are preventing click events
- Verify the widget has proper z-index and isn't covered by other elements
- Ensure JavaScript is enabled in the browser
- Check for CSS conflicts that might disable pointer events

### Theme Not Applying

**Problem**: The dark theme or custom styling isn't working.

**Solutions**:
- Verify the `data-theme` attribute is set correctly
- Check for CSS conflicts with existing stylesheets
- Ensure the QuickCaptcha styles are loaded (check for `<style id="quickcaptcha-styles">`)
- Try using JavaScript configuration instead of data attributes

### Rate Limiting Issues

**Problem**: Users are getting rate limited too quickly.

**Solutions**:
- Increase the `data-max-attempts` value
- Increase the `data-cooldown` period
- Use the `reset()` method to manually reset the CAPTCHA
- Check if multiple CAPTCHAs are sharing rate limits

### Mobile Responsiveness

**Problem**: The widget doesn't display well on mobile devices.

**Solutions**:
- Use the `small` size for mobile: `data-size="small"`
- Ensure the widget has enough space in the layout
- Test on actual mobile devices, not just desktop browsers
- Consider using a fixed position for mobile: `data-position="bottom-right"`

## Performance

QuickCaptcha is optimized for performance:

- **File Size**: Minified version is ~18KB
- **Load Time**: Instant initialization (no external requests)
- **Memory Usage**: Minimal footprint (~50KB per instance)
- **No Blocking**: Asynchronous initialization doesn't block page rendering

## License

MIT License - feel free to use in personal and commercial projects.

## Support

For issues, questions, or contributions, please visit the project repository.

## Changelog

### Version 1.0.0
- Initial release
- Multiple challenge types (math, click, pattern)
- Multi-language support (6 languages)
- Light and dark themes
- Rate limiting and cooldown periods
- Analytics hook
- Full WCAG 2.1 AA accessibility compliance
- Keyboard navigation support
- Responsive design
