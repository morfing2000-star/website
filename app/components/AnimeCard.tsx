type AnimeCardProps = {
  title: string;
  meta: string;
};

export function AnimeCard({ title, meta }: AnimeCardProps) {
  return (
    <article className="card">
      <div className="poster" />
      <div className="card-content">
        <strong>{title}</strong>
        <p className="muted">{meta}</p>
      </div>
    </article>
  );
}
