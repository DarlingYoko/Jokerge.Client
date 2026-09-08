'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';

import { PluginPlace, PluginRegistry } from '@/shared/api/pluginRegistry';

// The plugin script is admin-installed, untrusted third-party content shown to every
// visitor on the public sign-in page. It used to be run via `new Function(...)` directly
// in this page's own context — arbitrary JS with full access to the login page's DOM,
// cookies, and localStorage. It now runs inside a sandboxed iframe instead: `allow-scripts`
// without `allow-same-origin` puts it in an opaque origin that can't reach anything of ours.
// Contract change: a plugin script is now plain JS/HTML that renders into its own document
// body (e.g. `document.body.innerHTML = '...'`), not a React component factory.
export const LoginPluginScriptViewer = () => {
  const [scriptContent, setScriptContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [height, setHeight] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const fetchPluginScript = async () => {
      try {
        const response = await PluginRegistry.getPluginScriptByPlace(PluginPlace.AfterLoginForm);
        if (!response) {
          // No plugin registered for this place — nothing to render, nothing to report.
          return;
        }
        setScriptContent(response.data);
      } catch (error) {
        console.error('Error fetching plugin script:', error);
        setError(error instanceof Error ? error.message : 'Failed to load plugin script');
      }
    };

    fetchPluginScript();
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?.type === 'plugin-resize' && typeof event.data.height === 'number') {
        setHeight(event.data.height);
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  if (error) {
    return (
      <div className="mt-4 text-center text-sm text-red-500">
        <AlertCircle className="h-4 w-4 inline-block mr-1" />
        {error}
      </div>
    );
  }

  if (!scriptContent) {
    return null; // Nothing loaded (yet), don't show anything.
  }

  const srcDoc = `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0">
<script>
try {
  ${scriptContent}
} catch (e) {
  console.error('Plugin script error:', e);
}
new ResizeObserver(() => {
  parent.postMessage({ type: 'plugin-resize', height: document.body.scrollHeight }, '*');
}).observe(document.body);
</script>
</body></html>`;

  return (
    <iframe
      ref={iframeRef}
      title="login-plugin"
      sandbox="allow-scripts"
      srcDoc={srcDoc}
      className="w-full border-0"
      style={{ height }}
    />
  );
};
