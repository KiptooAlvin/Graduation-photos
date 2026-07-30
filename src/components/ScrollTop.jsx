import { useEffect, useState } from "react";

function ScrollTop(){

    const [visible,setVisible]=useState(false);

    useEffect(()=>{

        const handleScroll=()=>{

            setVisible(window.scrollY>300);

        };

        window.addEventListener("scroll",handleScroll);

        return()=>window.removeEventListener("scroll",handleScroll);

    },[]);

    return(

        visible &&

        <button

            className="scroll-top"

            onClick={()=>window.scrollTo({

                top:0,

                behavior:"smooth"

            })}

        >

            ↑

        </button>

    );

}

export default ScrollTop;