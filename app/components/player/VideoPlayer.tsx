'use client';

import Hls from 'hls.js';
import { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  src: string;
  animeId: string;
  episodeId?: string;
  introEndSec?: number;
  nextEpisodeUrl?: string;
  subtitles?: string[];
};

export function VideoPlayer({ src, animeId, episodeId, introEndSec = 85, nextEpisodeUrl, subtitles = [] }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [showSkipIntro, setShowSkipIntro] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [showNext, setShowNext] = useState(false);
  const [status, setStatus] = useState('');
  const [miniPlayer, setMiniPlayer] = useState(false);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(subtitles.length > 0);
  const [levels, setLevels] = useState<Array<{ index: number; label: string }>>([]);
  const storageKey = useMemo(() => `resume:${src}`, [src]);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const last = Number(localStorage.getItem(storageKey) ?? '0');
    if (last > 0) video.currentTime = last;

    const saveProgress = () => {
      const positionSec = Math.floor(video.currentTime);
      localStorage.setItem(storageKey, String(positionSec));
      if (video.currentTime > introEndSec) setShowSkipIntro(false);
      if (!episodeId) return;
      fetch('/api/watch-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeId, episodeId, positionSec })
      }).catch(() => null);
    };

    const onTime = () => {
      localStorage.setItem(storageKey, String(Math.floor(video.currentTime)));
      if (video.currentTime > introEndSec) setShowSkipIntro(false);
    };

    const onEnded = () => {
      saveProgress();
      if (!nextEpisodeUrl) return;
      setCountdown(5);
      setShowNext(true);
    };

    const progressTimer = window.setInterval(saveProgress, 15000);
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('ended', onEnded);

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLevels(hls.levels.map((level, index) => ({ index, label: level.height ? `${level.height}p` : `Level ${index + 1}` })));
      });
      return () => {
        window.clearInterval(progressTimer);
        hls.destroy();
        hlsRef.current = null;
        video.removeEventListener('timeupdate', onTime);
        video.removeEventListener('ended', onEnded);
      };
    } else {
      setStatus('Το HLS playback δεν υποστηρίζεται σε αυτόν τον browser.');
    }

    return () => {
      window.clearInterval(progressTimer);
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('ended', onEnded);
    };
  }, [src, animeId, episodeId, introEndSec, nextEpisodeUrl, storageKey]);

  useEffect(() => {
    if (!showNext || !nextEpisodeUrl) return;
    if (countdown <= 0) {
      window.location.href = nextEpisodeUrl;
      return;
    }
    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [showNext, countdown, nextEpisodeUrl]);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    Array.from(video.textTracks).forEach((track) => {
      track.mode = subtitlesEnabled ? 'showing' : 'disabled';
    });
  }, [subtitlesEnabled]);

  function setSpeed(speed: number) {
    if (!ref.current) return;
    ref.current.playbackRate = speed;
    setStatus(`Η ταχύτητα αναπαραγωγής ορίστηκε σε ${speed}x.`);
  }

  function setQuality(index: number | 'auto') {
    if (!hlsRef.current) {
      setStatus('Η επιλογή ποιότητας υποστηρίζεται όταν ο browser χρησιμοποιεί hls.js.');
      return;
    }
    hlsRef.current.currentLevel = index === 'auto' ? -1 : index;
    setStatus(index === 'auto' ? 'Η ποιότητα ορίστηκε σε Auto.' : `Η ποιότητα άλλαξε σε ${levels.find((level) => level.index === index)?.label ?? index}.`);
  }

  function toggleFullscreen() {
    if (!ref.current) return;
    if (!document.fullscreenElement) {
      ref.current.requestFullscreen().catch(() => setStatus('Το fullscreen δεν είναι διαθέσιμο σε αυτό το browser context.'));
    } else {
      document.exitFullscreen().catch(() => setStatus('Δεν ήταν δυνατή η έξοδος από fullscreen.'));
    }
  }

  return (
    <div className={miniPlayer ? 'mini-player' : ''} style={{ position: 'relative' }}>
      <video ref={ref} controls style={{ width: '100%', borderRadius: 12 }}>
        {subtitles.map((subtitle, index) => (
          <track key={subtitle} src={subtitle} kind="subtitles" label={`Subtitles ${index + 1}`} default={index === 0} />
        ))}
      </video>
      {showSkipIntro && (
        <button className="button" style={{ position: 'absolute', right: 20, bottom: 92 }} onClick={() => {
          if (!ref.current) return;
          ref.current.currentTime = introEndSec;
          setShowSkipIntro(false);
        }}>
          Παράλειψη intro
        </button>
      )}
      {showNext && nextEpisodeUrl && (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,.65)' }}>
          <div>
            <h3>Επόμενο επεισόδιο σε {countdown}s</h3>
            <button className="button" onClick={() => (window.location.href = nextEpisodeUrl)}>Παίξε τώρα</button>
          </div>
        </div>
      )}

      <div className="player-toolbar" aria-label="Χειριστήρια player">
        <button className="auth-tab" type="button" onClick={() => setQuality('auto')}>Auto</button>
        {levels.map((level) => <button className="auth-tab" key={level.index} type="button" onClick={() => setQuality(level.index)}>{level.label}</button>)}
        <button className="auth-tab" type="button" onClick={() => setSpeed(0.75)}>0.75x</button>
        <button className="auth-tab" type="button" onClick={() => setSpeed(1)}>1x</button>
        <button className="auth-tab" type="button" onClick={() => setSpeed(1.5)}>1.5x</button>
        {subtitles.length > 0 && <button className="auth-tab" type="button" onClick={() => setSubtitlesEnabled((value) => !value)}>{subtitlesEnabled ? 'Υπότιτλοι OFF' : 'Υπότιτλοι ON'}</button>}
        <button className="auth-tab" type="button" onClick={toggleFullscreen}>Fullscreen</button>
        <button className="auth-tab" type="button" onClick={() => setMiniPlayer((value) => !value)}>{miniPlayer ? 'Έξοδος mini player' : 'Mini player'}</button>
      </div>
      {status && <p className="player-status" role="status" aria-live="polite">{status}</p>}
    </div>
  );
}
