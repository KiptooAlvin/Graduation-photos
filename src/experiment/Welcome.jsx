import Screen from "./Screen";

function Welcome({ onBegin }) {
  return (
    <Screen>

      <div className="experiment-icon">
        ⚠️
      </div>

      <h1 className="experiment-title">
        Interesting...
      </h1>

      <p className="experiment-text">
        You clicked it.
      </p>

      <p className="experiment-text">
        Most people would have ignored it.
      </p>

      <p className="experiment-text">
        Let's find out what that says about you.
      </p>

      <button
        className="experiment-primary-btn"
        onClick={onBegin}
      >
        Begin
      </button>

    </Screen>
  );
}

export default Welcome;