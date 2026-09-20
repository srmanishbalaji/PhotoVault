import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [events, setEvents] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
  })

  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const name = localStorage.getItem('name') || 'User'

  const headers = {
    Authorization: `Bearer ${token}`,
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError('')

      const res = await axios.get(
        'https://photovault-api-dvdj.onrender.com/events/',
        { headers }
      )

      setEvents(res.data)
    } catch (err) {
      setError('Unable to load events. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const createEvent = async () => {
    if (!newEvent.name.trim()) return

    try {
      setCreating(true)
      setError('')

      await axios.post(
        'https://photovault-api-dvdj.onrender.com/events/',
        newEvent,
        { headers }
      )

      setShowCreate(false)
      setNewEvent({
        name: '',
        description: '',
      })

      await fetchEvents()
    } catch (err) {
      setError('Unable to create event. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const logout = () => {
    localStorage.clear()
    navigate('/')
  }

  const goToDashboard = () => {
    setMobileMenu(false)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#f0f6ff] font-sans text-[#030d1a]">

      {/* Mobile Overlay */}
      {mobileMenu && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenu(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-64 bg-[#030d1a]
          flex flex-col
          p-4
          overflow-hidden
          transition-transform duration-300
          md:translate-x-0 md:static md:min-h-screen
          ${mobileMenu ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Glow */}
        <div
          className="absolute w-56 h-56 rounded-full bottom-[-60px] right-[-60px] pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(14,165,233,0.25) 0%, transparent 70%)',
          }}
        />

        {/* Logo */}
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl">📷</span>

            <span className="text-white font-semibold text-base">
              Photo
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-yellow-400">
                Vault
              </span>
            </span>
          </div>

          {/* Mobile Close */}
          <button
            onClick={() => setMobileMenu(false)}
            className="text-white/60 text-xl md:hidden"
          >
            ×
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 relative z-10 flex-1">

          <button
            onClick={goToDashboard}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-sky-500/15 border border-sky-500/20 text-sky-400 text-sm text-left"
          >
            📊 Dashboard
          </button>

          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-white/45 text-sm">
            📅 Events
          </div>

          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-white/45 text-sm">
            📸 Photos
          </div>

          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-white/45 text-sm">
            👥 Team
          </div>

          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-white/45 text-sm">
            🔗 Galleries
          </div>

        </nav>

        {/* Logout */}
        <button
          onClick={logout}
          className="relative z-10 text-white/50 text-xs text-left px-3 py-2.5 hover:text-white transition"
        >
          ← Logout
        </button>
      </aside>

      {/* Main Area */}
      <div className="md:flex">

        {/* Desktop Sidebar Placeholder Width */}
        <div className="hidden md:block md:w-64 md:flex-none" />

        <main className="flex-1 min-w-0 p-4 sm:p-5 md:p-6">

          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-5 md:hidden">
            <button
              onClick={() => setMobileMenu(true)}
              className="w-10 h-10 rounded-xl bg-white border border-sky-100 shadow-sm flex items-center justify-center text-lg"
            >
              ☰
            </button>

            <div className="text-sm font-semibold">
              Photo
              <span className="text-sky-500">Vault</span>
            </div>

            <div className="w-10" />
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

            <div className="min-w-0">
              <h1 className="text-2xl md:text-xl font-semibold break-words">
                Good day, {name} 👋
              </h1>

              <p className="text-sm text-gray-400 mt-1">
                Here's your event overview
              </p>
            </div>

            {role === 'admin' && (
              <button
                onClick={() => setShowCreate(true)}
                className="w-full sm:w-auto h-11 px-5 rounded-xl bg-gradient-to-r from-sky-500 to-yellow-400 text-white text-sm font-medium shadow-sm hover:opacity-95 transition"
              >
                + New Event
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

            {/* Events */}
            <div className="bg-white rounded-2xl p-4 border border-sky-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center text-lg mb-3">
                📅
              </div>

              <div className="text-2xl font-semibold">
                {events.length}
              </div>

              <div className="text-xs text-gray-400 mt-1">
                Total Events
              </div>
            </div>

            {/* Photos */}
            <div className="bg-white rounded-2xl p-4 border border-yellow-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-500 flex items-center justify-center text-lg mb-3">
                📸
              </div>

              <div className="text-2xl font-semibold">
                0
              </div>

              <div className="text-xs text-gray-400 mt-1">
                Total Photos
              </div>
            </div>

            {/* Galleries */}
            <div className="bg-white rounded-2xl p-4 border border-sky-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center text-lg mb-3">
                🔗
              </div>

              <div className="text-2xl font-semibold">
                0
              </div>

              <div className="text-xs text-gray-400 mt-1">
                Live Galleries
              </div>
            </div>

          </div>

          {/* Events */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sky-100 shadow-sm">

            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-sky-500 to-yellow-400 rounded inline-block" />
              Your Events
            </h2>

            {loading ? (
              <div className="text-center py-10 text-sm text-gray-400">
                Loading events...
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-3xl mb-3">📷</div>

                <p className="text-gray-400 text-sm">
                  No events yet.
                </p>

                {role === 'admin' && (
                  <p className="text-gray-400 text-sm mt-1">
                    Create your first event!
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">

                {events.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => navigate(`/events/${event.id}`)}
                    className="w-full text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-[#f0f6ff] rounded-xl hover:bg-sky-50 transition border border-transparent hover:border-sky-100"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium break-words">
                        {event.name}
                      </p>

                      <p className="text-xs text-gray-400 mt-1 break-words">
                        {event.description || 'No description'}
                      </p>
                    </div>

                    <span className="self-start sm:self-center text-xs px-3 py-1 rounded-full bg-green-50 text-green-600 font-medium">
                      Active
                    </span>
                  </button>
                ))}

              </div>
            )}

          </div>

        </main>
      </div>

      {/* Create Event Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">

          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-xl">

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Create New Event
              </h3>

              <button
                onClick={() => setShowCreate(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            <input
              value={newEvent.name}
              onChange={(e) =>
                setNewEvent({
                  ...newEvent,
                  name: e.target.value,
                })
              }
              placeholder="Event name"
              className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm mb-3 outline-none focus:border-sky-400"
            />

            <textarea
              value={newEvent.description}
              onChange={(e) =>
                setNewEvent({
                  ...newEvent,
                  description: e.target.value,
                })
              }
              placeholder="Description (optional)"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-4 outline-none focus:border-sky-400 h-24 resize-none"
            />

            <div className="flex flex-col-reverse sm:flex-row gap-3">

              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 h-11 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={createEvent}
                disabled={creating || !newEvent.name.trim()}
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-sky-500 to-yellow-400 text-white text-sm font-medium disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  )
}