import { api } from '../../../services/api'

api.injectEndpoints({
  endpoints: (build) => ({
    updateAccount: build.mutation({
      query: (data) => ({
        url: '/api/v1/update-account',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Accounts'],
    }),
  }),
})

export const {
  useAccountsQuery,
  useRolesQuery,
  useUsersQuery,
  useAccCategoriesQuery,
  useLazyIsAccountExistsQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
} = api
