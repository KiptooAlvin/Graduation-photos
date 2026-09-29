import { useState } from "react";
import photos from "../data/photos";
import GalleryItem from "./GalleryItem";

const load = () => { try { return Number(localStorage.getItem("gallery-cols")) || 2; } catch { return 2; } };

function Gallery({ setSelectedPhoto }) {
    const [cols, setCols] = useState(load);
    const pick = (n) => {
        setCols(n);
        try { localStorage.setItem("gallery-cols", n); } catch { /* storage unavailable */ }
        navigator.vibrate?.(5);
    };

    return (
        <section id="gallery" className="gallery">
            <div className="g-head">
                <div>
                    <h2>All photos</h2>
                    <span>Tap a photo to view &amp; save</span>
                </div>
                <div className="seg" role="group" aria-label="Grid density">
                    {[2, 3].map(n => (
                        <button key={n} aria-pressed={cols === n} aria-label={`${n} columns`} onClick={() => pick(n)}>{n}</button>
                    ))}
                </div>
            </div>
            {photos.length === 0 ? (
                <p className="empty">No photos have been uploaded yet.</p>
            ) : (
                <div className="grid" style={{ "--m": cols }}>
                    {photos.map(photo => (
                        <GalleryItem key={photo.id} photo={photo} setSelectedPhoto={setSelectedPhoto} />
                    ))}
                </div>
            )}
        </section>
    );
}

export default Gallery;
