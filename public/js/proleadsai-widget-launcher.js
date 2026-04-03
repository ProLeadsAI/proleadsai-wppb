/**
 * ProLeadsAI Widget Launcher
 * Opens the hosted iframe widget in a slide-out panel
 */
(function() {
  'use strict';

  const config = window.proleadsaiWidget || {};
  let isOpen = false;
  let panelElement = null;
  let panelOverlay = null;
  let activeModalFrame = null;
  let availabilityChecked = false;
  let widgetEnabled = true;

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
    
    .plai-panel-frame {
      display: block;
      width: 100%;
      height: 100%;
      background: #fafaf9;
      box-shadow: -4px 0 20px rgba(0,0,0,0.15);
      border: 0;
    }

    .plai-inline-frame-modal {
      position: fixed !important;
      inset: 0 !important;
      z-index: 100001 !important;
      width: 100vw !important;
      max-width: none !important;
      height: 100vh !important;
      min-height: 100vh !important;
      border: 0 !important;
      background: transparent !important;
    }

    .plai-panel-container.plai-modal-host-active {
      inset: 0;
      width: 100vw;
      max-width: 100vw;
      transform: none !important;
    }

    .plai-panel-container.plai-modal-host-active .plai-panel-frame {
      width: 100vw;
      height: 100vh;
      max-width: none;
      box-shadow: none;
      background: transparent;
    }

    .plai-panel-container.plai-modal-host-active .plai-panel-close,
    .plai-panel-overlay.plai-modal-host-active {
      display: none;
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
    bindIframeEvents();

    syncWidgetAvailability();

    const button = document.getElementById('proleadsai-widget-button');
    if (button) {
      button.addEventListener('click', openPanel);
    }
  }

  function getFloatingButton() {
    return document.getElementById('proleadsai-widget-button');
  }

  function setFloatingButtonVisibility(shouldShow) {
    widgetEnabled = shouldShow !== false;
    const button = getFloatingButton();
    if (!button) {
      return;
    }

    button.style.display = widgetEnabled ? 'flex' : 'none';
  }

  async function syncWidgetAvailability() {
    setFloatingButtonVisibility(false);

    if (!config.widgetStatusUrl) {
      availabilityChecked = true;
      setFloatingButtonVisibility(true);
      return;
    }

    try {
      const response = await fetch(config.widgetStatusUrl, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Availability check failed');
      }

      const data = await response.json();
      availabilityChecked = true;
      setFloatingButtonVisibility(data.widgetEnabled !== false);
    } catch (error) {
      availabilityChecked = true;
      setFloatingButtonVisibility(false);
    }
  }

  function bindIframeEvents() {
    window.addEventListener('message', function(event) {
      const data = event.data || {};
      const inlineFrames = Array.from(document.querySelectorAll('.proleadsai-widget-inline-frame'));
      const panelFrame = panelElement ? panelElement.querySelector('.plai-panel-frame') : null;
      const allFrames = panelFrame ? inlineFrames.concat(panelFrame) : inlineFrames;

      allFrames.forEach(function(frame) {
        if (!frame || event.source !== frame.contentWindow) {
          return;
        }

        const embedWrapper = frame.closest('.proleadsai-widget-embed');

        if (data.type === 'proleadsai:availability-changed') {
          if (frame.classList.contains('plai-panel-frame')) {
            setFloatingButtonVisibility(data.widgetEnabled !== false);
            if (data.widgetEnabled === false) {
              closePanel();
            }
          }

          if (frame.classList.contains('proleadsai-widget-inline-frame')) {
            const shouldShow = data.widgetEnabled !== false;
            frame.style.height = shouldShow ? frame.style.height : '0px';
            frame.style.minHeight = shouldShow ? '' : '0px';
            frame.style.display = shouldShow ? 'block' : 'none';

            if (embedWrapper) {
              embedWrapper.style.display = shouldShow ? 'block' : 'none';
              embedWrapper.style.height = shouldShow ? '' : '0px';
              embedWrapper.style.minHeight = shouldShow ? '' : '0px';
              embedWrapper.style.margin = shouldShow ? '' : '0';
              embedWrapper.style.padding = shouldShow ? '' : '0';
            }
          }
          return;
        }

        if (data.type === 'proleadsai:iframe-resize' && data.height) {
          if (frame.classList.contains('proleadsai-widget-inline-frame') && !frame.classList.contains('plai-inline-frame-modal')) {
            const nextHeight = Math.max(parseInt(data.height, 10) || 0, 0);
            frame.style.height = nextHeight + 'px';
            frame.style.minHeight = nextHeight + 'px';

            if (embedWrapper) {
              embedWrapper.style.display = nextHeight > 0 ? 'block' : 'none';
              embedWrapper.style.height = nextHeight > 0 ? '' : '0px';
              embedWrapper.style.minHeight = nextHeight > 0 ? '' : '0px';
              embedWrapper.style.margin = nextHeight > 0 ? '' : '0';
              embedWrapper.style.padding = nextHeight > 0 ? '' : '0';
            }
          }
          return;
        }

        if (data.type === 'proleadsai:modal-open') {
          openFullscreenIframeModal(frame);
          return;
        }

        if (data.type === 'proleadsai:modal-close') {
          closeFullscreenIframeModal(frame);
        }
      });
    });
  }

  function openFullscreenIframeModal(frame) {
    activeModalFrame = frame;
    document.body.style.overflow = 'hidden';

    if (panelElement && frame.classList.contains('plai-panel-frame')) {
      panelElement.classList.add('plai-modal-host-active');
      if (panelOverlay) {
        panelOverlay.classList.add('plai-modal-host-active');
      }
      return;
    }

    frame.classList.add('plai-inline-frame-modal');
  }

  function closeFullscreenIframeModal(frame) {
    const targetFrame = frame || activeModalFrame;
    if (!targetFrame) {
      return;
    }

    if (panelElement && targetFrame.classList.contains('plai-panel-frame')) {
      panelElement.classList.remove('plai-modal-host-active');
      if (panelOverlay) {
        panelOverlay.classList.remove('plai-modal-host-active');
      }
      document.body.style.overflow = 'hidden';
    } else {
      targetFrame.classList.remove('plai-inline-frame-modal');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    activeModalFrame = null;
  }

  function openPanel() {
    if (!availabilityChecked) return;
    if (!widgetEnabled) return;
    if (isOpen) return;
    isOpen = true;

    // Create overlay
    panelOverlay = document.createElement('div');
    panelOverlay.className = 'plai-panel-overlay';
    panelOverlay.addEventListener('click', closePanel);
    document.body.appendChild(panelOverlay);

    // Create panel container
    panelElement = document.createElement('div');
    panelElement.className = 'plai-panel-container';
    panelElement.innerHTML = `
      <button class="plai-panel-close">&times;</button>
      <iframe
        class="plai-panel-frame"
        src="${config.iframeUrl || ''}"
        title="${config.panelTitle || 'ProLeadsAI Roof Estimator'}"
        loading="lazy"
        referrerpolicy="strict-origin-when-cross-origin"
        allow="clipboard-write"
      ></iframe>
    `;
    document.body.appendChild(panelElement);

    // Close button
    panelElement.querySelector('.plai-panel-close').addEventListener('click', closePanel);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Animate in
    requestAnimationFrame(() => {
      panelOverlay.classList.add('active');
      panelElement.classList.add('active');
    });
  }

  function closePanel() {
    if (!isOpen) return;

    closeFullscreenIframeModal(activeModalFrame);

    if (panelOverlay) panelOverlay.classList.remove('active');
    if (panelElement) panelElement.classList.remove('active');

    setTimeout(() => {
      if (panelOverlay) panelOverlay.remove();
      if (panelElement) panelElement.remove();
      panelOverlay = null;
      panelElement = null;
      document.body.style.overflow = '';
      isOpen = false;
      syncWidgetAvailability();
    }, 300);
  }

})();
