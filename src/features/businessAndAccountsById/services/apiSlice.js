import { api } from '../../../services/api'

const getAccounts = api.injectEndpoints({
  endpoints: (build) => ({
    accounts: build.query({
      accounts: (name) => ({
        url: '/get-accounts',
        method: 'GET',
        params: name,
      }),
    }),
  }),
})
export const { useAccountsQuery } = getAccounts
