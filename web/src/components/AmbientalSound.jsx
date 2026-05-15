import { useRef, useState } from 'react'
import { assetPath } from '../lib/routes'

const SCENES = [
  {
    key: 'bosque',
    label: 'Bosque',
    iconClass: 'bi-tree-fill',
    desc: 'Viento',
    mp3: assetPath('audio/bosque.mp3'),
    ogg: assetPath('audio/bosque.ogg'),
  },
  {
    key: 'playa',
    label: 'Playa',
    iconClass: 'bi-water',
    desc: 'Olas del mar',
    mp3: assetPath('audio/playa.mp3'),
    ogg: assetPath('audio/playa.ogg'),
  },
  {
    key: 'montana',
    label: 'Montana',
    iconClass: 'bi-compass-fill',
    desc: 'Rio',
    mp3: assetPath('audio/montana.mp3'),
    ogg: assetPath('audio/montana.ogg'),
  },
]

export default function AmbientPlayer() {
  const audioRef = useRef(null)
  const [active, setActive] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.7)

  const selectScene = (scene) => {
    // Si cambiamos de paisaje, paramos el audio anterior para no mezclar sonidos.
    if (audioRef.current) {
      audioRef.current.pause()
    }

    setActive(scene)
    setPlaying(false)
  }

  const togglePlay = () => {
    const audioNode = audioRef.current
    if (!audioNode) return

    // El play/pause trabaja sobre un solo audio para mantener el control simple.
    if (playing) {
      audioNode.pause()
      setPlaying(false)
    } else {
      audioNode.play()
      setPlaying(true)
    }
  }

  const handleVolume = (event) => {
    const nextVolume = parseFloat(event.target.value)
    setVolume(nextVolume)

    if (audioRef.current) {
      audioRef.current.volume = nextVolume
    }
  }

  return (
    <div className="ambient-player my-4">
      <div className="d-flex gap-2 mb-3">
        {SCENES.map((scene) => (
          <button
            key={scene.key}
            className={`btn btn-sm ${active?.key === scene.key ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => selectScene(scene)}
          >
            <i className={`bi ${scene.iconClass} me-1`} aria-hidden="true"></i>
            {scene.label}
          </button>
        ))}
      </div>

      {active ? (
        <audio ref={audioRef} loop volume={volume} key={active.key}>
          <source src={active.ogg} type="audio/ogg" />
          <source src={active.mp3} type="audio/mpeg" />
        </audio>
      ) : null}

      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-outline-success btn-sm"
          onClick={togglePlay}
          disabled={!active}
          aria-label={playing ? 'Pausar' : 'Reproducir'}
        >
          <i className={`bi ${playing ? 'bi-pause-fill' : 'bi-play-fill'}`}></i>
        </button>
        <span className="small text-muted">
          {active ? active.desc : 'Selecciona un ambiente'}
        </span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolume}
          aria-label="Volumen"
          style={{ width: 90 }}
        />
      </div>
    </div>
  )
}
