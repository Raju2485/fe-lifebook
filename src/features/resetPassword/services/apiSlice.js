import { api } from '../../../services/api'

const resetPasswordApi = api.injectEndpoints({
  endpoints: (build) => ({
    resetPassword: build.mutation({
      query: (credentials) => ({
        url: '/reset-password',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
})
export default resetPasswordApi
export const { useResetPasswordMutation } = resetPasswordApi
