import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import { App } from './app/App';
import { resolveBackend } from './app/resolveBackend';

const root = document.getElementById('root');
if (!root) throw new Error('Brak elementu #root w index.html');

void resolveBackend().then((result) => {
  createRoot(root).render(
    <StrictMode>
      <App result={result} />
    </StrictMode>,
  );
});
