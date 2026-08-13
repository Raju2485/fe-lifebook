import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import {
  API_BASE_URL,
  dispatchSessionExpired,
  getAuthTokens,
  isAuthEndpoint,
  refreshAccessToken,
} from '../utils/authSession'

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const { accessToken } = getAuthTokens()
    if (accessToken) {
      headers.set('authorization', `Bearer ${accessToken}`)
    }

    return headers
  },
})

export const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error?.status !== 401) {
    return result
  }

  const url = typeof args === 'string' ? args : (args.url ?? '')

  if (isAuthEndpoint(url)) {
    return result
  }

  if (extraOptions?._retry) {
    dispatchSessionExpired()
    return result
  }

  const refreshed = await refreshAccessToken()

  if (refreshed) {
    result = await baseQuery(args, api, { ...extraOptions, _retry: true })
    return result
  }

  dispatchSessionExpired()
  return result
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Post', 'User'],
  endpoints: (build) => ({
    accTypes: build.query({
      query: (name) => ({
        url: '/get-account-types',
        method: 'GET',
        params: name,
      }),
    }),
  }),
})
