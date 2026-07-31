import "../../styles/experiment.css";

function Screen({ children }) {
  return (
    <div className="experiment-screen">
      <div className="experiment-card">
        {children}
      </div>
    </div>
  );
}

export default Screen;