import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { MutualFund, Xls } from './mutual-fund';

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
    const quote = await MutualFund.quote(symbol);
    res.send(quote);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

/**
 * This endpoint is not working as per my expectation.
 * http://localhost:3000/search/hdfc does not return anything. My expectation is 
 * it will return all of hdfc funds
 */
app.get('/search/:contains', async (req: Request, res: Response) => {
  try {
    const { contains } = req.params;
    const ret = await MutualFund.search(contains);
    res.send(ret);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

/**
 * Example: Body should contain following in Postman: 
 * {
    "funds": [
        "ICICIPRTECHG",
        "0P00014KAU.BO",
        "0P0000YWL1.BO"
    ]
}
Url should be : http://localhost:3000/xls
 */
app.post('/xls', async (req: Request, res: Response) => {
  try {
    // TODO: security issue to return file path
    // Change before publishing
    const symbols = req.body.funds;
    const filePath = await Xls.export(symbols);
    res.send(`File written to path : ${filePath}`);
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
