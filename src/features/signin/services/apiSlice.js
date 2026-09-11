import { api } from '../../../services/api'
import { getAuthTokens } from '../../../utils/authSession'

const signinApi = api.injectEndpoints({
  endpoints: (build) => ({
    signin: build.mutation({
      query: (credentials) => ({
        url: '/signin',
        method: 'POST',
        body: credentials,
      }),
    }),
    sendResetEmail: build.mutation({
      query: (body) => ({
        url: '/send-password-reset-link',
        method: 'POST',
        body: body,
      }),
    }),
    signout: build.mutation({
      query: () => {
        const { refreshToken } = getAuthTokens()
        return {
          url: '/signout',
          method: 'POST',
          body: refreshToken ? { refreshToken } : {},
        }
      },
    }),
  }),
})
export default signinApi
export const {
  useSigninMutation,
  useSignoutMutation,
  useSendResetEmailMutation,
} = signinApi
