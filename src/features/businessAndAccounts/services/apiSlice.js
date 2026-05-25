import { api } from '../../../services/api'

const getOrgs = api.injectEndpoints({
  endpoints: (build) => ({
    orgs: build.query({
      query: (name) => ({
        url: '/get-organizations',
        method: 'GET',
        params: name,
      }),
    }),
  }),
})
export const { useOrgsQuery } = getOrgs
