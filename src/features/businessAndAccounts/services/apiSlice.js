import { api } from '../../../services/api'

const businessAndAccountsApi = api.injectEndpoints({
  endpoints: (build) => ({
    orgs: build.query({
      query: (name) => ({
        url: '/get-organizations',
        method: 'GET',
        params: name,
      }),
      providesTags: ['Organizations'],
    }),
    createOrg: build.mutation({
      query: (data) => ({
        url: '/create-organization',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Organizations'],
    }),
  }),
})

export const { useOrgsQuery, useCreateOrgMutation } = businessAndAccountsApi
