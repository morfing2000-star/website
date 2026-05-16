'use client';

import Hls from 'hls.js';
import { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  src: string;
  introEndSec?: number;
  nextEpisodeUrl?: string;
};

export function VideoPlayer({ src, introEndSec = 85, nextEpisodeUrl }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [showSkipIntro, setShowSkipIntro] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [showNext, setShowNext] = useState(false);
  const [status, setStatus] = useState('');
  const [miniPlayer, setMiniPlayer] = useState(false);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const storageKey = useMemo(() => `resume:${src}`, [src]);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const last = Number(localStorage.getItem(storageKey) ?? '0');
    if (last > 0) video.currentTime = last;

    const onTime = () => {
      localStorage.setItem(storageKey, String(Math.floor(video.currentTime)));
      if (video.currentTime > introEndSec) setShowSkipIntro(false);
    };

    const onEnded = () => {
      if (!nextEpisodeUrl) return;
      setCountdown(5);
      setShowNext(true);
    };

    video.addEventListener('timeupdate', onTime);
    video.addEventListener('ended', onEnded);

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => {
        hls.destroy();
        video.removeEventListener('timeupdate', onTime);
        video.removeEventListener('ended', onEnded);
      };
    } else {
      setStatus('Το HLS playback δεν υποστηρίζεται σε αυτόν τον browser.');
    }

    return () => {
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('ended', onEnded);
    };
  }, [src, introEndSec, nextEpisodeUrl, storageKey]);

  useEffect(() => {
    if (!showNext || !nextEpisodeUrl) return;
    if (countdown <= 0) {
      window.location.href = nextEpisodeUrl;
      return;
    }
    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [showNext, countdown, nextEpisodeUrl]);

  function setSpeed(speed: number) {
    if (!ref.current) return;
    ref.current.playbackRate = speed;
    setStatus(`Η ταχύτητα αναπαραγωγής ορίστηκε σε ${speed}x.`);
  }

  function setQuality(label: string) {
    setStatus(`Η επιλογή ποιότητας ${label} εμφανίζεται στο demo. Το adaptive HLS rendition switching θα συνδεθεί με encoded variants στο Phase 3.`);
  }

  function toggleSubtitles() {
    setSubtitlesEnabled((value) => !value);
    setStatus('Το toggle υποτίτλων είναι έτοιμο στο UI. Τα subtitle tracks θα εμφανίζονται όταν προστεθούν VTT/SRT αρχεία.');
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
      <video ref={ref} controls style={{ width: '100%', borderRadius: 12 }} />
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
        <button className="auth-tab" type="button" onClick={() => setQuality('720p')}>720p</button>
        <button className="auth-tab" type="button" onClick={() => setQuality('1080p')}>1080p</button>
        <button className="auth-tab" type="button" onClick={() => setSpeed(0.75)}>0.75x</button>
        <button className="auth-tab" type="button" onClick={() => setSpeed(1)}>1x</button>
        <button className="auth-tab" type="button" onClick={() => setSpeed(1.5)}>1.5x</button>
        <button className="auth-tab" type="button" onClick={toggleSubtitles}>{subtitlesEnabled ? 'Υπότιτλοι OFF' : 'Υπότιτλοι ON'}</button>
        <button className="auth-tab" type="button" onClick={toggleFullscreen}>Fullscreen</button>
        <button className="auth-tab" type="button" onClick={() => setMiniPlayer((value) => !value)}>{miniPlayer ? 'Έξοδος mini player' : 'Mini player'}</button>
      </div>
      {status && <p className="player-status" role="status" aria-live="polite">{status}</p>}
    </div>
  );
}
