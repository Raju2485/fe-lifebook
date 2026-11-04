import { api } from '../../../services/api'

const getCards = api.injectEndpoints({
  endpoints: (build) => ({
    schema: build.query({
      query: (name) => ({
        url: '/api/schema',
        method: 'GET',
        params: name,
      }),
    }),
  }),
})
export const {
  useSchemaQuery
} = getCards
