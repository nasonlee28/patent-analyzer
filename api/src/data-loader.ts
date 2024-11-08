import fs from "fs";
import { Patent, Company } from "./types";

type PatentRawData = Patent & {
  claims: string;
};

export function loadPatents(): Patent[] {
  const data = fs.readFileSync("src/data/patents.json", "utf8");
  const patents: PatentRawData[] = JSON.parse(data);
  return patents.map(patent => ({
    ...patent,
    claims: JSON.parse(patent.claims)
  }));
}

export function loadCompanies(): Company[] {
  const data = fs.readFileSync("src/data/company_products.json", "utf8");
  return JSON.parse(data).companies;
}
