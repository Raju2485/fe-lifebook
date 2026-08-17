import { api } from '../../../services/api'

const getAccounts = api.injectEndpoints({
  endpoints: (build) => ({
    createAccount: build.mutation({
      query: (data) => ({
        url: '/create-account',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Accounts', 'Users'],
    }),
  }),
})
export const {
  useAccTypesQuery,
  useRolesQuery,
  useNonAccountUsersQuery,
  useAccountsQuery,
  useLazyIsUserExistsQuery,
  useLazyIsAccountExistsQuery,
} = api
export const { useCreateAccountMutation } = getAccounts
