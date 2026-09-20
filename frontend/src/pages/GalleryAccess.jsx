import { useState } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'

export default function GalleryAccess() {
  const { shareLink } = useParams()
  const navigate = useNavigate()

  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAccess = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await axios.post(
        `https://photovault-api-dvdj.onrender.com/galleries/access/${shareLink}`,
        { pin }
      )

      localStorage.setItem('galleryData', JSON.stringify(res.data))
      navigate(`/gallery/${shareLink}/view`)
    } catch (err) {
      setError('Incorrect PIN. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#030d1a] flex items-center justify-center font-sans relative overflow-hidden">

      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div
        className="absolute w-[500px] h-[500px] rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            'radial-gradient(circle,rgba(14,165,233,0.2) 0%,transparent 65%)',
        }}
      />

      <div className="relative z-10 bg-white/5 border border-white/10 rounded-3xl p-10 w-96 text-center backdrop-blur-xl">

        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{
            background:
              'linear-gradient(135deg,rgba(14,165,233,0.3),rgba(245,158,11,0.3))',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <span className="text-3xl">🔒</span>
        </div>

        <h2 className="text-2xl font-semibold text-white mb-2">
          Gallery Access
        </h2>

        <p className="text-white/40 text-sm mb-6">
          This gallery is PIN protected.
          <br />
          Enter your 6-digit access code.
        </p>

        <div className="inline-flex items-center gap-1 bg-yellow-400/10 border border-yellow-400/25 rounded-full px-4 py-1 text-yellow-400 text-xs mb-6">
          📷 Protected Gallery
        </div>

        <input
          type="text"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Enter PIN"
          className="w-full h-14 rounded-xl bg-white/5 border border-white/10 text-white text-center text-2xl font-semibold tracking-widest outline-none mb-4 placeholder:text-white/20"
        />

        {error && (
          <p className="text-red-400 text-sm mb-4">
            {error}
          </p>
        )}

        <button
          onClick={handleAccess}
          disabled={loading || pin.length < 4}
          className="w-full h-12 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-sky-500 to-yellow-400 disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Unlock Gallery →'}
        </button>

        <p className="text-white/25 text-xs mt-4">
          PIN was shared by your event organizer
        </p>

      </div>
    </div>
  )
}