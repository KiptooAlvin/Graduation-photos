import { useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Gallery from "../components/Gallery";
import Lightbox from "../components/Lightbox";
import ScrollTop from "../components/ScrollTop";
import Footer from "../components/Footer";

function Home() {
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    return (
        <>
            <Navbar />
            <Hero />
            <Gallery setSelectedPhoto={setSelectedPhoto} />
            <Footer />
            <ScrollTop />
            <Lightbox selectedPhoto={selectedPhoto} setSelectedPhoto={setSelectedPhoto} />
        </>
    );
}

export default Home;
