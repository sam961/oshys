import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  Course,
  Trip,
  Product,
  BlogPost,
  SocialInitiative,
  Event,
  TeamMember,
  Category,
  Setting,
  Banner,
  FooterLink,
  Booking,
} from '../types';

// Define base query
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      // Add auth token if available
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }

      // Add locale header for translations
      const locale = localStorage.getItem('i18nextLng') || 'en';
      headers.set('Accept-Language', locale);

      return headers;
    },
  }),
  tagTypes: ['Course', 'Trip', 'Product', 'BlogPost', 'SocialInitiative', 'Event', 'TeamMember', 'Category', 'Setting', 'Banner', 'FooterLink', 'Booking'],
  endpoints: (builder) => ({
    // Courses
    getCourses: builder.query<Course[], { active?: boolean; featured?: boolean; level?: string; search?: string }>({
      query: (params) => ({
        url: '/courses',
        params,
      }),
      providesTags: ['Course'],
    }),
    getCourse: builder.query<Course, number>({
      query: (id) => `/courses/${id}`,
      providesTags: ['Course'],
    }),
    createCourse: builder.mutation<Course, Partial<Course> | FormData>({
      query: (body) => ({
        url: '/courses',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Course'],
    }),
    updateCourse: builder.mutation<Course, { id: number; data: Partial<Course> | FormData }>({
      query: ({ id, data }) => ({
        url: `/courses/${id}`,
        method: 'POST', // Use POST for FormData file uploads with _method spoofing
        body: data,
      }),
      invalidatesTags: ['Course'],
    }),
    deleteCourse: builder.mutation<void, number>({
      query: (id) => ({
        url: `/courses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Course'],
    }),

    // Trips
    getTrips: builder.query<Trip[], { active?: boolean; featured?: boolean; difficulty?: string; search?: string }>({
      query: (params) => ({
        url: '/trips',
        params,
      }),
      providesTags: ['Trip'],
    }),
    getTrip: builder.query<Trip, number>({
      query: (id) => `/trips/${id}`,
      providesTags: ['Trip'],
    }),
    createTrip: builder.mutation<Trip, Partial<Trip> | FormData>({
      query: (body) => ({
        url: '/trips',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Trip'],
    }),
    updateTrip: builder.mutation<Trip, { id: number; data: Partial<Trip> | FormData }>({
      query: ({ id, data }) => ({
        url: `/trips/${id}`,
        method: 'POST', // Use POST for FormData file uploads with _method spoofing
        body: data,
      }),
      invalidatesTags: ['Trip'],
    }),
    deleteTrip: builder.mutation<void, number>({
      query: (id) => ({
        url: `/trips/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Trip'],
    }),

    // Products
    getProducts: builder.query<Product[], { active?: boolean; featured?: boolean; in_stock?: boolean; search?: string }>({
      query: (params) => ({
        url: '/products',
        params,
      }),
      providesTags: ['Product'],
    }),
    getProduct: builder.query<Product, number>({
      query: (id) => `/products/${id}`,
      providesTags: ['Product'],
    }),
    createProduct: builder.mutation<Product, Partial<Product> | FormData>({
      query: (body) => ({
        url: '/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation<Product, { id: number; data: Partial<Product> | FormData }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: 'POST', // Use POST for FormData file uploads with _method spoofing
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),

    // Blog Posts
    getBlogPosts: builder.query<BlogPost[], { published?: boolean; featured?: boolean; search?: string }>({
      query: (params) => ({
        url: '/blog-posts',
        params,
      }),
      providesTags: ['BlogPost'],
    }),
    getBlogPost: builder.query<BlogPost, number>({
      query: (id) => `/blog-posts/${id}`,
      providesTags: ['BlogPost'],
    }),
    createBlogPost: builder.mutation<BlogPost, Partial<BlogPost> | FormData>({
      query: (body) => ({
        url: '/blog-posts',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['BlogPost'],
    }),
    updateBlogPost: builder.mutation<BlogPost, { id: number; data: Partial<BlogPost> | FormData }>({
      query: ({ id, data }) => ({
        url: `/blog-posts/${id}`,
        method: 'POST', // Use POST for FormData file uploads with _method spoofing
        body: data,
      }),
      invalidatesTags: ['BlogPost'],
    }),
    deleteBlogPost: builder.mutation<void, number>({
      query: (id) => ({
        url: `/blog-posts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BlogPost'],
    }),

    // Social Initiatives
    getSocialInitiatives: builder.query<SocialInitiative[], { published?: boolean; featured?: boolean; search?: string }>({
      query: (params) => ({
        url: '/social-initiatives',
        params,
      }),
      providesTags: ['SocialInitiative'],
    }),
    getSocialInitiative: builder.query<SocialInitiative, number>({
      query: (id) => `/social-initiatives/${id}`,
      providesTags: ['SocialInitiative'],
    }),
    createSocialInitiative: builder.mutation<SocialInitiative, Partial<SocialInitiative> | FormData>({
      query: (body) => ({
        url: '/social-initiatives',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SocialInitiative'],
    }),
    updateSocialInitiative: builder.mutation<SocialInitiative, { id: number; data: Partial<SocialInitiative> | FormData }>({
      query: ({ id, data }) => ({
        url: `/social-initiatives/${id}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SocialInitiative'],
    }),
    deleteSocialInitiative: builder.mutation<void, number>({
      query: (id) => ({
        url: `/social-initiatives/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SocialInitiative'],
    }),

    // Events
    getEvents: builder.query<Event[], { active?: boolean; type?: string; search?: string }>({
      query: (params) => ({
        url: '/events',
        params,
      }),
      providesTags: ['Event'],
    }),
    getEvent: builder.query<Event, number>({
      query: (id) => `/events/${id}`,
      providesTags: ['Event'],
    }),
    createEvent: builder.mutation<Event, Partial<Event>>({
      query: (body) => ({
        url: '/events',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Event'],
    }),
    updateEvent: builder.mutation<Event, { id: number; data: Partial<Event> }>({
      query: ({ id, data }) => ({
        url: `/events/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Event'],
    }),
    deleteEvent: builder.mutation<void, number>({
      query: (id) => ({
        url: `/events/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Event'],
    }),

    // Team Members
    getTeamMembers: builder.query<TeamMember[], { active?: boolean; search?: string }>({
      query: (params) => ({
        url: '/team-members',
        params,
      }),
      providesTags: ['TeamMember'],
    }),
    getTeamMember: builder.query<TeamMember, number>({
      query: (id) => `/team-members/${id}`,
      providesTags: ['TeamMember'],
    }),
    getFeaturedInstructor: builder.query<TeamMember | null, void>({
      query: () => '/team-members-featured',
      providesTags: ['TeamMember', 'Setting'],
    }),
    createTeamMember: builder.mutation<TeamMember, Partial<TeamMember> | FormData>({
      query: (body) => ({
        url: '/team-members',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TeamMember'],
    }),
    updateTeamMember: builder.mutation<TeamMember, { id: number; data: Partial<TeamMember> | FormData }>({
      query: ({ id, data }) => ({
        url: `/team-members/${id}`,
        method: 'POST', // Use POST for FormData file uploads with _method spoofing
        body: data,
      }),
      invalidatesTags: ['TeamMember'],
    }),
    deleteTeamMember: builder.mutation<void, number>({
      query: (id) => ({
        url: `/team-members/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TeamMember'],
    }),

    // Categories
    getCategories: builder.query<Category[], { active?: boolean; type?: string; search?: string }>({
      query: (params) => ({
        url: '/categories',
        params,
      }),
      providesTags: ['Category'],
    }),
    getCategory: builder.query<Category, number>({
      query: (id) => `/categories/${id}`,
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation<Category, Partial<Category>>({
      query: (body) => ({
        url: '/categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation<Category, { id: number; data: Partial<Category> }>({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),

    // Settings
    getSettings: builder.query<Setting[], { type?: string; group?: string; search?: string }>({
      query: (params) => ({
        url: '/settings',
        params,
      }),
      providesTags: ['Setting'],
    }),
    getSetting: builder.query<Setting, number>({
      query: (id) => `/settings/${id}`,
      providesTags: ['Setting'],
    }),
    createSetting: builder.mutation<Setting, Partial<Setting>>({
      query: (body) => ({
        url: '/settings',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Setting'],
    }),
    updateSetting: builder.mutation<Setting, { id: number; data: Partial<Setting> }>({
      query: ({ id, data }) => ({
        url: `/settings/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Setting'],
    }),
    deleteSetting: builder.mutation<void, number>({
      query: (id) => ({
        url: `/settings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Setting'],
    }),

    // Banners
    getBanners: builder.query<Banner[], { active?: boolean; position?: string; current?: boolean; search?: string }>({
      query: (params) => ({
        url: '/banners',
        params,
      }),
      providesTags: ['Banner'],
    }),
    getBanner: builder.query<Banner, number>({
      query: (id) => `/banners/${id}`,
      providesTags: ['Banner'],
    }),
    createBanner: builder.mutation<Banner, Partial<Banner> | FormData>({
      query: (body) => ({
        url: '/banners',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Banner'],
    }),
    updateBanner: builder.mutation<Banner, { id: number; data: Partial<Banner> | FormData }>({
      query: ({ id, data }) => ({
        url: `/banners/${id}`,
        method: 'POST', // Use POST for FormData file uploads with _method spoofing
        body: data,
      }),
      invalidatesTags: ['Banner'],
    }),
    deleteBanner: builder.mutation<void, number>({
      query: (id) => ({
        url: `/banners/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Banner'],
    }),

    // Footer Links
    getFooterLinks: builder.query<FooterLink[], { active?: boolean; search?: string }>({
      query: (params) => ({
        url: '/footer-links',
        params,
      }),
      providesTags: ['FooterLink'],
    }),
    getFooterLink: builder.query<FooterLink, number>({
      query: (id) => `/footer-links/${id}`,
      providesTags: ['FooterLink'],
    }),
    getFooterLinkBySlug: builder.query<FooterLink, string>({
      query: (slug) => `/footer-links/${slug}`,
      providesTags: ['FooterLink'],
    }),
    createFooterLink: builder.mutation<FooterLink, Partial<FooterLink>>({
      query: (body) => ({
        url: '/footer-links',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FooterLink'],
    }),
    updateFooterLink: builder.mutation<FooterLink, { id: number; data: Partial<FooterLink> }>({
      query: ({ id, data }) => ({
        url: `/footer-links/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['FooterLink'],
    }),
    deleteFooterLink: builder.mutation<void, number>({
      query: (id) => ({
        url: `/footer-links/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FooterLink'],
    }),

    // Bookings
    getBookings: builder.query<Booking[], { status?: string; type?: string }>({
      query: (params) => ({
        url: '/bookings',
        params,
      }),
      providesTags: ['Booking'],
    }),
    getBooking: builder.query<Booking, number>({
      query: (id) => `/bookings/${id}`,
      providesTags: ['Booking'],
    }),
    createBooking: builder.mutation<{ message: string; booking: Booking }, {
      name: string;
      email: string;
      phone: string;
      bookable_type: 'course' | 'trip';
      bookable_id: number;
      notes?: string;
    }>({
      query: (body) => ({
        url: '/bookings',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Booking'],
    }),
    updateBooking: builder.mutation<{ message: string; booking: Booking }, { id: number; data: Partial<Booking> }>({
      query: ({ id, data }) => ({
        url: `/bookings/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Booking'],
    }),
    deleteBooking: builder.mutation<void, number>({
      query: (id) => ({
        url: `/bookings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Booking'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetCoursesQuery,
  useGetCourseQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,

  useGetTripsQuery,
  useGetTripQuery,
  useCreateTripMutation,
  useUpdateTripMutation,
  useDeleteTripMutation,

  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,

  useGetBlogPostsQuery,
  useGetBlogPostQuery,
  useCreateBlogPostMutation,
  useUpdateBlogPostMutation,
  useDeleteBlogPostMutation,

  useGetSocialInitiativesQuery,
  useGetSocialInitiativeQuery,
  useCreateSocialInitiativeMutation,
  useUpdateSocialInitiativeMutation,
  useDeleteSocialInitiativeMutation,

  useGetEventsQuery,
  useGetEventQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,

  useGetTeamMembersQuery,
  useGetTeamMemberQuery,
  useGetFeaturedInstructorQuery,
  useCreateTeamMemberMutation,
  useUpdateTeamMemberMutation,
  useDeleteTeamMemberMutation,

  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,

  useGetSettingsQuery,
  useGetSettingQuery,
  useCreateSettingMutation,
  useUpdateSettingMutation,
  useDeleteSettingMutation,

  useGetBannersQuery,
  useGetBannerQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,

  useGetFooterLinksQuery,
  useGetFooterLinkQuery,
  useGetFooterLinkBySlugQuery,
  useCreateFooterLinkMutation,
  useUpdateFooterLinkMutation,
  useDeleteFooterLinkMutation,

  useGetBookingsQuery,
  useGetBookingQuery,
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
} = api;
