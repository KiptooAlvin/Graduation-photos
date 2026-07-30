import "../styles/gallery.css";

import photos from "../data/photos";

import GalleryItem from "./GalleryItem";

function Gallery({ setSelectedPhoto }) {

    return (

        <section id="gallery" className="gallery-section">

            <h2>Event Gallery</h2>

            <div className="gallery-grid">

                {photos.map(photo => (

                    <GalleryItem

                        key={photo.id}

                        photo={photo}

                        setSelectedPhoto={setSelectedPhoto}

                    />

                ))}

            </div>

        </section>

    );
    if (photos.length === 0) {

    return (

        <section id="gallery" className="gallery-section">

            <h2>Event Gallery</h2>

            <p>No photos have been uploaded yet.</p>

        </section>

    );

}


}

export default Gallery;