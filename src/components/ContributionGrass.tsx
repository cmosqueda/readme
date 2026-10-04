export default function ContributionGrass() {
  const imageUrl = "https://raw.githubusercontent.com/cmosqueda/readme/output/output.png";

  return (
    <div className="github-grass-card">
      <div className="github-grass-heading"><span>GitHub contribution map</span><a href="https://github.com/cmosqueda" target="_blank" rel="noopener noreferrer">@cmosqueda</a></div>
      <img src={imageUrl} alt="3D visualization of cmosqueda GitHub contributions" className="github-grass-image" loading="lazy" />
      <p>Live contribution artwork, refreshed daily from GitHub activity.</p>
    </div>
  );
}
