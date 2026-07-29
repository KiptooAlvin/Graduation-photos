import { useState } from "react";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Gallery from "../components/Gallery";
import Lightbox from "../components/Lightbox";
import Footer from "../components/Footer";

function Home() {

    const [selectedPhoto, setSelectedPhoto] = useState(null);

    return (
        <>
            <Navbar />

            <Hero />

            <Gallery
                selectedPhoto={selectedPhoto}
                setSelectedPhoto={setSelectedPhoto}
            />

            <Lightbox
                selectedPhoto={selectedPhoto}
                setSelectedPhoto={setSelectedPhoto}
            />
        </>
    );
}

export default Home;
