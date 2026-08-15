import { api } from '../../../services/api'

const getCards = api.injectEndpoints({
  endpoints: (build) => ({
    cards: build.query({
      query: (name) => ({
        url: '/get-cards',
        method: 'GET',
        params: name,
      }),
    }),
  }),
})
export const { useCardsQuery } = getCards
