import { gql } from '@apollo/client';
import { ApolloClient, InMemoryCache } from '@apollo/client';

// Create Apollo Client instance
const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_ENDPOINT || 'YOUR_GRAPHQL_ENDPOINT_HERE',
  cache: new InMemoryCache(),
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
 * @param {Object} filter - Filter object for blog query
 * @returns {Promise<Array>} Array of blog data
 */
export async function GET_BLOG(filter = {}) {
  try {
    const { data } = await client.query({
      query: GET_BLOGS_QUERY,
      variables: { filter },
      fetchPolicy: 'network-only', // Ensure fresh data from server
    });

    return data?.Blog || [];

  } catch (err) {
    console.error("Error fetching blogs:", err);
    console.error("Full GraphQL Error:", JSON.stringify(err, null, 2));
    throw err;
  }
}

/**
 * Fetch blogs with cache-first policy
 * @param {Object} filter - Filter object for blog query
 * @returns {Promise<Array>} Array of blog data
 */
export async function GET_BLOG_CACHED(filter = {}) {
  try {
    const { data } = await client.query({
      query: GET_BLOGS_QUERY,
      variables: { filter },
      fetchPolicy: 'cache-first',
    });

    return data?.Blog || [];

  } catch (err) {
    console.error("Error fetching cached blogs:", err);
    throw err;
  }
}

export default GET_BLOG;
