import { z } from "zod";

export type Patent = {
  id: number;
  publication_number: string;
  title: string;
  claims: Claim[];
  abstract: string;
};

export type Claim = {
  num: string;
  text: string;
};

export type Company = {
  name: string;
  products: Product[];
};

export type Product = {
  name: string;
  description: string;
  features: string[];
};

export const AnalysisResultSchema = z.object({
  analysis_id: z.string(),
  patent_id: z.string(),
  company_name: z.string(),
  analysis_date: z.string(),
  top_infringing_products: z.array(
    z.object({
      product_name: z.string(),
      match_score: z.number(),
      infringement_likelihood: z.string(),
      relevant_claims: z.array(z.string()),
      explanation: z.string(),
      specific_features: z.array(z.string())
    })
  ),
  overall_risk_assessment: z.string()
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
