import { useCallback, useEffect, useRef, useState } from "react";
import photos from "../data/photos";

const Icon = ({ d }) => <svg className="icon" viewBox="0 0 24 24"><path d={d} /></svg>;
const ext = (url) => (url.split("?")[0].match(/\.(\w+)$/) || [])[1] || "jpg";

function Stage({ photo }) {
    const [ok, setOk] = useState(false);
    return (
        <div className="lb-stage">
            <img className="ph" src={photo.thumb} alt="" />
            <img className={"full" + (ok ? " ok" : "")} src={photo.full} alt="Graduation event" onLoad={() => setOk(true)} draggable="false" />
        </div>
    );
}

function Lightbox({ selectedPhoto, setSelectedPhoto }) {
    const [hideUi, setHideUi] = useState(false);
    const [saving, setSaving] = useState(false);
    const touch = useRef(null);
    const open = !!selectedPhoto;
    const idx = open ? photos.findIndex(p => p.id === selectedPhoto.id) : -1;

    const close = useCallback(() => setSelectedPhoto(null), [setSelectedPhoto]);
    const go = useCallback((d) => {
        if (idx < 0) return;
        setSelectedPhoto(photos[(idx + d + photos.length) % photos.length]);
    }, [idx, setSelectedPhoto]);

    useEffect(() => {
        if (!open) return;
        setHideUi(false);
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === "Escape") close();
            if (e.key === "ArrowRight") go(1);
            if (e.key === "ArrowLeft") go(-1);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, close, go]);

    useEffect(() => {
        if (idx < 0) return;
        [1, -1].forEach(d => { new Image().src = photos[(idx + d + photos.length) % photos.length].full; });
    }, [idx]);

    if (!open) return null;

    const onTouchStart = (e) => {
        const t = e.touches[0];
        const zoomed = window.visualViewport && window.visualViewport.scale > 1.01;
        touch.current = e.touches.length === 1 && !zoomed ? { x: t.clientX, y: t.clientY } : null;
    };
    const onTouchEnd = (e) => {
        const s = touch.current;
        touch.current = null;
        if (!s) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - s.x, dy = t.clientY - s.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
        else if (dy > 100 && dy > Math.abs(dx) * 1.5) close();
        else if (Math.abs(dx) < 10 && Math.abs(dy) < 10) setHideUi(h => !h);
    };

    const save = async () => {
        const name = `Graduation-${String(selectedPhoto.id).padStart(3, "0")}.${ext(selectedPhoto.full)}`;
        setSaving(true);
        try {
            const blob = await (await fetch(selectedPhoto.full)).blob();
            const file = new File([blob], name, { type: blob.type });
            const touchDevice = window.matchMedia("(pointer: coarse)").matches;
            if (touchDevice && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file] });
            } else {
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = name;
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => URL.revokeObjectURL(a.href), 2000);
            }
        } catch (err) {
            if (err.name !== "AbortError") window.open(selectedPhoto.full, "_blank");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={"lb" + (hideUi ? " hide" : "")} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
            onClick={(e) => { if (e.target === e.currentTarget || e.target.classList.contains("lb-stage")) close(); }}>
            <Stage key={selectedPhoto.id} photo={selectedPhoto} />

            <div className="lb-top">
                <span className="lb-count">{idx + 1} / {photos.length}</span>
                <button className="round" onClick={close} aria-label="Close"><Icon d="M6 6l12 12M18 6L6 18" /></button>
            </div>

            <button className="round lb-nav prev" onClick={() => go(-1)} aria-label="Previous"><Icon d="M15 5l-7 7 7 7" /></button>
            <button className="round lb-nav next" onClick={() => go(1)} aria-label="Next"><Icon d="M9 5l7 7-7 7" /></button>

            <div className="lb-bar">
                <button className="btn" onClick={save} disabled={saving}>
                    <Icon d="M12 4v11M7 11l5 5 5-5M5 20h14" />
                    {saving ? "Preparing…" : "Save photo"}
                </button>
            </div>
        </div>
    );
}

export default Lightbox;
