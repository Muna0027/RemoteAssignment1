import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

const typeDefs = `
type Query {
  getStock(symbol: String!): Stock
  stocks: [Stock!]
}

type Mutation {
  addStock(name: String!, symbol: String!, price: Float!, historicalPrices: [Float!]!, tradingVolume: [Float!]!): Stock!
  updateStock(name: String!, symbol: String!, price: Float!, historicalPrices: [Float!]!, tradingVolume: [Float!]!): Stock!
  deleteStock(name: String!, symbol: String!): Boolean
}

type Subscription {
  stockUpdated(symbol: String!): Stock
}

type Stock {
  name: String!
  symbol: String!
  price: Float!
  historicalPrices: [Float!]!
  tradingVolume: [Float!]!
}
`;

let stocks = [{
  name: "Apple",
  symbol: "AAPL",
  price: 152,
  historicalPrices: [138,145,132,149,152],
  tradingVolume: [1231, 256, 2489, 344, 1245]
}];

const resolvers = {
  Query: {
    stocks: () => stocks,
    getStock: (_, args) => stocks.find(stock => stock.symbol === args.symbol),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Wrap this part inside an async function to use 'await'
async function startServer() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.log(`🚀 Server ready at: ${url}`);
}

// Call the function to start the server
startServer();
