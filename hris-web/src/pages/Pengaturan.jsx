import { useState, useEffect, useCallback } from 'react'
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

  const [detectingLocation, setDetectingLocation] = useState(false)

  const loadSettings = useCallback(async (signal) => {
    setLoading(true)
    try {
      const data = await api('/company-settings/location', { signal })
      setLatitude(data.latitude)
      setLongitude(data.longitude)
      setRadius(data.radius)
      setCompanyName(data.companyName || '')
      setCompanyAddress(data.companyAddress || '')
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

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Browser tidak mendukung Geolocation')
      return
    }
    setDetectingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(parseFloat(pos.coords.latitude.toFixed(6)))
        setLongitude(parseFloat(pos.coords.longitude.toFixed(6)))
        setMapKey(prev => prev + 1)
        setDetectingLocation(false)
        setMessage('Lokasi berhasil dideteksi! Klik Simpan untuk menyimpan.')
      },
      (err) => {
        setError('Gagal mendeteksi lokasi: ' + err.message)
        setDetectingLocation(false)
      },
      { enableHighAccuracy: true }
    )
  }

  const handleUpdateMap = () => {
    setMapKey(prev => prev + 1)
  }

  const tabs = [
    { key: 'lokasi', label: '📍 Lokasi Kantor' },
    { key: 'perusahaan', label: '🏢 Info Perusahaan' },
  ]

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.005},${latitude - 0.005},${longitude + 0.005},${latitude + 0.005}&layer=mapnik&marker=${latitude},${longitude}`

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
              <button className="small-btn" onClick={handleUpdateMap}>🔄 Refresh Map</button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
              Tentukan titik koordinat kantor dan radius geofence untuk validasi absensi karyawan.
            </p>

            <div className="settings-map-container">
              <iframe
                key={mapKey}
                title="Office Location Map"
                src={mapSrc}
              />
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
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="settings-field">
                <label htmlFor="longitude">Longitude</label>
                <input
                  id="longitude"
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
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
