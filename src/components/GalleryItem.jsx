import { useState } from "react";

function GalleryItem({ photo, setSelectedPhoto }) {

    const [loaded, setLoaded] = useState(false);

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
                onError={(e) => {
                    e.target.src = "/images/photo-unavailable.png";
                }}
            />

        </div>

    );

}

export default GalleryItem;