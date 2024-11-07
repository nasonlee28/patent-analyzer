import React from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";

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
      return (
        <ul>
          {claims.map((claim, index) => (
            <li key={index}>{claim}</li>
          ))}
        </ul>
      );
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
      return (
        <ul>
          {features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      );
    }
  })
];

const AnalysisDetails = ({ result }) => {
  const tableInstance = useReactTable({
    columns,
    data: result?.top_infringing_products || [],
    getCoreRowModel: getCoreRowModel()
  });
  const details = [
    { label: "Analysis ID", value: result.analysis_id },
    { label: "Patent ID", value: result.patent_id },
    { label: "Company Name", value: result.company_name },
    { label: "Analysis Date", value: result.analysis_date },
    { label: "Overall Risk Assessment", value: result.overall_risk_assessment }
  ];

  return (
    <>
      <div>
        {details.map((detail, index) => (
          <div key={index} className="item-container">
            <h2>{detail.label}:</h2>
            <p className="item-value">{detail.value}</p>
          </div>
        ))}
      </div>
      <h2>Top Infringing Products:</h2>
      <table style={{ width: "80%", margin: "auto" }}>
        <thead>
          {tableInstance.getHeaderGroups().map(headerGroup => {
            return (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
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
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default AnalysisDetails;
