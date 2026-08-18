import { useEffect } from 'react';

const OmniWidget = () => {
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const userObj = userStr ? JSON.parse(userStr) : null;
    const userName = userObj ? userObj.name : "there";

    // Set custom variables before appending the widget script
    (window as any).OmniDimension = {
      variables: {
        user_name: userName
      }
    };

    const script = document.createElement('script');
    script.id = 'omnidimension-web-widget';
    script.async = true;
    script.src = 'https://omnidim.io/web_widget.js?secret_key=eee6b5c85727b85fe11d12b60a7e7b29';
  
    document.body.appendChild(script);

    // Cleanup on unmount to completely remove all OmniDimension elements from the DOM
    return () => {
      const existing = document.getElementById('omnidimension-web-widget');
      if (existing) {
        existing.remove();
      }
      // Query and remove all dynamic DOM nodes injected by the script
      const selectors = [
        '[id*="omnidimension"]',
        '[class*="omnidimension"]',
        '[id*="omnidim"]',
        '[class*="WidgetButton"]',
        'button[class*="WidgetButton"]',
        'iframe[src*="omnidim"]',
        'iframe[title*="OmniDimension"]',
        '#omni-minimized-pill',
        '.omni-minimized-pill',
        '#chat-helper-button',
        '#chat-helper-button-container',
        'div[id*="chat-helper-button"]'
      ];
      
      const widgetElements = document.querySelectorAll(selectors.join(', '));
      widgetElements.forEach(el => {
        try {
          el.remove();
        } catch (e) {}
      });
      
      delete (window as any).OmniDimension;
    };
  }, []);

  return null;
};

export default OmniWidget;

