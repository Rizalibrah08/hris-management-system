import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../api/client'
import '../styles/global.css'
import '../styles/pengaturan.css'

export default function Pengaturan() {
  const [tab, setTab] = useState('lokasi')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Location state
  const [latitude, setLatitude] = useState(-6.2088)
  const [longitude, setLongitude] = useState(106.8456)
  const [radius, setRadius] = useState(500)
  const [mapKey, setMapKey] = useState(0)

  // Company info state
  const [companyName, setCompanyName] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')

  // Working hours state
  const [lateThresholdHour, setLateThresholdHour] = useState('09:00')

  const [detectingLocation, setDetectingLocation] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchLastTs = useRef(0)

  // Leaflet refs
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const circleRef = useRef(null)
  const isInternalUpdate = useRef(false)

  const loadSettings = useCallback(async (signal) => {
    setLoading(true)
    try {
      const data = await api('/company-settings/location', { signal })
      setLatitude(data.latitude)
      setLongitude(data.longitude)
      setRadius(data.radius)
      setCompanyName(data.companyName || '')
      setCompanyAddress(data.companyAddress || '')
      setLateThresholdHour(data.lateThresholdHour || '09:00')
      setMapKey(prev => prev + 1)
    } catch (err) {
      if (err.name !== 'AbortError') setError('Gagal memuat pengaturan: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const ctrl = new AbortController()
    loadSettings(ctrl.signal)
    return () => ctrl.abort()
  }, [loadSettings])

  const handleSaveLocation = async () => {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await api('/company-settings', {
        method: 'PUT',
        body: JSON.stringify({
          settings: {
            office_latitude: String(latitude),
            office_longitude: String(longitude),
            office_radius: String(radius),
          },
        }),
      })
      setMessage('Lokasi kantor berhasil disimpan!')
      setMapKey(prev => prev + 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveCompany = async () => {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await api('/company-settings', {
        method: 'PUT',
        body: JSON.stringify({
          settings: {
            company_name: companyName,
            company_address: companyAddress,
          },
        }),
      })
      setMessage('Info perusahaan berhasil disimpan!')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveWorkingHours = async () => {
    setSaving(true)
    setError('')
    setMessage('')
    const value = String(lateThresholdHour || '').trim()
    if (!/^(\d{1,2}):(\d{2})$/.test(value)) {
      setError('Format jam masuk tidak valid. Gunakan HH:MM (misal 09:00).')
      setSaving(false)
      return
    }
    try {
      await api('/company-settings', {
        method: 'PUT',
        body: JSON.stringify({
          settings: { late_threshold_hour: value },
        }),
      })
      setMessage('Jam masuk berhasil disimpan!')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Browser tidak mendukung Geolocation. Klik peta untuk pilih lokasi manual.')
      return
    }
    setDetectingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        isInternalUpdate.current = true
        setLatitude(parseFloat(pos.coords.latitude.toFixed(6)))
        setLongitude(parseFloat(pos.coords.longitude.toFixed(6)))
        setMapKey(prev => prev + 1)
        setDetectingLocation(false)
        setMessage('Lokasi berhasil dideteksi! Klik Simpan untuk menyimpan.')
      },
      (err) => {
        let msg = 'Gagal mendeteksi lokasi.'
        if (err.code === 1) {
          msg = 'Izin lokasi ditolak. Buka pengaturan browser (ikon kunci di address bar) → izinkan akses lokasi untuk situs ini, lalu coba lagi. Atau klik peta untuk pilih lokasi manual.'
        } else if (err.code === 2) {
          msg = 'Posisi tidak tersedia (GPS/Wi-Fi mungkin dimatikan atau lemah). Aktifkan location services di perangkat, atau klik peta untuk pilih lokasi manual.'
        } else if (err.code === 3) {
          msg = 'Deteksi lokasi timeout. Coba lagi, atau klik peta untuk pilih lokasi manual.'
        }
        setError(msg)
        setDetectingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleSearch = useCallback(async (e) => {
    if (e) e.preventDefault()
    const q = searchQuery.trim()
    if (q.length < 3) {
      setSearchResults([])
      setShowResults(false)
      return
    }
    const now = Date.now()
    if (now - searchLastTs.current < 800) return
    searchLastTs.current = now
    setSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=id`,
        { headers: { 'Accept-Language': 'id' } }
      )
      const data = await res.json()
      setSearchResults(data || [])
      setShowResults(true)
    } catch (err) {
      setError('Gagal mencari alamat: ' + err.message)
    } finally {
      setSearching(false)
    }
  }, [searchQuery])

  const handleSelectSearchResult = (r) => {
    isInternalUpdate.current = true
    setLatitude(parseFloat(parseFloat(r.lat).toFixed(6)))
    setLongitude(parseFloat(parseFloat(r.lon).toFixed(6)))
    setMapKey(prev => prev + 1)
    setShowResults(false)
    setSearchQuery(r.display_name)
    setMessage('Lokasi dipilih dari pencarian. Klik Simpan untuk menyimpan.')
  }

  const handleManualLat = (e) => {
    isInternalUpdate.current = true
    setLatitude(parseFloat(e.target.value) || 0)
    setMapKey(prev => prev + 1)
  }

  const handleManualLng = (e) => {
    isInternalUpdate.current = true
    setLongitude(parseFloat(e.target.value) || 0)
    setMapKey(prev => prev + 1)
  }

  // Init Leaflet map when tab=lokasi, settings loaded, and window.L available
  useEffect(() => {
    if (tab !== 'lokasi' || loading) return
    if (!window.L) {
      const timer = setTimeout(() => setMapKey(prev => prev + 1), 500)
      return () => clearTimeout(timer)
    }
    if (!mapRef.current) return
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }
    const L = window.L
    const map = L.map(mapRef.current, { zoomControl: true }).setView([latitude, longitude], 16)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map)

    const officeIcon = L.divIcon({
      className: 'office-marker',
      html: '<div style="background:#EF4444;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 0 5px rgba(0,0,0,0.5)"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    })
    const marker = L.marker([latitude, longitude], { draggable: true, icon: officeIcon }).addTo(map)
    const circle = L.circle([latitude, longitude], {
      color: '#EF4444', weight: 2, opacity: 0.6,
      fillColor: '#EF4444', fillOpacity: 0.1,
      radius: radius
    }).addTo(map)

    const updateFromMap = (latlng) => {
      isInternalUpdate.current = true
      setLatitude(parseFloat(latlng.lat.toFixed(6)))
      setLongitude(parseFloat(latlng.lng.toFixed(6)))
      marker.setLatLng(latlng)
      circle.setLatLng(latlng)
    }
    map.on('click', (e) => updateFromMap(e.latlng))
    marker.on('dragend', () => updateFromMap(marker.getLatLng()))

    mapInstanceRef.current = map
    markerRef.current = marker
    circleRef.current = circle
    setTimeout(() => map.invalidateSize(), 100)
    return () => {
      map.remove()
      mapInstanceRef.current = null
      markerRef.current = null
      circleRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, loading, mapKey])

  // Watch radius changes -> update circle
  useEffect(() => {
    if (circleRef.current) circleRef.current.setRadius(radius)
  }, [radius])

  const tabs = [
    { key: 'lokasi', label: '📍 Lokasi Kantor' },
    { key: 'jamkerja', label: '🕒 Jam Kerja' },
    { key: 'perusahaan', label: '🏢 Info Perusahaan' },
  ]

  return (
    <section className="feature-layout">
      <article className="panel">
        {message && <div className="toast success" onClick={() => setMessage('')}>{message}</div>}
        {error && <div className="toast error" onClick={() => setError('')}>{error}</div>}

        <div className="payroll-tabs" style={{ marginBottom: '20px' }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`tab-btn ${tab === t.key ? 'active' : ''}`}
              onClick={() => { setTab(t.key); setMessage(''); setError('') }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="loading-text">Memuat pengaturan...</p>
        ) : tab === 'lokasi' ? (
          <div className="settings-page">
            <div className="panel-head">
              <h3>Lokasi Kantor & Radius Geofence</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
              Klik peta atau drag marker untuk pilih lokasi. Bisa juga cari alamat di bawah, atau gunakan tombol "Gunakan Lokasi Saya".
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
              Klik peta atau drag marker untuk pilih lokasi. Bisa juga cari alamat di bawah, atau gunakan tombol "Gunakan Lokasi Saya".
            </p>

            {/* Search box */}
            <div className="map-search-wrapper">
              <form onSubmit={handleSearch} className="map-search-form">
                <input
                  type="text"
                  className="map-search-input"
                  placeholder="Cari alamat (cth: Jl. Sudirman Jakarta)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowResults(true)}
                  onBlur={() => setTimeout(() => setShowResults(false), 200)}
                />
                <button type="submit" className="map-search-btn" disabled={searching}>
                  {searching ? 'Mencari...' : '🔍 Cari'}
                </button>
              </form>
              {showResults && searchResults.length > 0 && (
                <ul className="map-search-results">
                  {searchResults.map((r) => (
                    <li key={r.place_id} onMouseDown={() => handleSelectSearchResult(r)}>
                      {r.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="settings-map-container">
              <div ref={mapRef} id="map-pengaturan" style={{ width: '100%', height: '100%' }} />
            </div>

            <div className="settings-summary">
              <div className="settings-summary-item">
                <div className="label">Latitude</div>
                <div className="value">{latitude}</div>
              </div>
              <div className="settings-summary-item">
                <div className="label">Longitude</div>
                <div className="value">{longitude}</div>
              </div>
              <div className="settings-summary-item">
                <div className="label">Radius</div>
                <div className="value">{radius}m</div>
              </div>
            </div>

            <div className="settings-grid">
              <div className="settings-field">
                <label htmlFor="latitude">Latitude</label>
                <input
                  id="latitude"
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={handleManualLat}
                />
              </div>
              <div className="settings-field">
                <label htmlFor="longitude">Longitude</label>
                <input
                  id="longitude"
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={handleManualLng}
                />
              </div>
              <div className="settings-field">
                <label htmlFor="radius">Radius Geofence (meter)</label>
                <input
                  id="radius"
                  type="number"
                  step="50"
                  min="50"
                  max="10000"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value) || 500)}
                />
              </div>
            </div>

            <div className="settings-actions">
              <button className="primary-btn" onClick={handleSaveLocation} disabled={saving}>
                {saving ? 'Menyimpan...' : '💾 Simpan Lokasi'}
              </button>
              <button className="location-btn" onClick={handleDetectLocation} disabled={detectingLocation}>
                {detectingLocation ? '⏳ Mendeteksi...' : '📍 Gunakan Lokasi Saya'}
              </button>
            </div>
          </div>
        ) : tab === 'jamkerja' ? (
          <div className="settings-page">
            <div className="panel-head">
              <h3>Jam Masuk & Batas Keterlambatan</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
              Tetapkan jam masuk resmi. Karyawan yang clock-in setelah jam ini akan otomatis ditandai &quot;Telat&quot; pada record kehadirannya dan di kalender mobile.
            </p>

            <div className="settings-grid">
              <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="lateThresholdHour">Jam Masuk (HH:MM)</label>
                <input
                  id="lateThresholdHour"
                  type="time"
                  value={lateThresholdHour}
                  onChange={(e) => setLateThresholdHour(e.target.value)}
                  placeholder="09:00"
                />
              </div>
            </div>

            <div className="settings-actions">
              <button className="primary-btn" onClick={handleSaveWorkingHours} disabled={saving}>
                {saving ? 'Menyimpan...' : '💾 Simpan Jam Kerja'}
              </button>
            </div>
          </div>
        ) : (
          <div className="settings-page">
            <div className="panel-head">
              <h3>Informasi Perusahaan</h3>
            </div>

            <div className="settings-grid">
              <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="companyName">Nama Perusahaan</label>
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Masukkan nama perusahaan"
                />
              </div>
              <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="companyAddress">Alamat Perusahaan</label>
                <textarea
                  id="companyAddress"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  placeholder="Masukkan alamat lengkap perusahaan"
                />
              </div>
            </div>

            <div className="settings-actions">
              <button className="primary-btn" onClick={handleSaveCompany} disabled={saving}>
                {saving ? 'Menyimpan...' : '💾 Simpan'}
              </button>
            </div>
          </div>
        )}
      </article>
    </section>
  )
}