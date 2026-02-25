import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Toaster } from 'sonner'
import App from './App.jsx'
import { SocketProvider } from './context/SocketContext.jsx'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { HOST } from './utils/constants';

const client = new ApolloClient({
  uri: `${HOST}/graphql`,
  cache: new InMemoryCache(),
  // Add credentials (cookies) to GraphQL requests
  link: undefined, // Standard Apollo Client 3+ handles basic fetch; for cookies, we often need to customize the fetch options
});

// Since standard Apollo Link uses fetch, we need to ensure credentials are sent
import { createHttpLink } from '@apollo/client';

const httpLink = createHttpLink({
  uri: `${HOST}/graphql`,
  fetchOptions: {
    credentials: 'include',
  },
});

const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <SocketProvider>
        <App />
        <Toaster closeButton />
      </SocketProvider>
    </ApolloProvider>
  </StrictMode>,
)

