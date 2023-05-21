import axios from "axios";
import { build, WorkSheet } from "node-xlsx";
import * as fs from "fs";
import path from "path";
import yahooFinance from "yahoo-finance2";

export interface Row {
  id: string; //fund code
  name: string;
  turnOver?: string;

  return_1y?: number;
  return_3y?: number;
  return_5y?: number;
  return_10y?: number;

  alpha_3y: number;
  alpha_5y: number;
  alpha_10y: number;

  beta_3y: number;
  beta_5y: number;
  beta_10y: number;

  standard_deviation_3y: number;
  standard_deviation_5y: number;
  standard_deviation_10y: number;
  r_squared_3y: number;
  r_squared_5y: number;
  r_squared_10y: number;

  sharp_ratio_3y: number;
  sharp_ratio_5y: number;
  sharp_ratio_10y: number;

  expense_ratio?: number;
  riskometer?: "high" | "medium" | "low";
  morningstar_risk_rating?: number;
  morningstar_overall_rating?: number;
  no_of_stocks?: number;
  marketCap?: number;
  holdings?: { name: string, percentage: number}[];
}

class OrderedRowData implements Row {
  id: string;
  name: string;
  turnOver?: string;
  return_1y?: number;
  return_3y?: number;
  return_5y?: number;
  return_10y?: number;

  alpha_3y: number;
  alpha_5y: number;
  alpha_10y: number;

  beta_3y: number;
  beta_5y: number;
  beta_10y: number;

  standard_deviation_3y: number;
  standard_deviation_5y: number;
  standard_deviation_10y: number;
  r_squared_3y: number;
  r_squared_5y: number;
  r_squared_10y: number;

  sharp_ratio_3y: number;
  sharp_ratio_5y: number;
  sharp_ratio_10y: number;

  expense_ratio?: number;
  riskometer: "high" | "medium" | "low";
  morningstar_risk_rating?: number;
  morningstar_overall_rating?: number;
  no_of_stocks?: number;
  marketCap?: number;
  holdings?: { name: string, percentage: number}[];
  constructor(row?: Row) {
    // Following order is important.
    // xls rows are created in this order.
    // Order of the the interfacr named Row declaration is not important.
    this.id = row?.id || undefined;
    this.name = row?.name || undefined;

    this.return_1y = row?.return_1y ||undefined;
    this.return_3y = row?.return_3y ||undefined;
    this.return_5y = row?.return_5y ||undefined;
    this.return_10y = row?.return_10y ||undefined;

    this.alpha_3y = row?.alpha_3y ||undefined;
    this.alpha_5y = row?.alpha_5y ||undefined;
    this.alpha_10y = row?.alpha_10y ||undefined;

    this.beta_3y = row?.beta_3y ||undefined;
    this.beta_5y = row?.beta_5y ||undefined;
    this.beta_10y = row?.beta_10y ||undefined;

    this.standard_deviation_3y = row?.standard_deviation_3y ||undefined;
    this.standard_deviation_5y = row?.standard_deviation_5y ||undefined;
    this.standard_deviation_10y = row?.standard_deviation_10y ||undefined;

    this.r_squared_3y = row?.r_squared_3y ||undefined;
    this.r_squared_5y = row?.r_squared_5y ||undefined;
    this.r_squared_10y = row?.r_squared_10y ||undefined;

    this.sharp_ratio_3y = row?.sharp_ratio_3y ||undefined;
    this.sharp_ratio_5y = row?.sharp_ratio_5y ||undefined;
    this.sharp_ratio_10y = row?.sharp_ratio_10y ||undefined;

    this.return_1y = row?.return_1y ||undefined;
    this.return_3y = row?.return_3y ||undefined;
    this.return_5y = row?.return_5y ||undefined;
    this.return_10y = row?.return_10y ||undefined;

    this.expense_ratio = row?.expense_ratio ||undefined;
    this.riskometer = row?.riskometer ||undefined;
    this.morningstar_risk_rating = row?.morningstar_risk_rating ||undefined;
    this.morningstar_overall_rating = row?.morningstar_overall_rating ||undefined;
    this.no_of_stocks = row?.no_of_stocks ||undefined;
    this.marketCap = row?.marketCap || undefined;
    this.holdings = row?.holdings ||undefined;
    this.turnOver = row?.turnOver || undefined;
  }
}

export class MutualFund {
  public static quote(fundSymbol: string): Promise<Row> {
    // IMPROTANT : TypeScript type info will not be available if validateResult = false
    // so, dev time validateResult = true will be helpful for intelisence
    return yahooFinance.quoteSummary(fundSymbol, { formatted: true, modules: "all"}, {validateResult: false})
    .catch(err => {
      //ignore
    })
    .then((results) => {
      if (!results) {
        // ignore for now
        // throw new Error(
        //   `Failed to get data for one of the symbols: ${fundSymbol}`
        // );
        return new OrderedRowData(); // return all undefined fields - but don't fail it
      }

      const quoteType = results?.quoteType;
      const trailingReturn = results?.fundPerformance?.trailingReturns;
      const defaultKeyStatistics = results?.defaultKeyStatistics;
      const riskStats = results?.fundPerformance?.riskOverviewStatistics?.riskStatistics;

      const y3Data = riskStats.find((risk) => risk?.year?.includes('3'));
      const y5Data = riskStats.find((risk) => risk?.year?.includes('5'));
      const y10Data = riskStats.find((risk) => risk?.year?.includes('10'));

      const alpha_3y = y3Data.alpha;
      const alpha_5y = y5Data.alpha;
      const alpha_10y = y10Data.alpha;
    
      const beta_3y = y3Data.beta;
      const beta_5y = y5Data.beta;
      const beta_10y = y10Data.beta;
    
      const standard_deviation_3y = y3Data.stdDev;
      const standard_deviation_5y = y5Data.stdDev;
      const standard_deviation_10y = y10Data.stdDev;
      
      const r_squared_3y = y3Data.rSquared;
      const r_squared_5y = y5Data.rSquared;
      const r_squared_10y = y10Data.rSquared;
    
      const sharp_ratio_3y = y3Data.sharpeRatio;
      const sharp_ratio_5y = y5Data.sharpeRatio;
      const sharp_ratio_10y = y10Data.sharpeRatio;

      const code = fundSymbol;
      const name = quoteType?.longName;
      const return_3y = trailingReturn?.threeYear;
      const return_5y = trailingReturn?.fiveYear;
      const return_10y = trailingReturn?.tenYear;
      const return_1y = trailingReturn?.oneYear;
      const morningstar_overall_rating = defaultKeyStatistics?.morningStarOverallRating;
      const morningstar_risk_rating = defaultKeyStatistics?.morningStarRiskRating;
      const holdings: { name: string, percentage: number}[] = results?.topHoldings?.holdings?.map(holding => { 
          return { name :holding.holdingName, percentage: holding.holdingPercent }
        });
      const expense_ratio = results?.fundProfile?.feesExpensesInvestment?.netExpRatio;
      const marketCap = results?.price?.marketCap;
      const no_of_stocks = results?.topHoldings?.equityHoldings ?  results?.topHoldings?.equityHoldings.length : -1;
      
      const rowData = new OrderedRowData({id: code, 
        name,
        return_10y,
        return_1y,
        return_3y,
        return_5y,

        alpha_3y,
        alpha_5y,
        alpha_10y,
      
        beta_3y,
        beta_5y,
        beta_10y,
      
        standard_deviation_3y,
        standard_deviation_5y,
        standard_deviation_10y,

        r_squared_3y,
        r_squared_5y,
        r_squared_10y,
      
        sharp_ratio_3y,
        sharp_ratio_5y,
        sharp_ratio_10y,

        morningstar_overall_rating,
        morningstar_risk_rating,
        holdings,
        expense_ratio,
        no_of_stocks,
        marketCap
      });
      return rowData;
    });
  }

  // search is not working well. A mutual fund that can be found in yahoofinance
  // website is not found here. TODO : will fix this later
  // For now, just search the fund in yahoofinance and get the symbol for /quote/{symbol} endpoint
  public static search(
    contains: string
  ): Promise<{ name: string; symbol: string }[] | { error?: string }> {
    return yahooFinance
      .search(contains, {}, { validateResult: false })
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
  static async export(symbols: string[]) {
    // empty constructor of OrderedRowData creates an empty obj with all column-names as properties of it 
    const coumnNames = this.keysInOrder(new OrderedRowData());
    const filePath = path.join(__dirname, "my-mf-sheet.xlsx");
    const dataToXls: (string|Row)[][] = [coumnNames];

    for (let index = 0; index < symbols.length; index++) {
      const symbol = symbols[index];
      const quote = await MutualFund.quote(symbol);
      const values = Xls.valuesInOrderOfKeys(quote);
      const stringifiedValues = values.map(val =>  {
        if (Object.prototype.toString.call(val) === '[object Array]' 
        || Object.prototype.toString.call(val) === '[object Object]') {
          return JSON.stringify(val);
        }
        return val;
      });
      dataToXls.push(stringifiedValues);
    }

    const worksheet: WorkSheet[] = [
      {
        name: "My fund worksheet",
        data: dataToXls,
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
