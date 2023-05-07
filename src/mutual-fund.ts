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
  turnOver?: string;
  return_1y?: number;
  return_3y?: number;
  return_5y?: number;
  return_10y?: number;
  expense_ratio?: number;
  r_squared?: string;
  sharp_ratio?: number;
  standard_deviation?: string;
  riskometer?: "high" | "medium" | "low";
  morningstar_rating?: number;
  no_of_stocks?: number;
  holdings?: string[];
}

class RowIml implements Row {}

export class MutualFund {
  public static getAlphaBeta(
    fundSymbol: string
  ): Promise<{ alpha: number; beta: number }> {
    return yahooFinance
      .quoteSummary(
        fundSymbol,
        { modules: ["fundPerformance"] },
        { validateResult: false }
      )
      .then((results) => {
        if (!results) {
          throw new Error(
            `Failed to get data for one of the symbols: ${fundSymbol}`
          );
        }

        const riskStats = results?.fundPerformance?.riskOverviewStatistics!;

        const alpha = riskStats.riskStatistics[0].alpha;
        const beta = riskStats.riskStatistics[0].beta;
        return { alpha, beta };
      });
  }

  public static search(
    contains: string
  ): Promise<{ name: string; symbol: string }[] | { error?: string }> {
    return yahooFinance
      .search(contains, {
      }, { validateResult: true })
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
        data: [
          coumnNames,
          ["John Doe", 25, "johndoe@example.com"],
          ["Jane Doe", 30, "janedoe@example.com"],
        ],
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
    return Object.keys(obj).map(key => obj[key]);
  }
}
