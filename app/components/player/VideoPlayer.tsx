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

  return (
    <div style={{ position: 'relative' }}>
      <video ref={ref} controls style={{ width: '100%', borderRadius: 12 }} />
      {showSkipIntro && (
        <button className="button" style={{ position: 'absolute', right: 20, bottom: 30 }} onClick={() => {
          if (!ref.current) return;
          ref.current.currentTime = introEndSec;
          setShowSkipIntro(false);
        }}>
          Skip Intro
        </button>
      )}
      {showNext && nextEpisodeUrl && (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,.65)' }}>
          <div>
            <h3>Next episode in {countdown}s</h3>
            <button className="button" onClick={() => (window.location.href = nextEpisodeUrl)}>Play now</button>
          </div>
        </div>
      )}
    </div>
  );
}
