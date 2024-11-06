import React, { useState } from "react";
import axios from "axios";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";

axios.defaults.baseURL = "http://localhost:8080";

const columnHelper = createColumnHelper();

const columns = [
  columnHelper.accessor("product_name", {
    header: () => "Product Name",
    cell: info => info.getValue()
  }),
  columnHelper.accessor("match_score", {
    header: () => "Match Score",
    cell: info => info.getValue()
  }),
  columnHelper.accessor("infringement_likelihood", {
    header: () => "Infringement Likelihood",
    cell: info => info.getValue()
  }),
  columnHelper.accessor("relevant_claims", {
    header: () => "Relevant Claims",
    cell: info => {
      const claims = info.getValue();
      return claims.map((claim, index) => <li key={index}>{claim}</li>);
    }
  }),
  columnHelper.accessor("explanation", {
    header: () => "Explanation",
    cell: info => info.getValue()
  }),
  columnHelper.accessor("specific_features", {
    header: () => "Specific Features",
    cell: info => {
      const features = info.getValue();
      return features.map((feature, index) => <li key={index}>{feature}</li>);
    }
  })
];

const AnalyzeInfringement = () => {
  const [patentId, setPatentId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setResult(null);

    try {
      const response = await axios.post("api/v1/analyze-infringement", {
        patentId,
        companyName
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
    }
  };
  console.log("x result: ", result);
  const tableInstance = useReactTable({
    columns,
    data: result?.top_infringing_products || [],
    getCoreRowModel: getCoreRowModel()
  });
  //   console.log("x tableInstance: ", tableInstance?.getHeaderGroups?.());
  return (
    <div>
      <h1>Analyze Infringement</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Patent ID"
          value={patentId}
          onChange={e => setPatentId(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Company Name"
          value={companyName}
          onChange={e => setCompanyName(e.target.value)}
          required
        />
        <button type="submit">Analyze</button>
      </form>
      {result && (
        <div>
          <h2>Result:</h2>
          <table style={{ width: "80%", margin: "auto" }}>
            <thead>
              {tableInstance.getHeaderGroups().map(headerGroup => {
                return (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        // colSpan={header.colSpan}
                        // style={{ border: "1px solid black" }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                );
              })}
            </thead>
            <tbody>
              {tableInstance.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => {
                    return (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <h3>Overall Risk Assessment: {result.overall_risk_assessment}</h3>
        </div>
      )}
      {error && <div style={{ color: "red" }}>Error: {error}</div>}
    </div>
  );
};

export default AnalyzeInfringement;
