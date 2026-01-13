import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// #region agent log
fetch('http://127.0.0.1:7245/ingest/95c683ef-5a22-416a-a54d-dce0f6a7cf6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:5',message:'Script execution started',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
// #endregion

const rootElement = document.getElementById('root');

// #region agent log
fetch('http://127.0.0.1:7245/ingest/95c683ef-5a22-416a-a54d-dce0f6a7cf6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:10',message:'Root element check',data:{found:!!rootElement,elementId:rootElement?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
// #endregion

if (!rootElement) {
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/95c683ef-5a22-416a-a54d-dce0f6a7cf6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:15',message:'Root element not found error',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// #region agent log
fetch('http://127.0.0.1:7245/ingest/95c683ef-5a22-416a-a54d-dce0f6a7cf6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:22',message:'Before render',data:{hasReact:typeof React!=='undefined',hasReactDOM:typeof ReactDOM!=='undefined',hasApp:typeof App!=='undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
// #endregion

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// #region agent log
fetch('http://127.0.0.1:7245/ingest/95c683ef-5a22-416a-a54d-dce0f6a7cf6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:30',message:'After render call',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
// #endregion