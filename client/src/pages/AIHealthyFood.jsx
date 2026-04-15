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
        <h1>Smart AI Healthy Food Suggestions</h1>
        <p>
          This module is reserved for AI-powered recommendations, healthier
          alternatives, recipe ideas, and nutrition-aware grocery guidance.
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
