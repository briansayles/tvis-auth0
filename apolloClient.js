import { ApolloClient, HttpLink, split } from '@apollo/client'
import { InMemoryCache } from '@apollo/client/cache';
import { getMainDefinition } from '@apollo/client/utilities'
import { WebSocketLink } from "@apollo/client/link/ws";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { GraphQLConfig } from './config'

export const makeApolloClient = (token) => {
  const httpLink = new HttpLink({
    uri: "https://" + GraphQLConfig.endpoint,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const wsLink = new WebSocketLink(new SubscriptionClient(
    "wss://"+GraphQLConfig.endpoint, {
    reconnect: true,
    connectionParams: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  }));
  const link = split(
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query);
      return kind === 'OperationDefinition' && operation === 'subscription';
    },
    wsLink,
    httpLink,
  );
  const cache = new InMemoryCache()
  const client = new ApolloClient({
    link,
    cache
  });
  return client;
}