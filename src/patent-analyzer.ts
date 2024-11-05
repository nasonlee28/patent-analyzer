import { OpenAI } from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { Patent, Company, Product, AnalysisResult, AnalysisResultSchema } from "./types";

export class PatentAnalyzer {
  private static instance: PatentAnalyzer;
  private openai: OpenAI;
  private patents: Patent[];
  private companies: Company[];

  private constructor(apiKey: string, patents: Patent[], companies: Company[]) {
    this.openai = new OpenAI({ apiKey });
    this.patents = patents;
    this.companies = companies;
  }

  public static getInstance(
    apiKey: string,
    patents: Patent[],
    companies: Company[]
  ): PatentAnalyzer {
    if (!PatentAnalyzer.instance) {
      PatentAnalyzer.instance = new PatentAnalyzer(apiKey, patents, companies);
    }
    return PatentAnalyzer.instance;
  }

  //   async analyzeInfringement(patentId: number, companyName: string): Promise<InfringementAnalysis> {
  async analyzeInfringement(patentId: string, companyName: string): Promise<AnalysisResult> {
    const patent = this.patents.find(p => p.publication_number === patentId);
    const company = this.companies.find(c => c.name.toLowerCase() === companyName.toLowerCase());
    if (!patent || !company) {
      throw new Error("Patent or company not found");
    }

    const productAnalyses = await this.analyzeProducts(patent, company.products);

    return productAnalyses;
  }

  async test() {
    const chatCompletion = await this.openai.chat.completions.create({
      messages: [{ role: "user", content: "Say this is a test" }],
      model: "gpt-4o-mini"
    });
    return chatCompletion;
  }

  //   private async analyzeProducts(patent: Patent, products: Product[]): Promise<ProductInfringement[]> {
  private async analyzeProducts(patent: Patent, products: Product[]): Promise<AnalysisResult> {
    const prompt = this.createAnalysisPrompt(patent, products);
    const stream = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a patent analysis expert. Analyze potential patent infringement 
                             objectively and thoroughly. Focus on technical similarities and specific claim elements.
                             Format your response as JSON.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      // response_format: { type: "json_object" },
      response_format: zodResponseFormat(AnalysisResultSchema, "analysis"),
      stream: true
    });

    let content = "";
    for await (const chunk of stream) {
      content += chunk.choices[0]?.delta?.content || "";
    }

    return this.parseAnalysisResponse(content);
  }

  private createAnalysisPrompt(patent: Patent, products: Product[]): string {
    return `
        Analyze if the products potentially infringes the patent:

        PATENT:
        Title: ${patent.title}
        Abstract: ${patent.abstract}
        
        Claims:
        ${patent.claims.map(claim => `Claim ${claim.num}: ${claim.text}`).join("\n")}

        PRODUCTS:
        ${products.map(p => `Name: ${p.name}\nDescription: ${p.description}`).join("\n")}

        Provide a detailed analysis in JSON format with:
        1. Overall match score (0-100)
        2. Analysis of each potentially infringed claim
        3. Specific matching features
        4. Detailed explanation of potential infringement
        5. Infringement likelihood (High, Medium, Low)
        6. Put top 2 products in "top_infringing_products"
        7. analysis_date as today's date

        Response format:
        {
            "analysis_id": string,
            "patent_id": string,
            "company_name": string,
            "analysis_date": string,
            "top_infringing_products": [{
                "product_name": string,
                "match_score": number,
                "infringement_likelihood": string,
                "relevant_claims": string[],
                "explanation": string,
                "specific_features": string[]
            }],
            "overall_risk_assessment": string
        }
        `;
  }

  private parseAnalysisResponse(content: string): AnalysisResult {
    if (!content) {
      throw new Error("Analysis response is null");
    }

    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error("Failed to parse analysis response");
    }
  }
}
