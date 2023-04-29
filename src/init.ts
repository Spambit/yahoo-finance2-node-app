import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import yahooFinance from 'yahoo-finance2';
import { MutualFundAlphaBeta } from './mutual-fund';

const app = express();
const port = process.env.PORT || 3000;

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

app.use(bodyParser.json());

app.get('/quote/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const quote = await yahooFinance.quoteSummary(symbol);
    res.send(quote);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});
app.get('/alpha/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const alpaBeta = await MutualFundAlphaBeta.getAlphaBeta(symbol);
    res.send(alpaBeta);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use`);
  } else {
    console.error(error);
  }
});
