/**
 * ProLeadsAI Widget Launcher
 * Opens the Vue custom element widget in a slide-out panel
 */
(function() {
  'use strict';

  const config = window.proleadsaiWidget || {};
  let isOpen = false;
  let panelElement = null;

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    .plai-panel-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(2px);
      z-index: 99998;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }
    .plai-panel-overlay.active {
      opacity: 1;
      pointer-events: auto;
    }
    
    /* Google Places autocomplete dropdown - must be above panel */
    .pac-container {
      z-index: 999999 !important;
    }
    
    .plai-panel-container {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 420px;
      max-width: 100%;
      z-index: 99999;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    }
    .plai-panel-container.active {
      transform: translateX(0);
    }
    
    .plai-panel-close {
      position: absolute;
      top: 16px;
      left: -52px;
      width: 40px;
      height: 40px;
      background: white;
      border: none;
      border-radius: 50%;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #333;
      z-index: 1;
    }
    
    .plai-panel-container roof-estimator {
      display: block;
      height: 100%;
      background: #fafaf9;
      box-shadow: -4px 0 20px rgba(0,0,0,0.15);
      overflow-y: auto;
    }
    
    @media (max-width: 480px) {
      .plai-panel-container {
        width: 100%;
      }
      .plai-panel-close {
        left: auto;
        right: 16px;
        top: 16px;
      }
    }
  `;
  document.head.appendChild(style);

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    const button = document.getElementById('proleadsai-widget-button');
    if (button) {
      button.addEventListener('click', openPanel);
    }
    
    // Listen for modal open event to close the slide-out panel
    window.addEventListener('proleadsai:modal-open', function() {
      closePanelKeepModal();
    });
    
    // Listen for modal close event to fully clean up
    window.addEventListener('proleadsai:modal-close', function() {
      cleanupPanel();
    });
  }
  
  // Close panel but keep the widget mounted (modal is taking over)
  function closePanelKeepModal() {
    if (!isOpen) return;

    const overlay = document.querySelector('.plai-panel-overlay');
    
    // Just hide the panel visually, don't remove the elements
    if (overlay) {
      overlay.classList.remove('active');
      overlay.style.display = 'none';
    }
    if (panelElement) {
      panelElement.classList.remove('active');
      panelElement.style.display = 'none';
    }
    
    // Restore body scroll since modal will handle its own
    document.body.style.overflow = '';
    isOpen = false;
  }
  
  // Fully clean up panel and overlay elements
  function cleanupPanel() {
    const overlay = document.querySelector('.plai-panel-overlay');
    if (overlay) overlay.remove();
    if (panelElement) {
      panelElement.remove();
      panelElement = null;
    }
    document.body.style.overflow = '';
    isOpen = false;
  }

  function openPanel() {
    if (isOpen) return;
    isOpen = true;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'plai-panel-overlay';
    overlay.addEventListener('click', closePanel);
    document.body.appendChild(overlay);

    // Create panel container
    panelElement = document.createElement('div');
    panelElement.className = 'plai-panel-container';
    panelElement.innerHTML = `
      <button class="plai-panel-close">&times;</button>
      <roof-estimator
        org-id="${config.orgId || ''}"
        api-url="${config.apiUrl || 'https://app.proleadsai.com/api'}"
        google-maps-api-key="${config.googleMapsApiKey || ''}"
        primary-color="${config.primaryColor || '#1d4ed8'}"
      ></roof-estimator>
    `;
    document.body.appendChild(panelElement);

    // Close button
    panelElement.querySelector('.plai-panel-close').addEventListener('click', closePanel);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Animate in
    requestAnimationFrame(() => {
      overlay.classList.add('active');
      panelElement.classList.add('active');
    });
  }

  function closePanel() {
    if (!isOpen) return;

    const overlay = document.querySelector('.plai-panel-overlay');
    
    if (overlay) overlay.classList.remove('active');
    if (panelElement) panelElement.classList.remove('active');

    setTimeout(() => {
      if (overlay) overlay.remove();
      if (panelElement) panelElement.remove();
      panelElement = null;
      document.body.style.overflow = '';
      isOpen = false;
    }, 300);
  }

})();
