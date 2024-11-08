import { OpenAI } from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { Patent, Company, Product, AnalysisResult, AnalysisResultSchema } from "./types";
import { NotFoundError } from "./error/NotfoundError";

export class PatentAnalyzer {
  private static instance: PatentAnalyzer;
  private openai: OpenAI;
  private patents: Patent[];
  private companies: Company[];
  private reports: { [key in AnalysisResult["analysis_id"]]: AnalysisResult } = {};
  private idCounter = 1;

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

  saveReport(report: AnalysisResult): void {
    this.reports[report.analysis_id] = report;
  }

  getReport(analysisId: string): AnalysisResult {
    const report = this.reports[analysisId];
    if (!report) {
      throw new NotFoundError("Report not found");
    }
    return report;
  }

  getReports(): AnalysisResult[] {
    return Object.values(this.reports);
  }

  async analyzeInfringement(patentId: string, companyName: string): Promise<AnalysisResult> {
    const [patent, company] = this.findPatentAndCompany(patentId, companyName);

    const productAnalyses = await this.analyzeProducts(patent, company.products);
    productAnalyses.analysis_date = new Date().toLocaleDateString();
    productAnalyses.company_name = company.name;
    productAnalyses.patent_id = patent.publication_number;
    productAnalyses.analysis_id = `analysis-${this.idCounter++}`;

    return productAnalyses;
  }

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

  private findPatentAndCompany(patentId: string, companyName: string): [Patent, Company] {
    const patent =
      this.patents.find(p => p.publication_number === patentId) ||
      this.patents.find(p => this.fuzzyMatch(p.publication_number, patentId));
    if (!patent) {
      throw new NotFoundError("Patent not found");
    }
    const company =
      this.companies.find(c => c.name.toLowerCase() === companyName.toLowerCase()) ||
      this.companies.find(c => this.fuzzyMatch(c.name, companyName));
    if (!company) {
      throw new NotFoundError("Company not found");
    }

    return [patent, company];
  }

  private fuzzyMatch(target: string, input: string): boolean {
    const lowerInput = input.toLowerCase();
    return target.toLowerCase().includes(lowerInput);
  }
}
