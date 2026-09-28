import { useState } from "react";

function GalleryItem({ photo, setSelectedPhoto }) {
    const [state, setState] = useState("loading");

    return (
        <button
            className={"tile" + (state === "ok" ? " done" : "") + (state === "bad" ? " bad" : "")}
            onClick={() => setSelectedPhoto(photo)}
            aria-label={`Open photo ${photo.id}`}
        >
            {state === "bad" ? "Unavailable" : (
                <img
                    src={photo.thumb}
                    width={photo.width}
                    height={photo.height}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className={state === "ok" ? "ok" : ""}
                    onLoad={() => setState("ok")}
                    onError={() => setState("bad")}
                />
            )}
        </button>
    );
}

export default GalleryItem;
