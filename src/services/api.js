import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getLocalStorage } from '../utils/localStorage'

const user = getLocalStorage('user')
const authToken = user?.accessToken ?? false

// Define a service using a base URL and expected endpoints
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000/api/v1/',
    prepareHeaders: (headers) => {
      // If we have a token set in state, let's assume that we should be passing it.
      if (authToken) {
        headers.set('authorization', `Bearer ${authToken}`)
      }

      return headers
    },
  }),
  tagTypes: ['Post', 'User'], // Define all tags here
  endpoints: () => ({}), // Leave empty if injecting later
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
