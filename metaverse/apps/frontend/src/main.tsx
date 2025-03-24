import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from "./Context/AuthContext.tsx";
import { LoaderProvider } from './Context/LoaderContext.tsx'

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <LoaderProvider>
      <App />
    </LoaderProvider>
  </AuthProvider>
)
