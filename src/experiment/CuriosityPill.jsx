import "../../styles/experiment.css";

function CuriosityPill({ onClick }) {

    return (

        <button

            className="curiosity-pill"

            onClick={onClick}

            aria-label="Open Curiosity Experiment"

        >

            <div className="pill-title">

                ⚠️ Still curious?

            </div>

            <div className="pill-subtitle">

                Takes less than a minute

            </div>

        </button>

    );

}

export default CuriosityPill;