import { useState, useEffect, useCallback, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { api } from '../api/client'
import 'leaflet/dist/leaflet.css'

const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function MapClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng)
    },
  })
  return null
}

function MapCenterUpdater({ center }) {
  const map = useMap()
  map.setView(center, map.getZoom())
  return null
}

export default function OfficeLocationPanel() {
  const [center, setCenter] = useState([-6.2088, 106.8456])
  const [markerPos, setMarkerPos] = useState([-6.2088, 106.8456])
  const [userPos, setUserPos] = useState(null)
  const [radius, setRadius] = useState(500)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const mapRef = useRef(null)

  const latRef = useRef(null)
  const lngRef = useRef(null)

  useEffect(() => {
    const init = async () => {
      try {
        const office = await api('/company-settings')
        if (office.latitude && office.longitude) {
          setMarkerPos([office.latitude, office.longitude])
          setCenter([office.latitude, office.longitude])
        }
        if (office.radius) setRadius(office.radius)
      } catch {
        /* use defaults */
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserPos([pos.coords.latitude, pos.coords.longitude])
            setCenter([pos.coords.latitude, pos.coords.longitude])
          },
          () => { /* user declined */ },
          { enableHighAccuracy: true, timeout: 10000 },
        )
      }
      setLoading(false)
    }
    init()
  }, [])

  const handleMapClick = useCallback((latlng) => {
    setMarkerPos([latlng.lat, latlng.lng])
  }, [])

  const handleMarkerDrag = useCallback((e) => {
    const { lat, lng } = e.target.getLatLng()
    setMarkerPos([lat, lng])
  }, [])

  const handleLatInput = (e) => {
    const val = Number(e.target.value)
    if (!Number.isNaN(val)) {
      setMarkerPos((prev) => [val, prev[1]])
      if (userPos && mapRef.current) {
        // Don't recenter on every keystroke
      }
    }
  }

  const handleLngInput = (e) => {
    const val = Number(e.target.value)
    if (!Number.isNaN(val)) {
      setMarkerPos((prev) => [prev[0], val])
    }
  }

  const handleSave = async () => {
    setError('')
    setMessage('')
    setSaving(true)
    try {
      await api('/company-settings', {
        method: 'PUT',
        body: JSON.stringify({
          office_latitude: markerPos[0],
          office_longitude: markerPos[1],
          allowed_radius: radius,
        }),
      })
      setMessage('Lokasi kantor berhasil disimpan')
    } catch (err) {
      setError(err.message || 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="map-loading">Memuat peta...</div>

  return (
    <article className="panel office-location-panel">
      <div className="panel-head">
        <h3>Lokasi Perusahaan & Radius Absensi</h3>
      </div>

      <div className="map-wrapper">
        <MapContainer
          center={center}
          zoom={15}
          style={{ height: '340px', width: '100%', borderRadius: '12px' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onClick={handleMapClick} />
          <MapCenterUpdater center={markerPos} />
          <Marker
            position={markerPos}
            icon={defaultIcon}
            draggable
            eventHandlers={{ dragend: handleMarkerDrag }}
          />
          <Circle
            center={markerPos}
            radius={Number(radius)}
            pathOptions={{ fillColor: '#4b3ac3', fillOpacity: 0.15, color: '#4b3ac3', weight: 2 }}
          />
          {userPos && (
            <Marker position={userPos} icon={userIcon} />
          )}
        </MapContainer>
      </div>

      <div className="location-legend">
        <span className="legend-item"><span className="legend-dot red" /> Lokasi Kantor</span>
        {userPos && <span className="legend-item"><span className="legend-dot blue" /> Lokasi Anda</span>}
        <span className="legend-item"><span className="legend-circle" /> Radius Absensi</span>
      </div>

      <div className="location-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="office-lat">Latitude</label>
            <input
              id="office-lat"
              type="text"
              value={markerPos[0]}
              onChange={handleLatInput}
              ref={latRef}
            />
          </div>
          <div className="form-group">
            <label htmlFor="office-lng">Longitude</label>
            <input
              id="office-lng"
              type="text"
              value={markerPos[1]}
              onChange={handleLngInput}
              ref={lngRef}
            />
          </div>
          <div className="form-group">
            <label htmlFor="office-radius">Radius (meter)</label>
            <input
              id="office-radius"
              type="number"
              min={50}
              max={10000}
              step={50}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value) || 500)}
            />
          </div>
        </div>
        <div className="form-actions">
          <button className="primary-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Lokasi Kantor'}
          </button>
        </div>
      </div>

      <div className="location-status">
        <p>
          Koordinat: <strong>{markerPos[0].toFixed(6)}, {markerPos[1].toFixed(6)}</strong>
          {' '}&middot;{' '}
          Radius: <strong>{radius}m</strong>
        </p>
      </div>

      {message && <p className="message success-msg">{message}</p>}
      {error && <p className="message error-msg">{error}</p>}
    </article>
  )
}
