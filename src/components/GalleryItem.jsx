import { useEffect, useRef, useState } from "react";

function GalleryItem({ photo, setSelectedPhoto }) {
    const [state, setState] = useState("");
    const ref = useRef(null);

    // Reveal-on-scroll (data attribute so React re-renders don't wipe it)
    useEffect(() => {
        const el = ref.current;
        const io = new IntersectionObserver(([e]) => {
            if (!e.isIntersecting) return;
            el.style.transitionDelay = (photo.id % 3) * 70 + "ms";
            el.dataset.rv = "1";
            io.disconnect();
        }, { rootMargin: "0px 0px -5% 0px" });
        io.observe(el);
        return () => io.disconnect();
    }, [photo.id]);

    return (
        <button
            ref={ref}
            type="button"
            className={"tile " + state}
            data-photo-id={photo.id}
            style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
            aria-label={`Open photo ${photo.id}`}
            onClick={() => setSelectedPhoto(photo)}
        >
            {state === "bad" ? (
                <span>Photo unavailable</span>
            ) : (
                <img
                    src={photo.thumb}
                    alt={`Graduation photo ${photo.id}`}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setState("ld")}
                    onError={() => setState("bad")}
                />
            )}
        </button>
    );
}

export default GalleryItem;
