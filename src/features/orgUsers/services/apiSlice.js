import { api } from '../../../services/api'

api.injectEndpoints({
  endpoints: (build) => ({
    orgUsers: build.query({
      query: (name) => ({
        url: '/api/v1/get-staff-members',
        method: 'GET',
        params: name,
      }),
      providesTags: ['Staff'],
    }),
    mapOrgUser: build.mutation({
      query: (data) => ({
        url: '/api/v1/map-staff-member',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Staff'],
    }),
    updateOrgUser: build.mutation({
      query: (data) => ({
        url: '/api/v1/update-staff-member',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Staff'],
    }),
  }),
})

export const {
  useRolesQuery,
  useOrgUsersQuery,
  useUsersQuery,
  useUpdateOrgUserMutation,
  useMapOrgUserMutation,
} = api;
