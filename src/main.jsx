import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom' 
import './index.css'
import routes from './routes/AppRoutes'; // ملف الـ routes الذي يحتوي على الهيكلية التي شرحتها

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* هنا تكمن الإجابة: أنت لا تستدعي <App /> يدوياً */}
    {/* الـ RouterProvider هو من سيذهب لملف الـ routes ويجد <App /> ويشغله */}
    <RouterProvider router={routes} />
  </StrictMode>,
)