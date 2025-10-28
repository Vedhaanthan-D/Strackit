import { ApolloClient, InMemoryCache, HttpLink, gql } from '@apollo/client';

// Create Apollo Client instance
const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.shop.strackit.com/graphql',
    fetch: fetch
  }),
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

// GQL Query for fetching blogs
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

/**
 * Fetch blogs from GraphQL API
 * @param {Object} filter - Filter object for blog query (should include shopId and/or userId)
 * @returns {Promise<Array>} Array of blog data
 */
export async function GET_BLOG(filter = {}) {
  try {
    const { data } = await client.query({
      query: GET_BLOGS_QUERY,
      variables: { filter }
    });

    return data?.Blog || [];

  } catch (err) {
    console.error("Error fetching blogs:", err);
    console.error("Full GraphQL Error:", JSON.stringify(err, null, 2));
    throw err;
  }
}

export default GET_BLOG;
