import yahooFinance from "yahoo-finance2";
export class MutualFundAlphaBeta {
  public static getAlphaBeta(
    fundSymbol: string
  ): Promise<{ alpha: number; beta: number }> {
    return yahooFinance.quoteSummary(fundSymbol, {modules: ["fundPerformance"]}, {validateResult: false}).then((results) => {
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
}
