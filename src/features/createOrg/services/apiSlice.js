import { api } from '../../../services/api'

const createOrgApi = api.injectEndpoints({
  endpoints: (build) => ({
    createOrg: build.mutation({
      query: (credentials) => ({
        url: '/create-organization',
        method: 'POST',
        body: credentials,
      }),
    })
  }),
})
export default createOrgApi
export const { useCreateOrgMutation } = createOrgApi;