import { useEffect } from 'react';

const OmniWidget = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.id = 'omnidimension-web-widget';
    script.async = true;
    script.src = 'https://omnidim.io/web_widget.js?secret_key=f41d65c800c8237ce7a1dcd24a6e9ede';
{/* <script id="omnidimension-web-widget" async src="https://omnidim.io/web_widget.js?secret_key=f41d65c800c8237ce7a1dcd24a6e9ede" ></script> */}
    // <script id="omnidimension-web-widget" async src="https://backend.omnidim.io/web_widget.js?secret_key=11d34fbc013e49fde814608d5d74c1e3" ></script>
{/* <script id="omnidimension-web-widget" async src="https://backend.omnidim.io/web_widget.js?secret_key=02078e20d746d373d16c20f6686f4b4f" ></script> */}
  
    document.body.appendChild(script);

    // Cleanup on unmount to avoid multiple instances
    return () => {
      const existing = document.getElementById('omnidimension-web-widget');
      if (existing) {
        existing.remove();
      }
      // Query and remove any elements or iframes created by the widget
      const widgetElements = document.querySelectorAll('[id*="omnidimension"], [class*="omnidimension"], iframe[src*="omnidim"]');
      widgetElements.forEach(el => el.remove());
      delete (window as any).OmniDimension;
    };
  }, []);

  return null; // Or return a placeholder <div> if needed
};

export default OmniWidget;
