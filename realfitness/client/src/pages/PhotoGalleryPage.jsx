import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { loadPhotoEntries } from "../utils/dailyProgress";

function PhotoGalleryPage() {
  const [photoEntries, setPhotoEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "RealFitness Photo Gallery";
  }, []);

  useEffect(() => {
    async function fetchPhotos() {
      const nextPhotos = await loadPhotoEntries();
      setPhotoEntries(nextPhotos);
      setIsLoading(false);
    }

    fetchPhotos();
  }, []);

  return (
    <section className="simple-page-shell">
      <div className="simple-page-card">
        <PageHeader
          eyebrow="Photo Gallery"
          title="See all progress and meal photos together in one place."
          description="Every image saved through Daily Progress appears here so your visual history is easier to review."
          actionLabel="Add New Photo"
          actionTo="/daily-progress"
          actionClassName="secondary-link"
        />

        {isLoading ? (
          <div className="empty-gallery">
            <p>Loading your saved photos...</p>
          </div>
        ) : photoEntries.length ? (
          <div className="gallery-grid">
            {photoEntries.map((entry) => (
              <article className="gallery-card" key={`${entry.date}-${entry.photoName}`}>
                <img className="gallery-image" src={entry.photoDataUrl} alt={entry.photoName} />
                <div className="gallery-copy">
                  <span className="feature-label">{entry.date}</span>
                  <strong>{entry.title}</strong>
                  <p>{entry.notes}</p>
                  {entry.meals ? <p>Meals: {entry.meals}</p> : null}
                  {entry.driveSyncStatus === "synced" && entry.driveFileUrl ? (
                    <a className="secondary-link" href={entry.driveFileUrl} target="_blank" rel="noreferrer">
                      Open In Drive
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-gallery">
            <p>No saved photos yet. Add one on the Daily Progress page to see it here.</p>
            <Link className="primary-cta" to="/daily-progress">
              Go To Daily Progress
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default PhotoGalleryPage;
