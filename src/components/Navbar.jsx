import { useEffect, useState } from "react";
import photos from "../data/photos";

function Navbar() {
    const [solid, setSolid] = useState(false);

    useEffect(() => {
        const onScroll = () => setSolid(window.scrollY > 40);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <nav className={"navbar" + (solid ? " solid" : "")}>
            <a href="#home" className="logo"><i />Graduation Gallery</a>
            <span className="count">{photos.length} photos</span>
        </nav>
    );
}

export default Navbar;
