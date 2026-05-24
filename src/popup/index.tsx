import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootEl = document.getElementById('root');
if (!rootEl) {
  document.body.innerHTML = '<p style="color:red;padding:20px">Error: #root not found</p>';
} else {
  try {
    const root = createRoot(rootEl);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (err) {
    rootEl.innerHTML = `<p style="color:red;padding:20px;font-family:sans-serif;font-size:13px">Error: ${err instanceof Error ? err.message : String(err)}</p>`;
  }
}
