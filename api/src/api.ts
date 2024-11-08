import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import { body } from "express-validator";

import { PatentAnalyzer } from "./patent-analyzer";
import { loadPatents, loadCompanies } from "./data-loader";
import { AnalysisResultSchema } from "./types";
import { validateRequest } from "./error/exceptions";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const patents = loadPatents();
const companies = loadCompanies();
const analyzer = PatentAnalyzer.getInstance(process.env.OPENAI_API_KEY!, patents, companies);

app.post(
  "/api/v1/analyze-infringement",
  body("patentId").notEmpty().withMessage("Patent ID is required"),
  body("companyName").notEmpty().withMessage("Company name is required"),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { patentId, companyName } = req.body;

      const analysis = await analyzer.analyzeInfringement(patentId, companyName);
      res.json(analysis);
    } catch (error) {
      next(error);
    }
  }
);

app.get("/api/v1/reports/:analysisId", (req: Request, res: Response, next: NextFunction) => {
  const analysisId = req.params.analysisId;
  const report = analyzer.getReport(analysisId);
  res.json(report);
});

app.get("/api/v1/reports", (req: Request, res: Response) => {
  const reports = analyzer.getReports();
  res.json(reports);
});

app.post(
  "/api/v1/save-report",
  body("report", "Report is required").notEmpty(),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    const { report } = req.body;

    const parsedReport = AnalysisResultSchema.safeParse(report);
    if (!parsedReport.success) {
      res.status(400).json({
        message: "Report does not match the AnalysisResult format",
        errors: parsedReport.error.errors
      });
      return;
    }

    analyzer.saveReport(report);

    res.status(201).json({ message: "Report saved successfully", report });
  }
);

export default app;
