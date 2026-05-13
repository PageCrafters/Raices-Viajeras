import { useRef, useState } from 'react';

const SCENES = [
  { key: 'bosque',  label: 'Bosque',  icon: '🌲', desc: 'Viento',
    mp3: '/audio/bosque.mp3', ogg: '/audio/bosque.ogg' },
  { key: 'playa',   label: 'Playa',   icon: '🌊', desc: 'Olas del mar',
    mp3: '/audio/playa.mp3',  ogg: '/audio/playa.ogg'  },
  { key: 'montana', label: 'Montaña', icon: '⛰️', desc: 'Río',
    mp3: '/audio/montana.mp3', ogg: '/audio/montana.ogg' },
];

export default function AmbientPlayer() {
  const audioRef = useRef(null);
  const [active, setActive]   = useState(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume]   = useState(0.7);

  const selectScene = (scene) => {
    if (audioRef.current) { 
        audioRef.current.pause(); 
    }

    setActive(scene);
    setPlaying(false);
  };

  const togglePlay = () => {
    const iconStop = audioRef.current;
    if (!iconStop) return;

    if (playing) { 
        iconStop.pause(); setPlaying(false); 
    }else { 
        iconStop.play(); setPlaying(true);  
    }
  };

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  return (
    <div className="ambient-player my-4">

      <div className="d-flex gap-2 mb-3">
        {SCENES.map((s) => (
          <button
            key={s.key}
            className={`btn btn-sm ${active?.key === s.key ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => selectScene(s)}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {active && (
        <audio ref={audioRef} loop volume={volume} key={active.key}>
          <source src={active.ogg} type="audio/ogg" />
          <source src={active.mp3} type="audio/mpeg" />
        </audio>
      )}

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
          type="range" min="0" max="1" step="0.05"
          value={volume} onChange={handleVolume}
          aria-label="Volumen" style={{ width: 90 }}
        />
      </div>
    </div>
  );
}