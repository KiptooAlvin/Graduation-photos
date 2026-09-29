import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import photos from "../data/photos";

const Icon = ({ d }) => <svg className="icon" viewBox="0 0 24 24"><path d={d} /></svg>;
const ext = (url) => (url.split("?")[0].match(/\.(\w+)$/) || [])[1] || "jpg";
const clamp = (a, lo, hi) => Math.min(hi, Math.max(lo, a));
const easeBack = (k) => 1 + 2.5 * (k - 1) ** 3 + 1.5 * (k - 1) ** 2;
const easeOut = (k) => 1 - (1 - k) ** 3;
const soft = (x, m) => (Math.abs(x) <= m ? x : Math.sign(x) * (m + (Math.abs(x) - m) * 0.35));
const buzz = (n) => { try { navigator.vibrate?.(n); } catch { /* unsupported */ } };
const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const tileOf = (id) => document.querySelector(`[data-photo-id="${id}"]`);
const flip = (r, d) => `translate3d(${r.left + r.width / 2 - d.vw / 2}px,${r.top + r.height / 2 - d.vh / 2}px,0) scale(${r.width / d.fw})`;

function Pics({ photo, onRatio }) {
    const [ok, setOk] = useState(false);
    return (
        <>
            <img className="ph" src={photo.thumb} alt="" draggable="false" />
            <img className={"full" + (ok ? " ok" : "")} src={photo.full} alt={`Graduation photo ${photo.id}`} draggable="false" decoding="async"
                onLoad={(e) => { setOk(true); onRatio(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight); }} />
        </>
    );
}

function Lightbox({ selectedPhoto, setSelectedPhoto }) {
    const [hideUi, setHideUi] = useState(false);
    const [saving, setSaving] = useState(false);
    const [closing, setClosing] = useState(false);
    const root = useRef(), wrap = useRef(), bd = useRef(), amb = useRef();
    const st = useRef({ x: 0, y: 0, s: 1, r: 0 });
    const d = useRef({ vw: 0, vh: 0, fw: 0, fh: 0 });
    const R = useRef({ ratio: 1, anim: 0, raf: 0, busy: false, closing: false, pushed: false, wasOpen: false, enter: null, hid: null, g: null, P: new Map(), tap: { t: 0, x: 0, y: 0 }, tt: 0 });
    const open = !!selectedPhoto;
    const idx = open ? photos.findIndex(p => p.id === selectedPhoto.id) : -1;

    const render = useCallback(() => {
        const s = st.current;
        if (!wrap.current) return;
        wrap.current.style.transform = `translate3d(${s.x}px,${s.y}px,0) scale(${s.s}) rotate(${s.r}deg)`;
        if (amb.current) amb.current.style.transform = `translate3d(${-s.x * 0.06}px,${-s.y * 0.06}px,0) scale(1.15)`;
        const z = s.s > 1.02 ? "1" : "";
        if (root.current.dataset.zoom !== z) root.current.dataset.zoom = z;
    }, []);
    const paint = () => { const r = R.current; r.raf ||= requestAnimationFrame(() => { r.raf = 0; render(); }); };
    const tween = useCallback((to, ms = 380, ease = easeBack) => {
        const r = R.current; cancelAnimationFrame(r.anim);
        const f = { ...st.current }, t0 = performance.now(); ms = still() ? 0 : ms;
        return new Promise(res => {
            const step = (t) => {
                const k = ms ? Math.min(1, (t - t0) / ms) : 1, e = ease(k);
                for (const key in to) st.current[key] = f[key] + (to[key] - f[key]) * e;
                render();
                if (k < 1) r.anim = requestAnimationFrame(step); else res();
            };
            r.anim = requestAnimationFrame(step);
        });
    }, [render]);
    const fit = useCallback(() => {
        const viewport = window.visualViewport;
        const vw = viewport?.width || innerWidth, vh = viewport?.height || innerHeight;
        const left = viewport?.offsetLeft || 0, top = viewport?.offsetTop || 0;
        const fw = Math.min(vw, vh * R.current.ratio), fh = fw / R.current.ratio;
        d.current = { vw, vh, fw, fh };
        if (root.current) root.current.dataset.orientation = vw >= vh ? "landscape" : "portrait";
        Object.assign(wrap.current.style, { width: fw + "px", height: fh + "px", left: left + (vw - fw) / 2 + "px", top: top + (vh - fh) / 2 + "px" });
    }, []);
    const onRatio = (r) => { if (Math.abs(r / R.current.ratio - 1) > 0.02) { R.current.ratio = r; fit(); } };
    const bnd = (s) => ({ mx: Math.max(0, (d.current.fw * s - d.current.vw) / 2), my: Math.max(0, (d.current.fh * s - d.current.vh) / 2) });

    // Animated close: fly back to the tile the photo came from
    const animateClose = useCallback(() => {
        const r = R.current, el = wrap.current;
        if (r.closing || !el) return;
        r.closing = true; setClosing(true); cancelAnimationFrame(r.anim);
        bd.current.style.transition = "opacity .4s"; bd.current.style.opacity = 0;
        const t = tileOf(selectedPhoto.id)?.getBoundingClientRect(), cs = el.style.transform, dm = d.current;
        const ms = still() ? 0 : 1;
        const a = t && t.bottom > 0 && t.top < dm.vh
            ? el.animate([{ transform: cs, borderRadius: "0px" }, { transform: flip(t, dm), borderRadius: 14 * dm.fw / t.width + "px" }], { duration: 440 * ms, easing: "cubic-bezier(.3,.8,.2,1)", fill: "forwards" })
            : el.animate([{ opacity: 1, transform: cs }, { opacity: 0, transform: cs + " scale(.9)" }], { duration: 260 * ms, fill: "forwards" });
        buzz(6);
        a.onfinish = () => {
            const tile = r.hid; if (tile) tile.style.visibility = "";
            r.hid = null; r.wasOpen = false; r.closing = false;
            setClosing(false); setSelectedPhoto(null);
            tile?.focus({ preventScroll: true });
        };
    }, [selectedPhoto, setSelectedPhoto]);
    const requestClose = useCallback(() => {
        if (R.current.pushed) { R.current.pushed = false; history.back(); } else animateClose();
    }, [animateClose]);
    const go = useCallback(async (dir) => {
        const r = R.current; if (r.busy || idx < 0) return;
        r.busy = true; buzz(6);
        await tween({ x: -dir * d.current.vw, s: 0.92, r: -dir * 4 }, 240, easeOut);
        r.enter = dir; setSelectedPhoto(photos[(idx + dir + photos.length) % photos.length]); r.busy = false;
    }, [idx, tween, setSelectedPhoto]);

    // Photo changed (or lightbox just opened): fit, hide source tile, run enter animation
    useLayoutEffect(() => {
        if (!selectedPhoto) return;
        const r = R.current, el = wrap.current;
        r.ratio = selectedPhoto.width / selectedPhoto.height; fit();
        if (r.hid) r.hid.style.visibility = "";
        r.hid = tileOf(selectedPhoto.id); if (r.hid) r.hid.style.visibility = "hidden";
        const dm = d.current;
        if (!r.wasOpen) {
            r.wasOpen = true; st.current = { x: 0, y: 0, s: 1, r: 0 }; render();
            const t = r.hid?.getBoundingClientRect();
            if (t && !still()) el.animate([
                { transform: flip(t, dm) + " rotate(-3deg)", borderRadius: 14 * dm.fw / t.width + "px" },
                { transform: "translate3d(0,0,0) scale(1) rotate(0deg)", borderRadius: "0px" },
            ], { duration: 560, easing: "cubic-bezier(.2,1.15,.3,1)" });
            buzz(8);
        } else if (r.enter != null) {
            const dir = r.enter; r.enter = null;
            Object.assign(st.current, { x: dir * dm.vw * 0.6, y: 0, s: 0.92, r: dir * 4 }); render();
            tween({ x: 0, s: 1, r: 0 }, 420);
        }
    }, [selectedPhoto?.id]); // eslint-disable-line

    useEffect(() => () => { if (R.current.hid) R.current.hid.style.visibility = ""; }, []);

    useEffect(() => {
        if (!open) return;
        setHideUi(false);
        document.body.style.overflow = "hidden";
        const r = R.current;
        if (!r.pushed) { try { history.pushState({ lb: 1 }, ""); r.pushed = true; } catch { /* no history */ } }
        const onPop = () => { r.pushed = false; animateClose(); };
        const onResize = () => { fit(); st.current = { x: 0, y: 0, s: 1, r: 0 }; render(); };
        window.addEventListener("popstate", onPop);
        window.addEventListener("resize", onResize);
        window.visualViewport?.addEventListener("resize", onResize);
        window.visualViewport?.addEventListener("scroll", onResize);
        root.current?.querySelector(".round")?.focus({ preventScroll: true });
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("popstate", onPop);
            window.removeEventListener("resize", onResize);
            window.visualViewport?.removeEventListener("resize", onResize);
            window.visualViewport?.removeEventListener("scroll", onResize);
        };
    }, [open, animateClose, fit, render]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === "Escape") requestClose();
            if (e.key === "ArrowRight") go(1);
            if (e.key === "ArrowLeft") go(-1);
            if (e.key === "Tab") {
                const b = [...root.current.querySelectorAll("button:not(:disabled)")], i = b.indexOf(document.activeElement);
                e.preventDefault(); b[(i + (e.shiftKey ? -1 : 1) + b.length) % b.length]?.focus();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, requestClose, go]);

    useEffect(() => {
        if (idx < 0) return;
        [1, -1].forEach(dd => { new Image().src = photos[(idx + dd + photos.length) % photos.length].full; });
    }, [idx]);

    // ---- gestures: pinch, pan, double-tap, swipe, drag-down to dismiss ----
    const settle = () => {
        const s = clamp(st.current.s, 1, 5), { mx, my } = bnd(s);
        if (st.current.s < 1) buzz(6);
        tween({ s, x: s === 1 ? 0 : clamp(st.current.x, -mx, mx), y: s === 1 ? 0 : clamp(st.current.y, -my, my), r: 0 }, 420);
    };
    const dbl = (x, y) => {
        buzz(10);
        if (st.current.s > 1.05) { tween({ s: 1, x: 0, y: 0, r: 0 }, 450); return; }
        const { vw, vh, fh } = d.current, S = clamp(vh / fh, 2.4, 4), { mx, my } = bnd(S);
        const px = (x - vw / 2 - st.current.x) / st.current.s, py = (y - vh / 2 - st.current.y) / st.current.s;
        tween({ s: S, x: clamp(x - vw / 2 - px * S, -mx, mx), y: clamp(y - vh / 2 - py * S, -my, my), r: 0 }, 480);
    };
    const tap = (e) => {
        const r = R.current, t = r.tap, now = performance.now(), x = e.clientX, y = e.clientY;
        if (now - t.t < 300 && Math.hypot(x - t.x, y - t.y) < 40) { clearTimeout(r.tt); t.t = 0; dbl(x, y); return; }
        Object.assign(t, { t: now, x, y });
        r.tt = setTimeout(() => {
            if (st.current.s > 1.02) return;
            const b = wrap.current.getBoundingClientRect();
            if (x < b.left || x > b.right || y < b.top || y > b.bottom) requestClose(); else setHideUi(h => !h);
        }, 300);
    };
    const onDown = (e) => {
        const r = R.current; e.currentTarget.setPointerCapture(e.pointerId);
        r.P.set(e.pointerId, { x: e.clientX, y: e.clientY }); cancelAnimationFrame(r.anim);
        if (r.P.size === 2) {
            const [a, b] = [...r.P.values()]; clearTimeout(r.tt);
            r.g = { m: "pinch", dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, s: st.current.s, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, x: st.current.x, y: st.current.y };
            buzz(4);
        } else if (r.P.size === 1) r.g = { m: "", sx: e.clientX, sy: e.clientY, x: st.current.x, y: st.current.y, lx: e.clientX, lt: performance.now(), vx: 0 };
    };
    const onMove = (e) => {
        const r = R.current, g = r.g, p = r.P.get(e.pointerId), { vw, vh } = d.current, s = st.current;
        if (!p || !g) return;
        p.x = e.clientX; p.y = e.clientY;
        if (g.m === "pinch" && r.P.size === 2) {
            const [a, b] = [...r.P.values()], ns = clamp(g.s * Math.hypot(a.x - b.x, a.y - b.y) / g.dist, 0.55, 6);
            const px = (g.mx - vw / 2 - g.x) / g.s, py = (g.my - vh / 2 - g.y) / g.s;
            s.s = ns; s.x = (a.x + b.x) / 2 - vw / 2 - px * ns; s.y = (a.y + b.y) / 2 - vh / 2 - py * ns; s.r = 0; paint(); return;
        }
        if (r.P.size !== 1 || g.m === "none") return;
        const dx = e.clientX - g.sx, dy = e.clientY - g.sy;
        if (!g.m) { if (Math.hypot(dx, dy) < 8) return; g.m = s.s > 1.02 ? "pan" : Math.abs(dy) > Math.abs(dx) ? "dismiss" : "swipe"; }
        const now = performance.now(); g.vx = (e.clientX - g.lx) / (now - g.lt || 1); g.lx = e.clientX; g.lt = now;
        if (g.m === "pan") { const { mx, my } = bnd(s.s); s.x = soft(g.x + dx, mx); s.y = soft(g.y + dy, my); }
        else if (g.m === "dismiss") {
            const k = Math.min(1, Math.abs(dy) / 380);
            s.y = dy; s.x = dx * 0.6; s.s = 1 - k * 0.25; s.r = dx / 25;
            bd.current.style.transition = "none"; bd.current.style.opacity = 1 - k * 0.85;
            root.current.dataset.zoom = "1";
        } else { s.x = dx; s.y = 0; s.r = -dx / vw * 3; }
        paint();
    };
    const onUp = (e) => {
        const r = R.current, g = r.g;
        if (!r.P.delete(e.pointerId) || !g) return;
        if (g.m === "pinch") { if (r.P.size < 2) { r.g = { m: "none" }; settle(); } return; }
        if (r.P.size) return;
        r.g = null;
        if (g.m === "") tap(e);
        else if (g.m === "pan") settle();
        else if (g.m === "dismiss") {
            if (Math.abs(st.current.y) > 110) requestClose();
            else { bd.current.style.transition = ""; bd.current.style.opacity = ""; root.current.dataset.zoom = ""; tween({ x: 0, y: 0, s: 1, r: 0 }, 450); }
        } else if (g.m === "swipe") {
            if (Math.abs(st.current.x) > d.current.vw * 0.2 || Math.abs(g.vx) > 0.5) go(st.current.x < 0 ? 1 : -1);
            else tween({ x: 0, r: 0 }, 400);
        }
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

    if (!open) return null;

    return (
        <div ref={root} className={"lb" + (hideUi ? " hide" : "") + (closing ? " closing" : "")} role="dialog" aria-modal="true" aria-label="Photo viewer">
            <div ref={bd} className="lb-bd"><img ref={amb} className="lb-amb" src={selectedPhoto.thumb} alt="" aria-hidden="true" /></div>
            <div className="lb-stage" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
                <div ref={wrap} className="lb-img"><Pics key={selectedPhoto.id} photo={selectedPhoto} onRatio={onRatio} /></div>
            </div>

            <div className="lb-top">
                <button className="round" onClick={requestClose} aria-label="Close"><Icon d="M6 6l12 12M18 6L6 18" /></button>
                <span className="lb-count" aria-live="polite">{idx + 1} / {photos.length}</span>
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
