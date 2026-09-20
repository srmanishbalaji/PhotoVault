import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import axios from 'axios'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import EventDetails from './pages/EventDetails'
import Gallery from './pages/Gallery'
import GalleryAccess from './pages/GalleryAccess'

function App() {
  const token = localStorage.getItem('token')

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,

      (error) => {
        const hasAuthorization =
          error.config?.headers?.Authorization ||
          error.config?.headers?.authorization

        // Only treat protected API 401 responses as an expired session.
        // Public gallery PIN errors also use 401, so they must not log the
        // user out.
        if (error.response?.status === 401 && hasAuthorization) {
          localStorage.clear()
          window.location.href = '/'
        }

        return Promise.reject(error)
      }
    )

    return () => {
      axios.interceptors.response.eject(interceptor)
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={
            token ? <Dashboard /> : <Navigate to="/" />
          }
        />

        <Route
          path="/events/:id"
          element={
            token ? <EventDetails /> : <Navigate to="/" />
          }
        />

        <Route
          path="/gallery/:shareLink"
          element={<GalleryAccess />}
        />

        <Route
          path="/gallery/:shareLink/view"
          element={<Gallery />}
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App