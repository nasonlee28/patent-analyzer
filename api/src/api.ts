import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";

import { PatentAnalyzer } from "./patent-analyzer";
import { loadPatents, loadCompanies } from "./data-loader";

const { check } = require("express-validator");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const patents = loadPatents();
const companies = loadCompanies();
const analyzer = PatentAnalyzer.getInstance(process.env.OPENAI_API_KEY!, patents, companies);

app.post(
  "/api/v1/analyze-infringement",
  [
    check("patentId").notEmpty().withMessage("Patent ID is required"), // Add validation for patentId
    check("companyName").notEmpty().withMessage("Company name is required") // Add validation for companyName
  ],
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

export default app;
