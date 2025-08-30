import { useRef, useEffect } from 'react';

export const useScreenShareWindow = () => {
  const windowRef = useRef<Window | null>(null);

  const openScreenShareWindow = (stream: MediaStream, onClose: () => void) => {
    if (windowRef.current && !windowRef.current.closed) {
      windowRef.current.focus();
      return;
    }

    // Open new window
    const newWindow = window.open(
      '',
      'screenShare',
      'width=1200,height=800,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,status=no'
    );

    if (!newWindow) {
      console.error('Failed to open screen share window');
      return;
    }

    windowRef.current = newWindow;

    // Set up the document
    newWindow.document.title = 'Screen Share';
    
    // Create HTML content
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Screen Share</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              background: black; 
              height: 100vh; 
              display: flex; 
              flex-direction: column;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .header {
              background: white;
              padding: 16px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 1px solid #e2e8f0;
            }
            .header-left {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .live-indicator {
              width: 8px;
              height: 8px;
              background: #ef4444;
              border-radius: 50%;
              animation: pulse 2s infinite;
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
            .close-btn {
              background: #f1f5f9;
              border: none;
              padding: 8px 12px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
            }
            .close-btn:hover {
              background: #ef4444;
              color: white;
            }
            .video-container {
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              background: black;
            }
            video {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
            .footer {
              background: white;
              padding: 8px 16px;
              text-align: center;
              font-size: 12px;
              color: #64748b;
              border-top: 1px solid #e2e8f0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-left">
              <span>📺</span>
              <span><strong>Screen Share</strong></span>
              <div class="live-indicator"></div>
              <span style="font-size: 12px; color: #64748b;">Live</span>
            </div>
            <button class="close-btn" onclick="window.close()">✕ Close</button>
          </div>
          <div class="video-container">
            <video id="screenVideo" autoplay playsinline muted></video>
          </div>
          <div class="footer">
            Screen Share Window - Close this window to continue with the main video call
          </div>
        </body>
      </html>
    `;

    newWindow.document.write(html);
    newWindow.document.close();

    // Set up video stream
    const video = newWindow.document.getElementById('screenVideo') as HTMLVideoElement;
    if (video && stream) {
      video.srcObject = stream;
      video.onerror = (e) => {
        console.error('Screen share video error:', e);
      };
    }

    // Handle window close
    newWindow.addEventListener('beforeunload', () => {
      onClose();
    });
  };

  const closeScreenShareWindow = () => {
    if (windowRef.current && !windowRef.current.closed) {
      windowRef.current.close();
      windowRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      closeScreenShareWindow();
    };
  }, []);

  return {
    openScreenShareWindow,
    closeScreenShareWindow,
    isWindowOpen: () => windowRef.current && !windowRef.current.closed
  };
};