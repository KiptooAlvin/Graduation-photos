import { useEffect } from "react";

import photos from "../data/photos";

import "../styles/lightbox.css";

function Lightbox({ selectedPhoto, setSelectedPhoto }) {

    useEffect(() => {

        const handleKeyDown = (e) => {

            if (!selectedPhoto) return;

            if (e.key === "Escape") {

                setSelectedPhoto(null);

            }

            if (e.key === "ArrowRight") {

                nextImage();

            }

            if (e.key === "ArrowLeft") {

                previousImage();

            }

        };

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);

    });

    if (!selectedPhoto) return null;

    const currentIndex = photos.findIndex(

        p => p.id === selectedPhoto.id

    );

    const nextImage = () => {

        const next = (currentIndex + 1) % photos.length;

        setSelectedPhoto(photos[next]);

    };

    const previousImage = () => {

        const prev =

            (currentIndex - 1 + photos.length)

            % photos.length;

        setSelectedPhoto(photos[prev]);

    };

    return (

        <div className="lightbox">

            <button

                className="close-btn"

                onClick={() => setSelectedPhoto(null)}

            >

                ✕

            </button>

            <button

                className="nav left"

                onClick={previousImage}

            >

                ❮

            </button>

            <img

                src={selectedPhoto.full}

                alt="Event"

            />

            <button

                className="nav right"

                onClick={nextImage}

            >

                ❯

            </button>

            <a

                href={selectedPhoto.full}

                download

                className="download-btn"

            >

                ⬇ Download Original

            </a>

        </div>

    );

}

export default Lightbox;