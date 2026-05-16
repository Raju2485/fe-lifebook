import { api } from '../../../services/api';

const signinApi = api.injectEndpoints({
  endpoints: (build) => ({
    signin: build.mutation({
      query: (credentials) => ({
        url: '/signin',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
});
export default signinApi;
export const { useSigninMutation } = signinApi;