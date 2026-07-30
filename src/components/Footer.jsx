import "../styles/footer.css";

function Footer() {

    return (

        <footer className="footer">

            <h3>Weekend Event Gallery</h3>

            <p>

                Thank you for being part of our event.

            </p>

            <p>

                All photographs are available for personal download.

            </p>

            <p>

                © 2026 Graduation Event Gallery. All rights reserved. 
              </p>  
              <p>
                <a href="https://www.instagram.com/albat_hana_stain/" target="_blank" rel="noreferrer" style={{color:'#e1306c',textDecoration:'none',fontWeight:600,display:'inline-block',transition:'all .3s'}} onMouseOver={e=>{e.target.style.color='#b01e51';e.target.style.transform='translateY(-1px)'}} onMouseOut={e=>{e.target.style.color='#e1306c';e.target.style.transform='none'}}> Alvin Kiptoo</a>
            </p>

             

        </footer>

    );

}

export default Footer;