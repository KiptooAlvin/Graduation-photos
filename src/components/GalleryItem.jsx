import { useState } from "react";

const FALLBACK_THUMB = "/images/photo-unavailable.png";

function GalleryItem({ photo, setSelectedPhoto }) {

    const [loaded, setLoaded] = useState(false);

    const handleError = (event) => {
        event.currentTarget.src = FALLBACK_THUMB;
    };

    return (

        <div
            className="gallery-item"
            onClick={() => setSelectedPhoto(photo)}
        >

            <img
                src={photo.thumb}
                alt="Event"
                loading="lazy"
                className={loaded ? "loaded" : "loading"}
                onLoad={() => setLoaded(true)}
                onError={handleError}
            />

        </div>

    );

}

export default GalleryItem;