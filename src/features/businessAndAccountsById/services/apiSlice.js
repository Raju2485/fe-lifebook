import { api } from '../../../services/api';
export const { useAccTypesQuery } = api;

const getAccounts = api.injectEndpoints({
  endpoints: (build) => ({
    accounts: build.query({
      query: (name) => ({
        url: '/get-accounts',
        method: 'GET',
        params: name,
      }),
    }),
    createAccount: build.mutation({
      query: (data) => ({
        url: '/create-account',
        method: 'POST',
        body: data,
      }),
    }),
  }),
})
export const { useAccountsQuery, useCreateAccountMutation } = getAccounts
