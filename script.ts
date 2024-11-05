import dotenv from "dotenv";

import { loadCompanies, loadPatents } from "./src/data-loader";
import { PatentAnalyzer } from "./src/patent-analyzer";

dotenv.config();
// script.ts
async function script() {
  const patents = loadPatents();
  const companies = loadCompanies();

  const analyzer = PatentAnalyzer.getInstance(process.env.OPENAI_API_KEY!, patents, companies);

  try {
    // const test = await analyzer.test();
    // console.log(JSON.stringify(test, null, 2));
    // const analysis = await analyzer.analyzeInfringement(1, "John Deere");
    const analysis = await analyzer.analyzeInfringement("US-RE49889-E1", "Walmart Inc.");
    console.log(JSON.stringify(analysis, null, 2));
  } catch (error) {
    console.error("Analysis failed:", error);
  }
}

script();
