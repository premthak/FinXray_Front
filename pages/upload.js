import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first.");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("https://finxray-backend.onrender.com/api/analyze", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      setResult(data.analysis);
    } catch (err) {
      alert("Error analyzing the document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-blue-600">📄 Upload Startup Document</h2>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4"
        />
        <button
          onClick={handleUpload}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {result && (
          <div className="mt-8 space-y-2 text-sm text-gray-800">
            <h3 className="text-xl font-semibold text-green-700 mb-2">✅ Startup Analysis:</h3>
            <p><strong>Revenue:</strong> ₹{result.revenue}</p>
            <p><strong>Expenses:</strong> ₹{result.expenses}</p>
            <p><strong>Profit:</strong> ₹{result.profit}</p>
            <p><strong>Valuation:</strong> ₹{result.valuation}</p>
            <p><strong>AI KPI Score:</strong> {result.ai_kpi_score}</p>
            <p><strong>Financial KPI Score:</strong> {result.financial_kpi_score}</p>
            <p><strong>Red Flags:</strong> {result.red_flags.length ? result.red_flags.join(", ") : "None"}</p>

            <div className="mt-4 p-4 bg-yellow-100 rounded">
              <h4 className="font-semibold text-yellow-800">📊 Market Comparison:</h4>
              {result.market_comparison &&
                Object.entries(result.market_comparison).map(([key, value]) => (
                  <p key={key}><strong>{key}:</strong> {value}</p>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
