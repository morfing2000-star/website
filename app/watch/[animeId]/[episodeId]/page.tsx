import { VideoPlayer } from '@/app/components/player/VideoPlayer';

export default function WatchPage() {
  return (
    <main className="page" style={{ padding: '1.5rem' }}>
      <h1>ANIVEX Player</h1>
      <p className="muted">HLS adaptive streaming • Resume watching • Skip intro • Auto next episode</p>
      <VideoPlayer src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" nextEpisodeUrl="/watch/a1/e2" />
    </main>
  );
}
