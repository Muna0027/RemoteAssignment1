import { createServer } from 'http';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import cors from 'cors';
import { expressMiddleware } from '@apollo/server/express4';
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();
const STOCK_UPDATED = 'STOCK_UPDATED';

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
  historicalPrices: [138, 145, 132, 149, 152],
  tradingVolume: [1231, 256, 2489, 344, 1245]
}];

const resolvers = {
  Query: {
    stocks: () => stocks,
    getStock: (_, args) => stocks.find(stock => stock.symbol === args.symbol),
  },
  Mutation: {
    addStock: (_, { name, symbol, price, historicalPrices, tradingVolume }) => {
      const newStock = {
        name,
        symbol,
        price,
        historicalPrices,
        tradingVolume,
        timestamp: new Date().toISOString()
      };
      stocks.push(newStock);
      return newStock;
    },
    updateStock: (_, { name, symbol, price, historicalPrices, tradingVolume }) => {
      console.log('resolving update')
      const stockIndex = stocks.findIndex(stock => stock.symbol === symbol);
      if (stockIndex >= 0) {
        stocks[stockIndex] = {
          name,
          symbol,
          price,
          historicalPrices,
          tradingVolume,
          timestamp: new Date().toISOString()
        };
        pubsub.publish(STOCK_UPDATED, { stockUpdated: stocks[stockIndex] });
        return stocks[stockIndex];
      } else {
        throw new Error('Stock not found');
      }
    },
    deleteStock: (_, { name, symbol }) => {
      const stockIndex = stocks.findIndex(stock => stock.symbol === symbol);
      if (stockIndex >= 0) {
        stocks.splice(stockIndex, 1);
        return true;
      } else {
        return false;
      }
    },
  },
  Subscription: {
    stockUpdated: {
      subscribe: () => pubsub.asyncIterator([STOCK_UPDATED]),
    },
  }
};


// Create the schema, which will be used separately by ApolloServer and
// the WebSocket server.
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Create an Express app and HTTP server; we will attach both the WebSocket
// server and the ApolloServer to this HTTP server.
const app = express();
const httpServer = createServer(app);

// Create our WebSocket server using the HTTP server we just set up.
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/subscriptions',
});
// Save the returned server's info so we can shutdown this server later
const serverCleanup = useServer({ schema }, wsServer);

// Set up ApolloServer.
const server = new ApolloServer({
  schema,
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),

    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

await server.start();
app.use('/graphql', cors({
  origin: '*', // you can specify the allowed origins or put '*' to allow all
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
}), express.json(), expressMiddleware(server));

const PORT = 4000;
// Now that our HTTP server is fully set up, we can listen to it.
httpServer.listen(PORT, () => {
  console.log(`Server is now running on http://localhost:${PORT}/graphql`);
});