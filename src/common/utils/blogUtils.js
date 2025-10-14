import { gql, ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

// Create Apollo Client instance
const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.shop.strackit.com/graphql',
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
  }
});

const GET_BLOGS_QUERY = gql`
  query GetBlogs($filter: blogFilter) {
    Blog(filter: $filter) {
      id
      title
      image
      description
      url
      type
      productName
      timestamp
    }
  }
`;

export async function GET_BLOG(filter = {}) {
  try {
    const { data } = await client.query({
      query: GET_BLOGS_QUERY,
      variables: { filter }
    });

    return data?.Blog;

  } catch (err) {
    console.error("Full GraphQL Error:", JSON.stringify(err, null, 2));
    throw err;
  }
}