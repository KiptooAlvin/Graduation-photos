import { useState, useEffect } from "react";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Gallery from "../components/Gallery";
import Lightbox from "../components/Lightbox";
import ScrollTop from "../components/ScrollTop";
import Footer from "../components/Footer";
import Loader from "../components/Loader";


import CuriosityPill from "../components/experiment/CuriosityPill";
import Experiment from "../components/experiment/Experiment";


function Home() {
    const [experimentOpen, setExperimentOpen] = useState(false);

    const [selectedPhoto, setSelectedPhoto] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const timer = setTimeout(() => {

            setLoading(false);

        },1000);

        return ()=>clearTimeout(timer);

    },[]);

    if(loading){

        return <Loader/>;

    }

    return(

        <>

            <Navbar/>

            <Hero/>

            <Gallery
                setSelectedPhoto={setSelectedPhoto}
            />

            <Lightbox
                selectedPhoto={selectedPhoto}
                setSelectedPhoto={setSelectedPhoto}
            />
            <ScrollTop/>
            <CuriosityPill
                onClick={() => setExperimentOpen(true)}
            />

            <Experiment
                isOpen={experimentOpen}
                onClose={() => setExperimentOpen(false)}
            />


            <Footer/>

        </>

    );

}

export default Home;