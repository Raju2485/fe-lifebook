import { api } from '../../../services/api'

const getAccounts = api.injectEndpoints({
  endpoints: (build) => ({
    createAccount: build.mutation({
      query: (data) => ({
        url: '/create-account',
        method: 'POST',
        body: data,
      }),
    }),
  }),
})
export const {
  useAccTypesQuery,
  useRolesQuery,
  useUsersQuery,
  useAccountsQuery,
  useLazyIsUserExistsQuery,
  useLazyIsAccountExistsQuery,
} = api
export const { useCreateAccountMutation } = getAccounts
