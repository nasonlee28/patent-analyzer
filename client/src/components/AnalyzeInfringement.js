import React, { useState } from "react";
import axios from "axios";

import AnalyzerDetails from "./AnalyzerDetails";

axios.defaults.baseURL = "http://localhost:8080";

const AnalyzeInfringement = () => {
  const [patentId, setPatentId] = useState("US-RE49889-E1");
  const [companyName, setCompanyName] = useState("Walmart Inc.");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const response = await axios.post("api/v1/analyze-infringement", {
        patentId,
        companyName
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Mini Patent Infringement Check App</h1>
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <span>Patent ID: </span>
          <input
            type="text"
            placeholder="Patent ID"
            value={patentId}
            onChange={e => setPatentId(e.target.value)}
            required
          />
          <button onClick={() => setPatentId("")}>Clear</button>
        </div>
        <div className="input-container">
          <span>Company Name: </span>
          <input
            type="text"
            placeholder="Company Name"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            required
          />
          <button onClick={() => setCompanyName("")}>Clear</button>
        </div>
        <div className="submit-button">
          {loading ? <button disabled>Loading...</button> : <button type="submit">Analyze</button>}
        </div>
      </form>
      {result && <AnalyzerDetails result={result} />}
      {error && <div className="error-message">Error: {error}</div>}
    </div>
  );
};

export default AnalyzeInfringement;
