import React, { useState } from "react";
import axios from "axios";

import AnalyzerDetails from "./AnalyzerDetails";

axios.defaults.baseURL = "http://localhost:8080";

const AnalyzeInfringement = () => {
  const [patentId, setPatentId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setReports([]);
    setAnalyzing(true);

    try {
      const response = await axios.post("api/v1/analyze-infringement", {
        patentId,
        companyName
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveReport = async () => {
    setError(null);
    setSaving(true);
    try {
      await axios.post("api/v1/save-report", {
        report: result
      });

      alert("Report saved successfully");
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleShowReports = async () => {
    setError(null);
    setLoadingReports(true);

    try {
      const response = await axios.get("api/v1/reports");
      setReports(response.data);
      setResult(null);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoadingReports(false);
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
          <button type="button" onClick={() => setPatentId("")}>
            Clear
          </button>
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
          <button type="button" onClick={() => setCompanyName("")}>
            Clear
          </button>
        </div>
        <div className="submit-button">
          {analyzing ? (
            <button disabled>Analyzing...</button>
          ) : (
            <button type="submit">Analyze</button>
          )}
        </div>
        <div className="submit-button">
          {loadingReports ? (
            <button disabled>Loading...</button>
          ) : (
            <button type="button" onClick={handleShowReports}>
              Show Reports
            </button>
          )}
        </div>
        <div className="submit-button">
          {result &&
            (saving ? (
              <button disabled>Saving...</button>
            ) : (
              <button type="button" onClick={handleSaveReport}>
                Save Report
              </button>
            ))}
        </div>
      </form>
      {result && <AnalyzerDetails result={result} />}
      {!result && reports.length > 0 && (
        <div>
          <h2>Saved Reports: {reports.length}</h2>
          {reports.map((report, index) => (
            <div key={index}>
              <AnalyzerDetails result={report} />
              <hr />
            </div>
          ))}
        </div>
      )}
      {error && <div className="error-message">Error: {error}</div>}
    </div>
  );
};

export default AnalyzeInfringement;
