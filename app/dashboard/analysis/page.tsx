'use client';

import { useState } from 'react';

const INITIAL_INPUTS = {
  companyName: '',
  industry: '',
  stage: '',
  description: '',
  revenueModel: '',
  traction: '',
  teamBackground: '',
  funding: '',
  risks: '',
};

function normalize(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function shorten(text, maxChars) {
  const t = normalize(text);
  if (!t) return '';
  if (t.length <= maxChars) return t;
  return t.slice(0, maxChars - 3).trim() + '...';
}

function splitBullets(text) {
  const raw = (text || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (raw.length >= 2) return raw;

  const one = normalize(text);
  return one ? [one] : [];
}

function looksLikeNoTraction(text) {
  const t = (text || '').toLowerCase();
  return t.includes('none') || t.includes('no traction') || t.includes('not yet');
}

function marketSizeFor(industry, description) {
  const hay = `${industry} ${description}`.toLowerCase();

  const largeHints = [
    'consumer',
    'grocery',
    'ecommerce',
    'retail',
    'logistics',
    'delivery',
    'payments',
    'fintech',
    'health',
    'education',
    'marketplace',
  ];

  const smallHints = ['niche', 'specialty', 'industrial', 'deep tech', 'deeptech'];

  if (largeHints.some((k) => hay.includes(k))) {
    return { size: 'Large', reason: `Broad demand potential in ${industry}.` };
  }

  if (smallHints.some((k) => hay.includes(k))) {
    return { size: 'Small', reason: `Likely a narrower, specialized segment within ${industry}.` };
  }

  return { size: 'Medium', reason: `Depends heavily on the specific target segment within ${industry}.` };
}

function nextStepsFor(stage) {
  const s = (stage || '').toLowerCase();

  if (s === 'idea') {
    return [
      'Do 20-30 customer interviews to validate the problem and willingness to pay.',
      'Build a narrow MVP and run a small pilot with a single target segment.',
      'Define the first measurable traction goal (e.g., weekly active users, retention, or revenue).',
    ];
  }

  if (s === 'pre-seed' || s === 'preseed' || s === 'pre seed') {
    return [
      'Convert interest into a repeatable pilot (a clear ICP + a simple sales / onboarding flow).',
      'Track a small set of core metrics (retention, conversion, gross margin) weekly.',
      'Clarify differentiation: why you win versus alternatives and how you defend it over time.',
    ];
  }

  if (s === 'seed') {
    return [
      'Prove unit economics (CAC, LTV, gross margin) and show improvement over time.',
      'Focus on one geography or one core segment to build density and repeatability.',
      'Turn early traction into a repeatable go-to-market motion (channel, messaging, funnel).',
    ];
  }

  if (s === 'series a' || s === 'seriesa' || s === 'a') {
    return [
      'Show scalable growth with strong retention and predictable acquisition channels.',
      'Tighten gross margin and operating leverage to support scale.',
      'Strengthen the moat (distribution, data, switching costs, or partnerships).',
    ];
  }

  return [
    'Validate the core customer and problem with real usage.',
    'Clarify unit economics and the path to profitability.',
    'Sharpen differentiation and competitive positioning.',
  ];
}

function verdictFor(stage, traction, risksBullets) {
  const s = (stage || '').toLowerCase();
  const t = (traction || '').toLowerCase();
  const hasNumber = /\d/.test(t);
  const none = looksLikeNoTraction(t);

  const strongSignalWords = ['arr', 'mrr', 'retention', 'ndr', 'renewal', 'profitable', 'profit', 'cashflow'];
  const seemsStrong = hasNumber && strongSignalWords.some((w) => t.includes(w));

  const mentionsHeavyCompetition = risksBullets.some((r) => r.toLowerCase().includes('competition'));

  if (s === 'idea') {
    return { label: 'Watch', reason: 'Very early stage. Validate customer demand and willingness to pay.' };
  }

  if (s === 'pre-seed' || s === 'preseed' || s === 'pre seed') {
    return {
      label: 'Watch',
      reason: hasNumber ? 'Some early traction is visible, but needs clearer focus and economics.' : 'Needs early traction and sharper positioning.',
    };
  }

  if (s === 'seed') {
    if (seemsStrong && !mentionsHeavyCompetition) {
      return { label: 'Invest', reason: 'Strong traction signals with a clear model; remaining risks look addressable.' };
    }
    if (none) {
      return { label: 'Avoid', reason: 'Seed stage without clear traction is higher risk and hard to underwrite.' };
    }
    return { label: 'Watch', reason: 'Promising signals, but unit economics and differentiation need proof.' };
  }

  if (s === 'series a' || s === 'seriesa' || s === 'a') {
    if (seemsStrong) {
      return { label: 'Invest', reason: 'Strong traction/metrics language; focus on durable economics and defensibility.' };
    }
    if (none) {
      return { label: 'Avoid', reason: 'Series A expectations usually require strong metrics and repeatable growth.' };
    }
    return { label: 'Watch', reason: 'Some traction is visible, but needs stronger proof of scalable growth and margins.' };
  }

  return { label: 'Watch', reason: 'Good starting information, but more evidence is needed to underwrite the business.' };
}

function generateReport(inputs) {
  const companyName = normalize(inputs.companyName);
  const industry = normalize(inputs.industry);
  const stage = normalize(inputs.stage);
  const description = normalize(inputs.description);
  const revenueModel = normalize(inputs.revenueModel);
  const traction = normalize(inputs.traction);
  const teamBackground = normalize(inputs.teamBackground);
  const funding = normalize(inputs.funding);
  const risksText = inputs.risks || '';

  const snapshot =
    `${companyName} is a ${stage.toLowerCase()} startup in ${industry}. ` +
    `${description}${funding ? ` (Funding/runway: ${funding})` : ''}`;

  const strengthsCandidates = [
    `Clear articulation of what the company does: ${shorten(description, 140)}`,
    `Revenue model is defined: ${shorten(revenueModel, 140)}`,
    looksLikeNoTraction(traction) ? '' : `Traction signals demand: ${shorten(traction, 140)}`,
    `Team background is relevant: ${shorten(teamBackground, 140)}`,
  ].filter(Boolean);

  const strengths = strengthsCandidates.slice(0, 4);
  while (strengths.length < 2) strengths.push('Founder inputs are clear and specific.');

  const risksFromFounder = splitBullets(risksText);
  const risks = [...risksFromFounder];

  if (risks.length < 2) {
    risks.push('Key assumptions (demand, pricing, and repeat usage) are not yet fully validated.');
  }
  if (risks.length < 3) {
    risks.push('Differentiation versus alternatives should be made explicit and measurable.');
  }
  const risksOut = risks.slice(0, 4);

  const market = marketSizeFor(industry, description);

  const competitors = 'Not provided. (Add known players later for clearer positioning.)';

  const viability = looksLikeNoTraction(traction)
    ? `The revenue model is: ${revenueModel}. It is plausible, but without traction it is still unproven (pricing, margins, and willingness to pay).`
    : `The revenue model is: ${revenueModel}. Traction suggests demand, but viability depends on margins, customer acquisition costs, and repeat usage.`;

  const nextSteps = nextStepsFor(stage);

  const verdict = verdictFor(stage, traction, risksOut);

  return {
    snapshot,
    strengths,
    risks: risksOut,
    market,
    competitors,
    viability,
    nextSteps,
    verdict,
  };
}

export default function AnalyzePage() {
  const [inputs, setInputs] = useState(INITIAL_INPUTS);
  const [report, setReport] = useState(null);

  function onChange(e) {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  }

  function onSubmit(e) {
    e.preventDefault();
    const nextReport = generateReport(inputs);
    setReport(nextReport);

    setTimeout(() => {
      const el = document.getElementById('finxray-report');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  return (
    <main className="finxray-page">
      <div className="finxray-shell">
        <header className="finxray-header">
          <div className="finxray-brand">
            <h1 className="finxray-title">FinXray</h1>
            <span className="finxray-pill">Analyze</span>
          </div>
          <p className="finxray-tagline">
            One-page startup analysis from founder inputs. (Templated output for v1 - no AI yet.)
          </p>
        </header>

        <div className="finxray-grid">
          <section className="finxray-card finxray-col">
            <h2 className="finxray-h2">Founder Inputs</h2>

            <form onSubmit={onSubmit} className="finxray-form">
              <div className="finxray-field">
                <label className="finxray-label" htmlFor="companyName">Company name</label>
                <input
                  id="companyName"
                  name="companyName"
                  value={inputs.companyName}
                  onChange={onChange}
                  required
                  className="finxray-input"
                  type="text"
                />
              </div>

              <div className="finxray-row">
                <div className="finxray-field">
                  <label className="finxray-label" htmlFor="industry">Industry / sector</label>
                  <input
                    id="industry"
                    name="industry"
                    value={inputs.industry}
                    onChange={onChange}
                    required
                    className="finxray-input"
                    type="text"
                  />
                </div>

                <div className="finxray-field">
                  <label className="finxray-label" htmlFor="stage">Stage</label>
                  <select
                    id="stage"
                    name="stage"
                    value={inputs.stage}
                    onChange={onChange}
                    required
                    className="finxray-input"
                  >
                    <option value="">Select stage</option>
                    <option value="Idea">Idea</option>
                    <option value="Pre-seed">Pre-seed</option>
                    <option value="Seed">Seed</option>
                    <option value="Series A">Series A</option>
                  </select>
                </div>
              </div>

              <div className="finxray-field">
                <label className="finxray-label" htmlFor="description">What does the company do? (short description)</label>
                <textarea
                  id="description"
                  name="description"
                  value={inputs.description}
                  onChange={onChange}
                  required
                  className="finxray-textarea"
                />
              </div>

              <div className="finxray-field">
                <label className="finxray-label" htmlFor="revenueModel">Revenue model (how it plans to make money)</label>
                <textarea
                  id="revenueModel"
                  name="revenueModel"
                  value={inputs.revenueModel}
                  onChange={onChange}
                  required
                  className="finxray-textarea"
                />
              </div>

              <div className="finxray-field">
                <label className="finxray-label" htmlFor="traction">Traction (users, revenue, growth, or &quot;none yet&quot;)</label>
                <textarea
                  id="traction"
                  name="traction"
                  value={inputs.traction}
                  onChange={onChange}
                  required
                  className="finxray-textarea"
                />
              </div>

              <div className="finxray-field">
                <label className="finxray-label" htmlFor="teamBackground">Team background (founders&apos; experience)</label>
                <textarea
                  id="teamBackground"
                  name="teamBackground"
                  value={inputs.teamBackground}
                  onChange={onChange}
                  required
                  className="finxray-textarea"
                />
              </div>

              <div className="finxray-field">
                <label className="finxray-label" htmlFor="funding">Funding asked or current runway (optional)</label>
                <textarea
                  id="funding"
                  name="funding"
                  value={inputs.funding}
                  onChange={onChange}
                  className="finxray-textarea"
                />
              </div>

              <div className="finxray-field">
                <label className="finxray-label" htmlFor="risks">Key risks or challenges (founder-stated)</label>
                <textarea
                  id="risks"
                  name="risks"
                  value={inputs.risks}
                  onChange={onChange}
                  required
                  className="finxray-textarea"
                />
                <div className="finxray-help">
                  Tip: Put each risk on a new line to get clean bullet points.
                </div>
              </div>

              <button type="submit" className="finxray-button">
                Generate FinXray Report
              </button>
            </form>
          </section>

          <section className="finxray-card finxray-col" id="finxray-report">
            <h2 className="finxray-h2">FinXray Report</h2>

            <div className="finxray-report">
              <h3 className="finxray-h3">1. Snapshot</h3>
              {report ? (
                <p className="finxray-p">{report.snapshot}</p>
              ) : (
                <p className="finxray-placeholder">Fill out the form to generate a snapshot.</p>
              )}

              <h3 className="finxray-h3">2. Strengths</h3>
              <ul className="finxray-ul">
                {report ? report.strengths.map((s, i) => <li key={i}>{s}</li>) : <li className="finxray-placeholder">Strengths will appear here.</li>}
              </ul>

              <h3 className="finxray-h3">3. Risks</h3>
              <ul className="finxray-ul">
                {report ? report.risks.map((r, i) => <li key={i}>{r}</li>) : <li className="finxray-placeholder">Risks will appear here.</li>}
              </ul>

              <h3 className="finxray-h3">4. Market &amp; Competition</h3>
              {report ? (
                <>
                  <p className="finxray-p"><span className="finxray-k">Market size:</span> {report.market.size} - {report.market.reason}</p>
                  <p className="finxray-p"><span className="finxray-k">Key competitors:</span> {report.competitors}</p>
                </>
              ) : (
                <p className="finxray-placeholder">Market size and competitors will appear here.</p>
              )}

              <h3 className="finxray-h3">5. Business Model Viability</h3>
              {report ? (
                <p className="finxray-p">{report.viability}</p>
              ) : (
                <p className="finxray-placeholder">Viability analysis will appear here.</p>
              )}

              <h3 className="finxray-h3">6. Suggested Next Steps</h3>
              <ul className="finxray-ul">
                {report ? report.nextSteps.map((n, i) => <li key={i}>{n}</li>) : <li className="finxray-placeholder">Next steps will appear here.</li>}
              </ul>

              <h3 className="finxray-h3">7. FinXray Verdict</h3>
              {report ? (
                <p className="finxray-p">
                  <span className="finxray-verdict">{report.verdict.label}</span> - {report.verdict.reason}
                </p>
              ) : (
                <p className="finxray-placeholder">Verdict will appear here.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .finxray-page {
          min-height: 100vh;
          padding: 40px 20px 64px;
          background: #f6f5f1;
          color: #171717;
          font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
        }

        .finxray-shell {
          max-width: 1200px;
          margin: 0 auto;
        }

        .finxray-header {
          background: #ffffff;
          border: 1px solid #e5e1d7;
          border-radius: 12px;
          padding: 18px 18px 16px;
          box-shadow: 0 10px 26px rgba(0,0,0,0.06);
        }

        .finxray-brand {
          display: flex;
          align-items: baseline;
          gap: 10px;
          flex-wrap: wrap;
        }

        .finxray-title {
          margin: 0;
          font-size: 30px;
          letter-spacing: 0.2px;
        }

        .finxray-pill {
          font-size: 12px;
          padding: 3px 10px;
          border-radius: 999px;
          background: #edf2ff;
          color: #1f3a5f;
          border: 1px solid #d7e3ff;
        }

        .finxray-tagline {
          margin: 8px 0 0;
          color: #5c5c5c;
          font-size: 14px;
          line-height: 1.4;
        }

        .finxray-grid {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          align-items: flex-start;
          margin-top: 18px;
        }

        .finxray-col {
          flex: 1 1 520px;
          min-width: 320px;
        }

        .finxray-card {
          background: #ffffff;
          border: 1px solid #e5e1d7;
          border-radius: 12px;
          padding: 18px;
          box-shadow: 0 10px 26px rgba(0,0,0,0.06);
        }

        .finxray-h2 {
          margin: 0 0 14px;
          font-size: 18px;
          letter-spacing: 0.2px;
        }

        .finxray-form { margin-top: 6px; }

        .finxray-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .finxray-field {
          margin-bottom: 12px;
          flex: 1 1 260px;
        }

        .finxray-label {
          display: block;
          font-size: 13px;
          color: #5c5c5c;
          margin-bottom: 6px;
        }

        .finxray-input,
        .finxray-textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e5e1d7;
          border-radius: 10px;
          font-size: 14px;
          color: #171717;
          background: #ffffff;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
        }

        .finxray-textarea {
          min-height: 90px;
          resize: vertical;
        }

        .finxray-help {
          margin-top: 6px;
          font-size: 12px;
          color: #6b6b6b;
        }

        .finxray-button {
          width: 100%;
          border: 0;
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 14px;
          cursor: pointer;
          background: #1f3a5f;
          color: #ffffff;
          box-shadow: 0 10px 18px rgba(31,58,95,0.16);
        }

        .finxray-report { margin-top: 6px; }

        .finxray-h3 {
          margin: 18px 0 6px;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1.1px;
          color: #1f3a5f;
        }

        .finxray-p {
          margin: 0 0 10px;
          line-height: 1.5;
          font-size: 14px;
        }

        .finxray-ul {
          margin: 0 0 10px 18px;
          padding: 0;
          line-height: 1.5;
          font-size: 14px;
        }

        .finxray-placeholder {
          color: #6b6b6b;
          font-style: italic;
          margin: 0 0 10px;
          line-height: 1.5;
          font-size: 14px;
        }

        .finxray-k {
          font-weight: 700;
        }

        .finxray-verdict {
          display: inline-block;
          padding: 2px 10px;
          border-radius: 999px;
          background: #f2f7ff;
          border: 1px solid #d7e3ff;
          color: #1f3a5f;
          font-weight: 700;
          margin-right: 6px;
        }
      `}</style>
    </main>
  );
}
