/**
 * QuickCaptcha - A fully client-side embeddable CAPTCHA widget
 * Version: 1.0.0
 * License: MIT
 */

(function(window) {
  'use strict';

  // Localization dictionary
  const translations = {
    en: {
      verify: 'Verify you are human',
      verifying: 'Verifying...',
      verified: 'Verified!',
      failed: 'Verification failed',
      retry: 'Click to retry',
      challenge: 'Solve: {challenge}',
      ariaLabel: 'CAPTCHA verification widget',
      ariaVerified: 'CAPTCHA verified successfully',
      ariaFailed: 'CAPTCHA verification failed'
    },
    es: {
      verify: 'Verifica que eres humano',
      verifying: 'Verificando...',
      verified: '¡Verificado!',
      failed: 'Verificación fallida',
      retry: 'Haz clic para reintentar',
      challenge: 'Resuelve: {challenge}',
      ariaLabel: 'Widget de verificación CAPTCHA',
      ariaVerified: 'CAPTCHA verificado exitosamente',
      ariaFailed: 'Verificación CAPTCHA fallida'
    },
    fr: {
      verify: 'Vérifiez que vous êtes humain',
      verifying: 'Vérification...',
      verified: 'Vérifié!',
      failed: 'Échec de la vérification',
      retry: 'Cliquez pour réessayer',
      challenge: 'Résolvez: {challenge}',
      ariaLabel: 'Widget de vérification CAPTCHA',
      ariaVerified: 'CAPTCHA vérifié avec succès',
      ariaFailed: 'Échec de la vérification CAPTCHA'
    },
    de: {
      verify: 'Bestätigen Sie, dass Sie ein Mensch sind',
      verifying: 'Überprüfung...',
      verified: 'Verifiziert!',
      failed: 'Überprüfung fehlgeschlagen',
      retry: 'Klicken Sie zum Wiederholen',
      challenge: 'Lösen: {challenge}',
      ariaLabel: 'CAPTCHA-Verifizierungs-Widget',
      ariaVerified: 'CAPTCHA erfolgreich verifiziert',
      ariaFailed: 'CAPTCHA-Verifizierung fehlgeschlagen'
    },
    ja: {
      verify: 'あなたが人間であることを確認',
      verifying: '確認中...',
      verified: '確認完了!',
      failed: '確認失敗',
      retry: '再試行するにはクリック',
      challenge: '解決: {challenge}',
      ariaLabel: 'CAPTCHA認証ウィジェット',
      ariaVerified: 'CAPTCHA認証成功',
      ariaFailed: 'CAPTCHA認証失敗'
    },
    zh: {
      verify: '验证您是真人',
      verifying: '验证中...',
      verified: '已验证!',
      failed: '验证失败',
      retry: '点击重试',
      challenge: '解决: {challenge}',
      ariaLabel: 'CAPTCHA验证小部件',
      ariaVerified: 'CAPTCHA验证成功',
      ariaFailed: 'CAPTCHA验证失败'
    }
  };

  // Rate limiting store (in-memory)
  const rateLimitStore = new Map();

  // Instance counter for unique IDs
  let instanceCounter = 0;

  /**
   * QuickCaptcha class - handles individual CAPTCHA instances
   */
  class QuickCaptcha {
    constructor(element, options = {}) {
      this.id = `quickcaptcha-${++instanceCounter}`;
      this.element = element;
      this.options = this.mergeOptions(options);
      this.verified = false;
      this.verifying = false;
      this.challenge = null;
      this.callback = null;
      this.analyticsCallback = null;
      this.attempts = 0;
      this.lastAttemptTime = 0;

      this.init();
    }

    mergeOptions(options) {
      const defaults = {
        theme: 'light',
        position: 'bottom-right',
        size: 'normal',
        language: 'en',
        maxAttempts: 3,
        cooldownPeriod: 5000, // 5 seconds
        challengeType: 'math' // 'math', 'click', 'pattern'
      };

      // Read data attributes from element
      const dataAttrs = {
        theme: this.element.getAttribute('data-theme'),
        position: this.element.getAttribute('data-position'),
        size: this.element.getAttribute('data-size'),
        language: this.element.getAttribute('data-language'),
        maxAttempts: this.element.getAttribute('data-max-attempts'),
        cooldownPeriod: this.element.getAttribute('data-cooldown'),
        challengeType: this.element.getAttribute('data-challenge-type')
      };

      // Merge with priority: options > data attributes > defaults
      return {
        theme: options.theme || dataAttrs.theme || defaults.theme,
        position: options.position || dataAttrs.position || defaults.position,
        size: options.size || dataAttrs.size || defaults.size,
        language: options.language || dataAttrs.language || defaults.language,
        maxAttempts: parseInt(options.maxAttempts || dataAttrs.maxAttempts || defaults.maxAttempts),
        cooldownPeriod: parseInt(options.cooldownPeriod || dataAttrs.cooldownPeriod || defaults.cooldownPeriod),
        challengeType: options.challengeType || dataAttrs.challengeType || defaults.challengeType
      };
    }

    getTranslation(key, params = {}) {
      const lang = translations[this.options.language] || translations['en'];
      let text = lang[key] || translations['en'][key] || key;
      
      // Replace parameters
      Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, params[param]);
      });
      
      return text;
    }

    init() {
      this.injectStyles();
      this.render();
      this.attachEventListeners();
    }

    injectStyles() {
      if (document.getElementById('quickcaptcha-styles')) return;

      const style = document.createElement('style');
      style.id = 'quickcaptcha-styles';
      style.textContent = this.getCSS();
      document.head.appendChild(style);
    }

    getCSS() {
      return `
        .quickcaptcha-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          display: inline-block;
          position: relative;
        }

        .quickcaptcha-widget {
          display: inline-flex;
          align-items: center;
          padding: 12px 16px;
          border-radius: 4px;
          cursor: pointer;
          user-select: none;
          transition: all 0.2s ease;
          border: 1px solid #d1d5db;
          background: #ffffff;
          color: #374151;
        }

        .quickcaptcha-widget:hover {
          border-color: #9ca3af;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .quickcaptcha-widget:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        .quickcaptcha-widget.small {
          padding: 8px 12px;
          font-size: 14px;
        }

        .quickcaptcha-widget.large {
          padding: 16px 20px;
          font-size: 18px;
        }

        .quickcaptcha-checkbox {
          width: 24px;
          height: 24px;
          border: 2px solid #d1d5db;
          border-radius: 2px;
          margin-right: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          transition: all 0.2s ease;
        }

        .quickcaptcha-widget.small .quickcaptcha-checkbox {
          width: 20px;
          height: 20px;
        }

        .quickcaptcha-widget.large .quickcaptcha-checkbox {
          width: 28px;
          height: 28px;
        }

        .quickcaptcha-checkbox.verified {
          background: #22c55e;
          border-color: #22c55e;
        }

        .quickcaptcha-checkbox.failed {
          background: #ef4444;
          border-color: #ef4444;
        }

        .quickcaptcha-checkbox.verifying {
          border-color: #3b82f6;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .quickcaptcha-icon {
          display: none;
          color: white;
          font-size: 16px;
          font-weight: bold;
        }

        .quickcaptcha-checkbox.verified .quickcaptcha-icon,
        .quickcaptcha-checkbox.failed .quickcaptcha-icon {
          display: block;
        }

        .quickcaptcha-text {
          font-size: 14px;
          font-weight: 500;
        }

        .quickcaptcha-widget.small .quickcaptcha-text {
          font-size: 12px;
        }

        .quickcaptcha-widget.large .quickcaptcha-text {
          font-size: 16px;
        }

        /* Dark theme */
        .quickcaptcha-widget.dark {
          background: #1f2937;
          border-color: #374151;
          color: #f3f4f6;
        }

        .quickcaptcha-widget.dark:hover {
          border-color: #4b5563;
        }

        .quickcaptcha-widget.dark .quickcaptcha-checkbox {
          background: #1f2937;
          border-color: #4b5563;
        }

        .quickcaptcha-widget.dark:focus {
          outline-color: #60a5fa;
        }

        /* Challenge modal */
        .quickcaptcha-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }

        .quickcaptcha-modal.active {
          display: flex;
        }

        .quickcaptcha-modal-content {
          background: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          width: 90%;
        }

        .quickcaptcha-modal.dark .quickcaptcha-modal-content {
          background: #1f2937;
          color: #f3f4f6;
        }

        .quickcaptcha-challenge {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          text-align: center;
        }

        .quickcaptcha-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 16px;
          margin-bottom: 12px;
          box-sizing: border-box;
        }

        .quickcaptcha-modal.dark .quickcaptcha-input {
          background: #374151;
          border-color: #4b5563;
          color: #f3f4f6;
        }

        .quickcaptcha-input:focus {
          outline: 2px solid #3b82f6;
          outline-offset: -2px;
        }

        .quickcaptcha-buttons {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .quickcaptcha-button {
          padding: 8px 16px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: background 0.2s;
        }

        .quickcaptcha-button-primary {
          background: #3b82f6;
          color: white;
        }

        .quickcaptcha-button-primary:hover {
          background: #2563eb;
        }

        .quickcaptcha-button-secondary {
          background: #e5e7eb;
          color: #374151;
        }

        .quickcaptcha-button-secondary:hover {
          background: #d1d5db;
        }

        .quickcaptcha-modal.dark .quickcaptcha-button-secondary {
          background: #374151;
          color: #f3f4f6;
        }

        .quickcaptcha-error {
          color: #ef4444;
          font-size: 12px;
          margin-top: 8px;
          display: none;
        }

        .quickcaptcha-error.visible {
          display: block;
        }

        /* Positioning */
        .quickcaptcha-fixed {
          position: fixed;
          z-index: 9999;
        }

        .quickcaptcha-fixed.bottom-right {
          bottom: 20px;
          right: 20px;
        }

        .quickcaptcha-fixed.bottom-left {
          bottom: 20px;
          left: 20px;
        }

        .quickcaptcha-fixed.top-right {
          top: 20px;
          right: 20px;
        }

        .quickcaptcha-fixed.top-left {
          top: 20px;
          left: 20px;
        }

        /* Accessibility */
        .quickcaptcha-widget[tabindex]:focus:not(:focus-visible) {
          outline: none;
        }

        .quickcaptcha-widget[tabindex]:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Loading spinner */
        .quickcaptcha-spinner {
          display: none;
          width: 16px;
          height: 16px;
          border: 2px solid #d1d5db;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .quickcaptcha-checkbox.verifying .quickcaptcha-spinner {
          display: block;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .quickcaptcha-canvas-container {
          display: flex;
          justify-content: center;
          margin: 16px 0;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 4px;
          border: 1px solid #e9ecef;
        }

        .quickcaptcha-modal.dark .quickcaptcha-canvas-container {
          background: #374151;
          border-color: #4b5563;
        }

        .quickcaptcha-math-canvas {
          border-radius: 4px;
          background: white;
        }
      `;
    }

    render() {
      this.element.innerHTML = `
        <div class="quickcaptcha-container ${this.options.position === 'fixed' ? 'quickcaptcha-fixed' : ''} ${this.options.position}">
          <div class="quickcaptcha-widget ${this.options.theme} ${this.options.size}" 
               tabindex="0" 
               role="button" 
               aria-label="${this.getTranslation('ariaLabel')}"
               id="${this.id}">
            <div class="quickcaptcha-checkbox">
              <span class="quickcaptcha-icon">✓</span>
              <div class="quickcaptcha-spinner"></div>
            </div>
            <span class="quickcaptcha-text">${this.getTranslation('verify')}</span>
          </div>
        </div>
      `;

      this.widget = this.element.querySelector('.quickcaptcha-widget');
      this.checkbox = this.element.querySelector('.quickcaptcha-checkbox');
      this.text = this.element.querySelector('.quickcaptcha-text');
    }

    attachEventListeners() {
      this.widget.addEventListener('click', (e) => this.handleClick(e));
      this.widget.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    handleClick(e) {
      e.preventDefault();
      if (this.verified) return;
      
      if (this.isRateLimited()) {
        this.showError('Please wait before trying again');
        return;
      }

      this.startVerification();
    }

    handleKeydown(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleClick(e);
      }
    }

    isRateLimited() {
      const now = Date.now();
      const timeSinceLastAttempt = now - this.lastAttemptTime;
      
      if (timeSinceLastAttempt < this.options.cooldownPeriod) {
        return true;
      }
      
      if (this.attempts >= this.options.maxAttempts) {
        // Reset after cooldown period
        if (timeSinceLastAttempt > this.options.cooldownPeriod * this.options.maxAttempts) {
          this.attempts = 0;
          return false;
        }
        return true;
      }
      
      return false;
    }

    startVerification() {
      this.verifying = true;
      this.attempts++;
      this.lastAttemptTime = Date.now();
      
      this.updateUI('verifying');
      
      // Generate and show challenge
      this.challenge = this.generateChallenge();
      this.showChallengeModal();
    }

    generateChallenge() {
      switch (this.options.challengeType) {
        case 'math':
          return this.generateMathChallenge();
        case 'click':
          return this.generateClickChallenge();
        case 'pattern':
          return this.generatePatternChallenge();
        default:
          return this.generateMathChallenge();
      }
    }

    generateMathChallenge() {
      const operations = ['+', '-', '*'];
      const operation = operations[Math.floor(Math.random() * operations.length)];
      let num1, num2, answer;

      switch (operation) {
        case '+':
          num1 = Math.floor(Math.random() * 50) + 1;
          num2 = Math.floor(Math.random() * 50) + 1;
          answer = num1 + num2;
          break;
        case '-':
          num1 = Math.floor(Math.random() * 50) + 10;
          num2 = Math.floor(Math.random() * num1);
          answer = num1 - num2;
          break;
        case '*':
          num1 = Math.floor(Math.random() * 10) + 1;
          num2 = Math.floor(Math.random() * 10) + 1;
          answer = num1 * num2;
          break;
      }

      return {
        type: 'math',
        num1: num1,
        num2: num2,
        operation: operation,
        answer: answer.toString()
      };
    }

    renderMathChallenge() {
      const canvas = document.createElement('canvas');
      canvas.width = 250;
      canvas.height = 80;
      canvas.className = 'quickcaptcha-math-canvas';
      
      const ctx = canvas.getContext('2d');
      
      // Set background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add noise to prevent OCR
      this.addNoise(ctx, canvas.width, canvas.height);
      
      // Set font properties
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Get the math components
      const num1 = this.challenge.num1.toString();
      const num2 = this.challenge.num2.toString();
      const operation = this.challenge.operation;
      
      // Calculate positions - spread them evenly
      const totalWidth = canvas.width;
      const elements = [num1, operation, num2, '=', '?'];
      const spacing = totalWidth / (elements.length + 1);
      
      // Draw each element with rotation
      elements.forEach((element, index) => {
        ctx.save();
        const x = spacing * (index + 1);
        const y = canvas.height / 2;
        ctx.translate(x, y);
        ctx.rotate((Math.random() - 0.5) * 0.15); // Less rotation for readability
        ctx.fillStyle = this.getRandomColor();
        ctx.fillText(element, 0, 0);
        ctx.restore();
      });
      
      return canvas;
    }

    addNoise(ctx, width, height) {
      // Add subtle noise dots (reduced for better readability)
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.15)`;
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Add subtle lines (reduced for better readability)
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.1)`;
        ctx.lineWidth = Math.random() * 1;
        ctx.beginPath();
        ctx.moveTo(Math.random() * width, Math.random() * height);
        ctx.lineTo(Math.random() * width, Math.random() * height);
        ctx.stroke();
      }
    }

    getRandomColor() {
      const colors = ['#1a1a2e', '#16213e', '#0f3460', '#e94560', '#533483', '#e63946', '#f1faee', '#a8dadc', '#457b9d', '#1d3557'];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    generateClickChallenge() {
      const targetIndex = Math.floor(Math.random() * 9);
      return {
        type: 'click',
        targetIndex: targetIndex,
        answer: targetIndex.toString()
      };
    }

    generatePatternChallenge() {
      const patterns = ['circle', 'square', 'triangle'];
      const targetPattern = patterns[Math.floor(Math.random() * patterns.length)];
      return {
        type: 'pattern',
        target: targetPattern,
        answer: targetPattern
      };
    }

    showChallengeModal() {
      // Remove existing modal if any
      const existingModal = document.querySelector('.quickcaptcha-modal');
      if (existingModal) {
        existingModal.remove();
      }

      const modal = document.createElement('div');
      modal.className = `quickcaptcha-modal ${this.options.theme}`;
      modal.innerHTML = this.getChallengeModalHTML();
      document.body.appendChild(modal);

      // Add canvas for math challenges
      if (this.challenge.type === 'math') {
        const canvasContainer = modal.querySelector('#quickcaptcha-canvas-container');
        if (canvasContainer) {
          const mathCanvas = this.renderMathChallenge();
          canvasContainer.appendChild(mathCanvas);
        }
      }

      // Make it visible
      setTimeout(() => modal.classList.add('active'), 10);

      this.modal = modal;
      this.attachModalListeners();
    }

    getChallengeModalHTML() {
      let challengeHTML = '';

      switch (this.challenge.type) {
        case 'math':
          challengeHTML = `
            <div class="quickcaptcha-challenge">
              ${this.getTranslation('challenge', { challenge: 'Solve the problem below' })}
            </div>
            <div class="quickcaptcha-canvas-container" id="quickcaptcha-canvas-container"></div>
            <input type="text" 
                   class="quickcaptcha-input" 
                   type="number" 
                   placeholder="Enter answer"
                   aria-label="Enter your answer"
                   autocomplete="off">
          `;
          break;
        case 'click':
          challengeHTML = `
            <div class="quickcaptcha-challenge">
              Click the box that appears different
            </div>
            <div class="quickcaptcha-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px;">
              ${Array(9).fill(0).map((_, i) => `
                <div class="quickcaptcha-grid-item" 
                     data-index="${i}"
                     style="width: 60px; height: 60px; background: ${i === parseInt(this.challenge.targetIndex) ? '#3b82f6' : '#e5e7eb'}; border-radius: 4px; cursor: pointer; transition: transform 0.2s;"
                     role="button"
                     tabindex="0"
                     aria-label="Grid item ${i + 1}">
                </div>
              `).join('')}
            </div>
          `;
          break;
        case 'pattern':
          challengeHTML = `
            <div class="quickcaptcha-challenge">
              Select the ${this.challenge.target}
            </div>
            <div class="quickcaptcha-patterns" style="display: flex; gap: 16px; justify-content: center; margin-bottom: 16px;">
              ${['circle', 'square', 'triangle'].map(shape => `
                <div class="quickcaptcha-pattern-item" 
                     data-shape="${shape}"
                     style="width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 2px solid #d1d5db; border-radius: 4px;"
                     role="button"
                     tabindex="0"
                     aria-label="${shape}">
                  ${this.getShapeSVG(shape)}
                </div>
              `).join('')}
            </div>
          `;
          break;
      }

      return `
        <div class="quickcaptcha-modal-content" role="dialog" aria-modal="true" aria-labelledby="quickcaptcha-challenge-title">
          <h3 id="quickcaptcha-challenge-title" style="margin: 0 0 16px 0; font-size: 18px;">${this.getTranslation('verifying')}</h3>
          ${challengeHTML}
          <div class="quickcaptcha-error" id="quickcaptcha-error"></div>
          <div class="quickcaptcha-buttons">
            <button class="quickcaptcha-button quickcaptcha-button-secondary" id="quickcaptcha-cancel">Cancel</button>
            ${this.challenge.type === 'math' ? '<button class="quickcaptcha-button quickcaptcha-button-primary" id="quickcaptcha-submit">Submit</button>' : ''}
          </div>
        </div>
      `;
    }

    getShapeSVG(shape) {
      const color = '#374151';
      switch (shape) {
        case 'circle':
          return `<svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="${color}"/></svg>`;
        case 'square':
          return `<svg width="40" height="40" viewBox="0 0 40 40"><rect x="4" y="4" width="32" height="32" fill="${color}"/></svg>`;
        case 'triangle':
          return `<svg width="40" height="40" viewBox="0 0 40 40"><polygon points="20,4 36,36 4,36" fill="${color}"/></svg>`;
      }
    }

    attachModalListeners() {
      const cancelBtn = this.modal.querySelector('#quickcaptcha-cancel');
      const submitBtn = this.modal.querySelector('#quickcaptcha-submit');
      const errorEl = this.modal.querySelector('#quickcaptcha-error');

      cancelBtn.addEventListener('click', () => this.closeModal());

      if (submitBtn) {
        submitBtn.addEventListener('click', () => {
          const input = this.modal.querySelector('.quickcaptcha-input');
          this.verifyAnswer(input.value);
        });

        const input = this.modal.querySelector('.quickcaptcha-input');
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            this.verifyAnswer(input.value);
          }
        });
        input.focus();
      }

      // Click challenge
      const gridItems = this.modal.querySelectorAll('.quickcaptcha-grid-item');
      gridItems.forEach(item => {
        item.addEventListener('click', () => {
          this.verifyAnswer(item.dataset.index);
        });
        item.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            this.verifyAnswer(item.dataset.index);
          }
        });
      });

      // Pattern challenge
      const patternItems = this.modal.querySelectorAll('.quickcaptcha-pattern-item');
      patternItems.forEach(item => {
        item.addEventListener('click', () => {
          this.verifyAnswer(item.dataset.shape);
        });
        item.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            this.verifyAnswer(item.dataset.shape);
          }
        });
      });

      // Close on background click
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.closeModal();
        }
      });

      // Close on Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.modal) {
          this.closeModal();
        }
      });
    }

    verifyAnswer(userAnswer) {
      const errorEl = this.modal.querySelector('#quickcaptcha-error');
      
      if (userAnswer.toLowerCase() === this.challenge.answer.toLowerCase()) {
        this.closeModal();
        this.setVerified(true);
      } else {
        errorEl.textContent = 'Incorrect answer. Please try again.';
        errorEl.classList.add('visible');
        
        // Generate new challenge
        this.challenge = this.generateChallenge();
        const modalContent = this.modal.querySelector('.quickcaptcha-modal-content');
        modalContent.innerHTML = this.getChallengeModalHTML();
        
        // Add canvas for math challenges
        if (this.challenge.type === 'math') {
          const canvasContainer = modalContent.querySelector('#quickcaptcha-canvas-container');
          if (canvasContainer) {
            const mathCanvas = this.renderMathChallenge();
            canvasContainer.appendChild(mathCanvas);
          }
        }
        
        this.attachModalListeners();
      }
    }

    closeModal() {
      if (this.modal) {
        this.modal.classList.remove('active');
        setTimeout(() => {
          if (this.modal) {
            this.modal.remove();
            this.modal = null;
          }
        }, 200);
      }
      
      if (!this.verified) {
        this.verifying = false;
        this.updateUI('idle');
      }
    }

    setVerified(success) {
      this.verifying = false;
      this.verified = success;
      
      this.updateUI(success ? 'verified' : 'failed');
      
      // Trigger callback
      if (this.callback) {
        this.callback(success);
      }

      // Trigger analytics
      if (this.analyticsCallback) {
        this.analyticsCallback({
          success: success,
          attempts: this.attempts,
          challengeType: this.options.challengeType,
          timestamp: new Date().toISOString()
        });
      }

      // Update ARIA
      this.widget.setAttribute('aria-label', success ? 
        this.getTranslation('ariaVerified') : 
        this.getTranslation('ariaFailed'));
    }

    updateUI(state) {
      this.checkbox.classList.remove('verified', 'failed', 'verifying');
      
      switch (state) {
        case 'verifying':
          this.checkbox.classList.add('verifying');
          this.text.textContent = this.getTranslation('verifying');
          break;
        case 'verified':
          this.checkbox.classList.add('verified');
          this.text.textContent = this.getTranslation('verified');
          break;
        case 'failed':
          this.checkbox.classList.add('failed');
          this.text.textContent = this.getTranslation('failed');
          break;
        default:
          this.text.textContent = this.getTranslation('verify');
      }
    }

    showError(message) {
      this.text.textContent = message;
      setTimeout(() => {
        if (!this.verified && !this.verifying) {
          this.text.textContent = this.getTranslation('verify');
        }
      }, 2000);
    }

    onVerify(callback) {
      this.callback = callback;
    }

    onAnalytics(callback) {
      this.analyticsCallback = callback;
    }

    reset() {
      this.verified = false;
      this.verifying = false;
      this.attempts = 0;
      this.updateUI('idle');
      this.widget.setAttribute('aria-label', this.getTranslation('ariaLabel'));
    }

    destroy() {
      this.closeModal();
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    }
  }

  /**
   * Main QuickCaptcha API
   */
  const QuickCaptchaAPI = {
    instances: new Map(),

    init(selector = '[data-quickcaptcha]') {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        this.create(element);
      });
    },

    create(element, options = {}) {
      const captcha = new QuickCaptcha(element, options);
      this.instances.set(captcha.id, captcha);
      return captcha;
    },

    get(id) {
      return this.instances.get(id);
    },

    onVerify(callback) {
      // Register callback for all instances
      this.instances.forEach(captcha => {
        captcha.onVerify(callback);
      });
    },

    onAnalytics(callback) {
      // Register analytics callback for all instances
      this.instances.forEach(captcha => {
        captcha.onAnalytics(callback);
      });
    },

    resetAll() {
      this.instances.forEach(captcha => captcha.reset());
    },

    destroyAll() {
      this.instances.forEach(captcha => captcha.destroy());
      this.instances.clear();
    }
  };

  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      QuickCaptchaAPI.init();
    });
  } else {
    QuickCaptchaAPI.init();
  }

  // Export to global scope
  window.QuickCaptcha = QuickCaptchaAPI;

})(window);
