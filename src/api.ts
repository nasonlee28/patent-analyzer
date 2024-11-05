import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";

import { PatentAnalyzer } from "./patent-analyzer";
import { loadPatents, loadCompanies } from "./data-loader";

dotenv.config();

const app = express();
app.use(express.json());

const patents = loadPatents();
const companies = loadCompanies();
const analyzer = PatentAnalyzer.getInstance(process.env.OPENAI_API_KEY!, patents, companies);

app.post(
  "/api/v1/analyze-infringement",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { patentId, companyName } = req.body;

      if (!patentId || !companyName) {
        res.status(400).json({
          error: "Missing required parameters"
        });
        return;
      }

      const analysis = await analyzer.analyzeInfringement(patentId, companyName);
      res.json(analysis);
    } catch (error) {
      next(error);
    }
  }
);

export default app;
