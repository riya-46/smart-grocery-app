import { useNavigate } from "react-router-dom";

function AIHealthyFood() {
  const navigate = useNavigate();

  return (
    <main className="ai-page">
      <section className="ai-page-card">
        <button
          type="button"
          className="ai-page-back"
          onClick={() => navigate("/home")}
        >
          Back to Dashboard
        </button>

        <span className="ai-page-kicker">AI Nutrition Companion</span>
        <h1>AI suggested healthy food items and recipes soon.</h1>
        <p>
          This section is reserved for future AI-powered recommendations,
          healthier alternatives, and recipe guidance based on grocery choices.
        </p>

        <div className="ai-page-grid">
          <article className="ai-page-panel">
            <h2>Planned Features</h2>
            <ul>
              <li>Healthier substitutes for selected grocery items</li>
              <li>Mode-wise meal and recipe suggestions</li>
              <li>Budget-friendly nutrition recommendations</li>
            </ul>
          </article>

          <article className="ai-page-panel">
            <h2>Current Status</h2>
            <p>
              UI route is ready. Backend and prompt-driven recommendation logic
              can be connected next without changing the dashboard flow.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}

export default AIHealthyFood;
