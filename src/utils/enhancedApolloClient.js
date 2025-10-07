// Enhanced Apollo client with authentication headers for shop context
import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client/core/index.js';
import { setContext } from '@apollo/client/link/context';
import fetch from 'cross-fetch';

// Create auth link to add headers
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      'x-shop-id': '12',          // Shop ID
      'x-user-id': '198',         // User ID  
      'authorization': 'Bearer your-token-here', // If needed
      'content-type': 'application/json',
    }
  }
});

// Create HTTP link
const httpLink = new HttpLink({
  uri: 'https://api.shop.strackit.com/graphql',
  fetch
});

// Combine auth and http links
const client = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
    mutate: {
      fetchPolicy: 'no-cache',
    }
  }
});

export default client;