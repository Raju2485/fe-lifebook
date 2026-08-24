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
    postJournalEntry: build.mutation({
      query: (data) => ({
        url: '/post-journal-entry',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Journals'],
    }),
    bulkUpload: build.mutation({
      query: ({ file, orgId }) => {
        const formData = new FormData()
        formData.append('file', file)
        if (orgId) formData.append('orgId', orgId)
        // return {
        return {
          url: '/import-journals-from-excel',
          method: 'POST',
          body: formData,
          formData: true,
        }
        // }
      },
      invalidatesTags: ['Journals'],
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
  useJournalsQuery,
  useLazyBulkUploadTemplateQuery,
} = api
export const {
  useCreateAccountMutation,
  usePostJournalEntryMutation,
  useBulkUploadMutation,
} = getAccounts
