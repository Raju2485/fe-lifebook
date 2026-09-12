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
  tagTypes: ['Accounts', 'Users', 'Organizations', 'Journals', 'YearsAndMonths'],
  endpoints: (build) => ({
    accTypes: build.query({
      query: (name) => ({
        url: '/get-account-types',
        method: 'GET',
        params: name,
      }),
    }),
    roles: build.query({
      query: (name) => ({
        url: '/get-roles',
        method: 'GET',
        params: name,
      }),
    }),
    users: build.query({
      query: (name) => ({
        url: '/get-users',
        method: 'GET',
        params: name,
      }),
      providesTags: ['Users'],
    }),
    nonAccountUsers: build.query({
      query: (name) => ({
        url: '/get-non-account-users',
        method: 'GET',
        params: name,
      }),
      providesTags: ['Users'],
    }),
    accounts: build.query({
      query: (name) => ({
        url: '/get-accounts',
        method: 'GET',
        params: name,
      }),
      providesTags: ['Accounts'],
    }),
    isAccountExists: build.query({
      query: (name) => ({
        url: '/check-if-account-exists',
        method: 'GET',
        params: name,
      }),
    }),
    isUserExists: build.query({
      query: (name) => ({
        url: '/check-if-user-exists',
        method: 'GET',
        params: name,
      }),
    }),
    journals: build.query({
      query: (name) => ({
        url: '/get-journal-entries',
        method: 'GET',
        params: name,
      }),
      providesTags: ['Journals'],
    }),
    bulkUploadTemplate: build.query({
      query: (name) => ({
        url: '/download-bulk-upload-template',
        method: 'GET',
        params: name,
        responseHandler: (response) => response.blob(),
      }),
    }),
    getYearsAndMonths: build.query({
      query: (name) => ({
        url: '/get-years-and-months',
        method: 'GET',
        params: name,
      }),
      providesTags: ['YearsAndMonths'],
    }),
  }),
})
