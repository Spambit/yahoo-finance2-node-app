import axios from "axios";
import { build, WorkSheet } from "node-xlsx";
import * as fs from "fs";
import path from "path";
import yahooFinance from "yahoo-finance2";
import { SearchQuoteYahooFund } from "yahoo-finance2/dist/esm/src/modules/search";

export interface Row {
  id: string; //fund code
  name: string;
  alpha?: number;
  beta?: number;
  sharp_ratio?: number;
  turnOver?: string;
  return_1y?: number;
  return_3y?: number;
  return_5y?: number;
  return_10y?: number;
  expense_ratio?: number;
  r_squared?: string;
  standard_deviation?: string;
  riskometer?: "high" | "medium" | "low";
  morningstar_rating?: number;
  no_of_stocks?: number;
  holdings?: { name: string, percentage: number}[];
}

class RowIml implements Row {
  id: string;
  name: string;
  alpha?: number;
  beta?: number;
  sharp_ratio?: number;
  turnOver?: string;
  return_1y?: number;
  return_3y?: number;
  return_5y?: number;
  return_10y?: number;
  expense_ratio?: number;
  r_squared?: string;
  standard_deviation?: string;
  riskometer: "high" | "medium" | "low";
  morningstar_risk_rating?: number;
  morningstar_overall_rating?: number;
  no_of_stocks?: number;
  holdings?: { name: string, percentage: number}[];
  constructor() {
    // Following order is important.
    // xls rows are created in this order.
    // Order of the Row interface declaration is not important.
    this.id = undefined;
    this.name = undefined;
    this.alpha = undefined;
    this.beta = undefined;
    this.sharp_ratio = undefined;
    this.turnOver = undefined;
    this.return_1y = undefined;
    this.return_3y = undefined;
    this.return_5y = undefined;
    this.return_10y = undefined;
    this.expense_ratio = undefined;
    this.r_squared = undefined;
    this.standard_deviation = undefined;
    this.riskometer = undefined;
    this.morningstar_risk_rating = undefined;
    this.morningstar_overall_rating = undefined;
    this.no_of_stocks = undefined;
    this.holdings = undefined;
  }
}

export class MutualFund {
  public static quote(fundSymbol: string) {
    return yahooFinance.quoteSummary(fundSymbol).then((results) => {
      if (!results) {
        throw new Error(
          `Failed to get data for one of the symbols: ${fundSymbol}`
        );
      }

      const quoteType = results?.quoteType;
      const riskStats = results?.fundPerformance?.riskOverviewStatistics!;
      const trailingReturn = results?.fundPerformance.trailingReturns;
      const defaultKeyStatistics = results?.defaultKeyStatistics;
      const stat = riskStats.riskStatistics[0];

      const code = fundSymbol;
      const alpha = stat.alpha;
      const beta = stat.beta;
      const sharp_ratio = stat.sharpeRatio;
      const r_squared = stat.rSquared;
      const name = quoteType.longName;
      const return_3y = trailingReturn.threeYear;
      const return_5y = trailingReturn.fiveYear;
      const return_10y = trailingReturn.tenYear;
      const return_1y = trailingReturn.oneYear;
      const morningstar_overall_rating = defaultKeyStatistics.morningStarOverallRating;
      const morningstar_risk_rating = defaultKeyStatistics.morningStarRiskRating;
      const holdings: { name: string, percentage: number}[] = results.topHoldings.holdings.map(holding => { 
          return { name :holding.holdingName, percentage: holding.holdingPercent }
        });
      const expense_ratio = results?.fundProfile.feesExpensesInvestment.netExpRatio;
      const no_of_stocks = results?.balanceSheetHistory.balanceSheetStatements.map(sheet => {
        return sheet.totalStockholderEquity;
      }).length || 0;
      
      return { id: code, 
        name, 
        alpha, 
        beta, 
        r_squared, 
        sharp_ratio ,
        return_10y,
        return_1y,
        return_3y,
        return_5y,
        morningstar_overall_rating,
        morningstar_risk_rating,
        holdings,
        expense_ratio,
        no_of_stocks
      };
    });
  }

  // search is not working well. A mutual fund that can be found in yahoofinance
  // website is not found here. TODO : will see this later
  // for now, just search the fund in yahoofinance anf get the code to /quote endpoint
  public static search(
    contains: string
  ): Promise<{ name: string; symbol: string }[] | { error?: string }> {
    return yahooFinance
      .search(contains, {}, { validateResult: true })
      .then((result) => {
        if (result) {
          const funds = result.quotes.filter(
            (quote) => quote.quoteType === "MUTUALFUND"
          );
          const ret = funds.map((fund) => {
            return { name: fund.longname || "", symbol: fund.symbol };
          });
          return ret;
        }
        return [];
      })
      .catch((e) => {
        return { error: `Fund with ${contains} not found.` };
      });
  }
}

export class Xls {
  static export() {
    const coumnNames = this.keysInOrder(new RowIml());

    const filePath = path.join(__dirname, "my-mf-sheet.xlsx");

    const worksheet: WorkSheet[] = [
      {
        name: "My fund worksheet",
        data: [coumnNames],
        options: {},
      },
    ];
    const buffer = build(worksheet, {
      writeOptions: { type: "buffer" },
    });
    fs.writeFileSync(filePath, buffer);
    return filePath;
  }

  /**
   * To create an array of object keys and maintain the order of keys,
   * we can use the Object.keys() method to get an array of keys and then
   * sort it based on their index in the original object.
   */
  private static keysInOrder(obj: any): string[] {
    return Object.keys(obj).sort(
      (a, b) => Object.keys(obj).indexOf(a) - Object.keys(obj).indexOf(b)
    );
  }
  /**
   * To get an array of values in the order of the keys of an object in JavaScript,
   * we can use the Object.keys() method to get an array of keys and then use the
   * Array.map() method to create an array of values in the same order as the keys.
   */
  private static valuesInOrderOfKeys(obj: any): any[] {
    return Object.keys(obj).map((key) => obj[key]);
  }
}
