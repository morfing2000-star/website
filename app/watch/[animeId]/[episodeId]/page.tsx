import { notFound } from 'next/navigation';
import { VideoPlayer } from '@/app/components/player/VideoPlayer';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

type WatchPageProps = {
  params: { animeId: string; episodeId: string };
};

export default async function WatchPage({ params }: WatchPageProps) {
  const episode = await prisma.episode.findUnique({
    where: { id: params.episodeId },
    include: { season: { include: { anime: true, episodes: { orderBy: { number: 'asc' } } } } }
  });

  if (!episode || episode.season.animeId !== params.animeId) notFound();

  const nextEpisode = episode.season.episodes.find((item) => item.number > episode.number);

  return (
    <main className="page" style={{ padding: '1.5rem' }}>
      <h1>{episode.season.anime.title}: {episode.title}</h1>
      <p className="muted">HLS adaptive streaming • Συνέχεια προβολής • Skip intro • Αυτόματο επόμενο επεισόδιο</p>
      <VideoPlayer
        src={episode.hlsMasterUrl}
        animeId={episode.season.animeId}
        episodeId={episode.id}
        introEndSec={episode.introEndSec ?? 85}
        nextEpisodeUrl={nextEpisode ? `/watch/${episode.season.animeId}/${nextEpisode.id}` : undefined}
        subtitles={episode.subtitles}
      />
    </main>
  );
}
