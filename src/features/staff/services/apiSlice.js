import { api } from '../../../services/api'

api.injectEndpoints({
  endpoints: (build) => ({
    staff: build.query({
      query: (name) => ({
        url: '/api/v1/get-staff-members',
        method: 'GET',
        params: name,
      }),
      providesTags: ['Staff'],
    }),
    mapStaffMember: build.mutation({
      query: (data) => ({
        url: '/api/v1/map-staff-member',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Staff'],
    }),
    updateStaffMember: build.mutation({
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
  useStaffQuery,
  useUsersQuery,
  useUpdateStaffMemberMutation,
  useMapStaffMemberMutation,
} = api
