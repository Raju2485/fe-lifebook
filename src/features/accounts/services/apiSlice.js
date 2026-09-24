import { api } from '../../../services/api'
const updateAccount = api.injectEndpoints({
  endpoints: (build) => ({
    updateAccount: build.mutation({
      query: (data) => ({
        url: '/update-account',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Accounts'],
    }),
  }),
})
export const { useAccountsQuery, useRolesQuery } = api
export const { useUpdateAccountMutation } = updateAccount
