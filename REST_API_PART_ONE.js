import express from 'express';
const app = express();
app.use(express.json());

let stocks = []; // in memory db as shown in flask example

// Get all stocks
app.get('/stocks', (req, res) => {
  res.json(stocks);
});

// Get a stock by symbol
app.get('/stocks/:symbol', (req, res) => {
  const stock = stocks.find(s => s.symbol === req.params.symbol);
  if (!stock) {
    return res.status(404).send('Stock not found');
  }
  res.json(stock);
});

// Add a new stock
app.post('/stocks', (req, res) => {
  const stock = {
    name: req.body.name,
    symbol: req.body.symbol,
    price: req.body.price,
    historicalPrices: req.body.historicalPrices,
    tradingVolumes: req.body.tradingVolumes,
  };
  stocks.push(stock);
  res.status(201).json(stock);
});

// Update a stock
app.put('/stocks/:symbol', (req, res) => {
  let stock = stocks.find(s => s.symbol === req.params.symbol);
  if (!stock) {
    return res.status(404).send('Stock not found');
  }
  stock.name = req.body.name;
  stock.price = req.body.price;
  stock.historicalPrices = req.body.historicalPrices;
  stock.tradingVolumes = req.body.tradingVolumes; 
  res.json(stock);
});

// Delete a stock
app.delete('/stocks/:symbol', (req, res) => {
  stocks = stocks.filter(s => s.symbol !== req.params.symbol);
  res.status(204).send(); 
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
