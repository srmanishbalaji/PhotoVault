import { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'

export default function EventDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  const headers = {
    Authorization: `Bearer ${token}`,
  }

  const [photos, setPhotos] = useState([])
  const [members, setMembers] = useState([])
  const [memberEmail, setMemberEmail] = useState('')
  const [pin, setPin] = useState('')
  const [gallery, setGallery] = useState(null)

  const [uploading, setUploading] = useState(false)
  const [addingMember, setAddingMember] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPhotos()

    if (role === 'admin') {
      fetchMembers()
    }
  }, [])

  const fetchPhotos = async () => {
    try {
      setError('')

      const res = await axios.get(
        `http://localhost:8000/photos/${id}`,
        { headers }
      )

      setPhotos(res.data)
    } catch (err) {
      setError('Unable to load photos. Please try again.')
    }
  }

  const fetchMembers = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/events/${id}/members`,
        { headers }
      )

      setMembers(res.data)
    } catch (err) {
      setError('Unable to load team members.')
    }
  }

  const addMember = async () => {
    if (!memberEmail.trim()) return

    try {
      setAddingMember(true)
      setError('')

      await axios.post(
        `http://localhost:8000/events/${id}/members`,
        { email: memberEmail },
        { headers }
      )

      setMemberEmail('')
      await fetchMembers()
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Unable to add team member.'
      )
    } finally {
      setAddingMember(false)
    }
  }

  const uploadPhoto = async (e) => {
    const files = e.target.files

    if (!files || files.length === 0) return

    try {
      setUploading(true)
      setError('')

      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)

        await axios.post(
          `http://localhost:8000/photos/${id}/upload`,
          formData,
          { headers }
        )
      }

      await fetchPhotos()
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to upload photo. Please try again.'
      )
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const toggleSelect = async (photoId) => {
    try {
      setError('')

      await axios.patch(
        `http://localhost:8000/photos/${photoId}/select`,
        {},
        { headers }
      )

      await fetchPhotos()
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to update photo selection.'
      )
    }
  }

  const publishGallery = async () => {
    if (!pin.trim()) return

    try {
      setPublishing(true)
      setError('')

      const res = await axios.post(
        'http://localhost:8000/galleries/',
        {
          event_id: parseInt(id),
          pin,
        },
        { headers }
      )

      setGallery(res.data)
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to publish gallery.'
      )
    } finally {
      setPublishing(false)
    }
  }

  const galleryUrl = gallery
    ? `http://localhost:5173/gallery/${gallery.share_link}`
    : ''

  return (
    <div className="min-h-screen bg-[#f0f6ff] font-sans p-4 sm:p-5 md:p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sky-500 text-sm hover:text-sky-600 transition"
          >
            ← Back
          </button>

          <h1 className="text-lg sm:text-xl font-semibold text-[#030d1a]">
            Event Details
          </h1>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">

          {/* Main Content */}
          <div className="min-w-0 lg:col-span-2">

            {/* Photos */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sky-100 mb-5 shadow-sm">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">

                <div>
                  <h2 className="text-sm font-semibold text-[#030d1a]">
                    📸 Photos ({photos.length})
                  </h2>

                  {role === 'member' && (
                    <p className="text-xs text-gray-400 mt-1">
                      Your uploaded photos
                    </p>
                  )}
                </div>

                {/* BOTH ADMIN AND TEAM MEMBER CAN UPLOAD */}
                <label
                  className={`w-full sm:w-auto h-10 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-yellow-400 text-white text-xs font-medium flex items-center justify-center transition ${
                    uploading
                      ? 'opacity-60 cursor-not-allowed'
                      : 'cursor-pointer hover:opacity-95'
                  }`}
                >
                  {uploading ? 'Uploading...' : '+ Upload Photos'}

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={uploadPhoto}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>

              </div>

              {photos.length === 0 ? (

                <div className="text-center py-10">
                  <div className="text-3xl mb-3">📷</div>

                  <p className="text-gray-400 text-sm">
                    No photos yet.
                  </p>

                  <p className="text-gray-400 text-xs mt-1">
                    Upload photos to get started.
                  </p>
                </div>

              ) : (

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative rounded-xl overflow-hidden aspect-square bg-gray-100"
                    >
                      <img
                        src={photo.storage_url}
                        alt={photo.filename}
                        className="w-full h-full object-cover"
                      />

                      {/* ONLY ADMIN CAN SELECT PHOTOS */}
                      {role === 'admin' && (
                        <button
                          onClick={() => toggleSelect(photo.id)}
                          className={`absolute top-2 right-2 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs shadow-sm transition ${
                            photo.is_selected
                              ? 'bg-sky-500 border-sky-500 text-white'
                              : 'bg-white/90 border-white text-gray-500'
                          }`}
                        >
                          {photo.is_selected ? '✓' : ''}
                        </button>
                      )}
                    </div>
                  ))}

                </div>
              )}

            </div>

            {/* Publish Gallery - ADMIN ONLY */}
            {role === 'admin' && (
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sky-100 shadow-sm">

                <h2 className="text-sm font-semibold text-[#030d1a] mb-4">
                  🔗 Publish Gallery
                </h2>

                <div className="flex flex-col sm:flex-row gap-3 mb-4">

                  <input
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Set a 6-digit PIN"
                    maxLength={6}
                    inputMode="numeric"
                    className="w-full flex-1 h-11 border border-gray-200 rounded-xl px-4 text-sm outline-none focus:border-sky-400 transition"
                  />

                  <button
                    onClick={publishGallery}
                    disabled={publishing || !pin.trim()}
                    className="w-full sm:w-auto h-11 px-5 rounded-xl bg-gradient-to-r from-sky-500 to-yellow-400 text-white text-sm font-medium disabled:opacity-50 transition"
                  >
                    {publishing ? 'Publishing...' : 'Publish'}
                  </button>

                </div>

                {gallery && (
                  <div className="bg-sky-50 rounded-xl p-4 border border-sky-100">

                    <p className="text-xs text-gray-500 mb-2">
                      Gallery Link
                    </p>

                    <a
                      href={galleryUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-sm text-sky-600 font-medium break-all hover:underline"
                    >
                      {galleryUrl}
                    </a>

                    <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">

                      <p className="text-xs text-gray-500">
                        PIN:{' '}
                        <span className="font-semibold text-[#030d1a]">
                          {gallery.pin}
                        </span>
                      </p>

                      <a
                        href={galleryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-medium text-sky-600 hover:underline"
                      >
                        Open Gallery ↗
                      </a>

                    </div>

                  </div>
                )}

              </div>
            )}

          </div>

          {/* Team Management - ADMIN ONLY */}
          {role === 'admin' && (
            <div className="min-w-0">

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sky-100 shadow-sm">

                <h2 className="text-sm font-semibold text-[#030d1a] mb-4">
                  👥 Team Members
                </h2>

                <div className="flex flex-col sm:flex-row gap-2 mb-4">

                  <input
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    placeholder="Member email"
                    className="w-full flex-1 h-10 border border-gray-200 rounded-xl px-3 text-xs outline-none focus:border-sky-400 transition"
                  />

                  <button
                    onClick={addMember}
                    disabled={addingMember || !memberEmail.trim()}
                    className="w-full sm:w-auto h-10 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-yellow-400 text-white text-xs font-medium disabled:opacity-50 transition"
                  >
                    {addingMember ? 'Adding...' : 'Add'}
                  </button>

                </div>

                {members.length === 0 ? (

                  <p className="text-xs text-gray-400 text-center py-6">
                    No team members yet.
                  </p>

                ) : (

                  <div className="flex flex-col">

                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0 min-w-0"
                      >

                        <div className="w-8 h-8 flex-none rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-xs font-semibold">
                          {member.name?.[0]?.toUpperCase() || 'T'}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-medium text-[#030d1a] truncate">
                            {member.name}
                          </p>

                          <p className="text-xs text-gray-400 break-all">
                            {member.email}
                          </p>
                        </div>

                      </div>
                    ))}

                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}