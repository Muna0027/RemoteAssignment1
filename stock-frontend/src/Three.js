import React from 'react';
import { useSubscription, gql } from '@apollo/client';

const STOCK_UPDATED_SUBSCRIPTION = gql`
  subscription OnStockUpdated($symbol: String!) {
    stockUpdated(symbol: $symbol) {
      name
      symbol
      price
      historicalPrices
      tradingVolume
    }
  }
`;

function Three() {
  const { data, error, loading } = useSubscription(STOCK_UPDATED_SUBSCRIPTION, {
    variables: {
      symbol: "AAPL"
    }
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const { name, symbol, price, historicalPrices, tradingVolume } = data.stockUpdated;

  return (
    <div>
      <h2>Stock Updated</h2>
      <p>Name: {name}</p>
      <p>Symbol: {symbol}</p>
      <p>Price: {price}</p>
      <br />
      <p>Last Days Prices:</p>
      <div>{historicalPrices.map((p, i) => <span key={i}>{p}{i !== historicalPrices.length - 1 ? ", " : ""}</span>)}</div>
      <br />
      <p>Last Days Trading Volume:</p>
      <div>{tradingVolume.map((p, i) => <span key={i}>{p}{i !== tradingVolume.length - 1 ? ", " : ""}</span>)}</div>
    </div>
  );
}

export default Three;
