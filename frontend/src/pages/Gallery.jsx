import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function Gallery() {
  const { shareLink } = useParams()
  const navigate = useNavigate()
  const [photos, setPhotos] = useState([])
  const [eventName, setEventName] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const data = localStorage.getItem('galleryData')
    if (!data) {
      navigate(`/gallery/${shareLink}`)
      return
    }
    const parsed = JSON.parse(data)
    setPhotos(parsed.photos)
  }, [])

  return (
    <div className="min-h-screen bg-[#030d1a] font-sans relative overflow-hidden">
      <div className="absolute inset-0" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)',backgroundSize:'40px 40px'}}></div>
      <div className="absolute w-[450px] h-[450px] rounded-full top-[-120px] right-[-100px]" style={{background:'radial-gradient(circle,rgba(14,165,233,0.2) 0%,transparent 70%)'}}></div>
      <div className="absolute w-[300px] h-[300px] rounded-full bottom-[-60px] left-[-60px]" style={{background:'radial-gradient(circle,rgba(245,158,11,0.15) 0%,transparent 70%)'}}></div>
      <nav className="relative z-10 flex justify-between items-center px-6 py-4 border-b border-sky-500/10">
        <div className="flex items-center gap-2">
          <span className="text-xl">📷</span>
          <span className="text-white font-semibold">Photo<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-yellow-400">Vault</span></span>
        </div>
        <div className="flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 rounded-full px-4 py-2 text-sky-400 text-xs">
          🔒 PIN verified · Access granted
        </div>
      </nav>
      <div className="relative z-10 px-6 py-6">
        <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/25 rounded-full px-4 py-1 text-yellow-400 text-xs mb-4">
          ⭐ Featured Gallery
        </div>
        <h1 className="text-3xl font-semibold text-white mb-2">Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-yellow-400">Gallery</span></h1>
        <div className="flex items-center gap-4 mb-6">
          <span className="text-white/40 text-sm">📸 {photos.length} photos</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo, index) => (
            <div key={photo.id} onClick={() => setSelected(photo)} className={`rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform ${index === 0 ? 'col-span-2 row-span-2' : ''}`}>
              <img src={photo.url} alt={photo.filename} className="w-full h-full object-cover aspect-square" />
            </div>
          ))}
        </div>
        {photos.length === 0 && (
          <p className="text-white/40 text-center py-20">No photos in this gallery yet.</p>
        )}
      </div>
      {selected && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <img src={selected.url} alt={selected.filename} className="max-w-full max-h-full rounded-2xl" />
        </div>
      )}
    </div>
  )
}