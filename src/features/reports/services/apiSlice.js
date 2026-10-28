import { api } from '../../../services/api'

const getCards = api.injectEndpoints({
  endpoints: (build) => ({
    cards: build.query({
      query: (name) => ({
        url: '/get-cards',
        method: 'GET',
        params: name,
      }),
    }),
    finalAccounts: build.query({
      query: (name) => ({
        url: '/get-accounting-reports',
        method: 'GET',
        params: name,
      }),
      providesTags: ['accountingReports'],
    }),
    generateAccounts: build.query({
      query: (name) => ({
        url: '/generate-accounting-reports',
        method: 'GET',
        params: name,
      }),
      invalidatesTags: ['accountingReports'],
    }),
  }),
})
export const { useCardsQuery, useFinalAccountsQuery, useGenerateAccountsQuery } = getCards
