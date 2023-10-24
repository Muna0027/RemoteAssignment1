import React from 'react';
import { useQuery, gql } from '@apollo/client';

const GET_STOCKS = gql`
  query GetStocks {
    stocks {
      name
      symbol
      price
      historicalPrices
      tradingVolume
    }
  }
`;

const GET_AAPL_STOCK = gql`
  query GetStock($symbol: String!) {
    getStock(symbol: $symbol) {
      name
      symbol
      price
      historicalPrices
      tradingVolume
    }
  }
`;

function App() {
  const { loading, error, data } = useQuery(GET_AAPL_STOCK, {
    variables: {
      symbol: "AAPL"
    }
  });
  // const { loading, error, data } = useQuery(GET_STOCKS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : ( {error.message}</p>;

  let component = <Stock data={data} />
  // if ("stocks" in data) {
  //   component = <AllStocks data={data} />
  // } 

  return component;
}

const Stock = (data) => {
  console.log(data)
  return (
  <div>
    <h1>Stocks</h1>
    <pre>
      <div>Stock: {data.data.getStock.name} </div>
      <p>Symbol: {data.data.getStock.symbol}</p>
      <p>Price: {data.data.getStock.price}</p>
      <br />
      <p>Last Days Prices:</p>
      <div>{data.data.getStock.historicalPrices.map((p, i) => <span key={i}>{p}{i !== data.data.getStock.historicalPrices.length - 1 ? ", " : ""}</span>)}</div>
      <br />
      <p>Last Days Trading Volume:</p>
      <div>{data.data.getStock.tradingVolume.map((p, i) => <span key={i}>{p}{i !== data.data.getStock.tradingVolume.length - 1 ? ", " : ""}</span>)}</div>
    </pre>
  </div>
)}

const AllStocks = (data) => {
  return (
      <ul>
        {data.data.stocks.map(stock => (
          <li key={stock.symbol}>
            {stock.name} ({stock.symbol}): ${stock.price}
            <br></br>
            historicalPrices
            {stock.historicalPrices.map(price => (
              <span style={{
                marginLeft: '12px'
              }}>{price}</span>
            ))}
            <br />
            TradingVolume
            {stock.tradingVolume.map(price => (
              <span style={{
                marginLeft: '12px'
              }}>{price}</span>
            ))}
         </li>
        ))}
      </ul>
  )
} 

export default App;
