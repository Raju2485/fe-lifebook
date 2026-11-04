import { api } from '../../../services/api'

const getCards = api.injectEndpoints({
  endpoints: (build) => ({
    cards: build.query({
      query: (name) => ({
        url: '/api/v1/get-cards',
        method: 'GET',
        params: name,
      }),
    }),
    finalAccounts: build.query({
      query: (name) => ({
        url: '/api/v1/get-accounting-reports',
        method: 'GET',
        params: name,
      }),
      providesTags: ['AccountingReports'],
    }),
    generateAccounts: build.query({
      query: (name) => ({
        url: '/api/v1/generate-accounting-reports',
        method: 'GET',
        params: name,
      }),
      invalidatesTags: ['AccountingReports'],
    }),
  }),
})
export const { useCardsQuery, useFinalAccountsQuery, useLazyGenerateAccountsQuery } = getCards
export const { useGetKeysAndLabelsQuery } = api;