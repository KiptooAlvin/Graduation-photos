import { useEffect } from "react";
import "../../styles/experiment.css";
import Welcome from "./Welcome";

function Experiment({ isOpen, onClose }) {

    // Close with ESC
    useEffect(() => {

        if (!isOpen) return;

        const handleKeyDown = (e) => {

            if (e.key === "Escape") {
                onClose();
            }

        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {

            window.removeEventListener("keydown", handleKeyDown);

        };

    }, [isOpen, onClose]);

    // Lock page scroll
    useEffect(() => {

        if (isOpen) {

            document.body.style.overflow = "hidden";

        } else {

            document.body.style.overflow = "";

        }

        return () => {

            document.body.style.overflow = "";

        };

    }, [isOpen]);

    if (!isOpen) return null;

    return (

        <div
            className="experiment-overlay"
            onClick={onClose}
        >

            <div
                onClick={(e) => e.stopPropagation()}
            >

                <button
                    className="experiment-close"
                    onClick={onClose}
                >
                    ✕
                </button>

                <Welcome
                    onBegin={() => {

                        alert("Sprint 2 begins in the next phase 😊");

                    }}
                />

            </div>

        </div>

    );

}

export default Experiment;