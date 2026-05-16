import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define a service using a base URL and expected endpoints
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000/api/v1/' }),
  tagTypes: ['Post', 'User'], // Define all tags here
  endpoints: () => ({}), // Leave empty if injecting later
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
