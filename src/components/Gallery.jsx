import photos from "../data/photos";
import GalleryItem from "./GalleryItem";

function Gallery({ setSelectedPhoto }) {
    return (
        <section id="gallery" className="gallery">
            <div className="g-head">
                <h2>All photos</h2>
                <span>Tap a photo to view &amp; save</span>
            </div>
            {photos.length === 0 ? (
                <p className="empty">No photos have been uploaded yet.</p>
            ) : (
                <div className="grid">
                    {photos.map(photo => (
                        <GalleryItem key={photo.id} photo={photo} setSelectedPhoto={setSelectedPhoto} />
                    ))}
                </div>
            )}
        </section>
    );
}

export default Gallery;
