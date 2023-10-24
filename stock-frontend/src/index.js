import React from 'react';
import ReactDOM from 'react-dom';
import Two from './Two';
import Three from './Three';
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  split,
  ApolloProvider,
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql'
});

const wsLink = new GraphQLWsLink(createClient({
  url: 'ws://localhost:4000/subscriptions',
}));

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <React.StrictMode>
      <Three />
    </React.StrictMode>
  </ApolloProvider>,
  document.getElementById('root')
);
