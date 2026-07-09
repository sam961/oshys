import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import toast from 'react-hot-toast';
import type {
  Course,
  Trip,
  Product,
  BlogPost,
  SocialInitiative,
  Event,
  TeamMember,

  Setting,
  Banner,
  FooterLink,
  Booking,
  MediaItem,
  Image,
} from '../types';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    // The admin panel is English-only and its edit forms need the canonical
    // English values in the base fields, so always request 'en' under /admin.
    // The public site requests the visitor's chosen language and the API
    // returns translatable fields already swapped to that locale.
    const locale = window.location.pathname.startsWith('/admin')
      ? 'en'
      : localStorage.getItem('i18nextLng') || 'en';
    headers.set('Accept-Language', locale);
    return headers;
  },
});

const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth-storage');
    if (window.location.pathname.startsWith('/admin')) {
      toast.error('Session expired. Please log in again.');
      window.location.href = '/admin/login';
    }
  }
  return result;
};

/**
 * Build a method-spoofed request (POST + `_method`) for DELETE/PUT.
 *
 * Some production hosts (LiteSpeed / shared hosting) block or mishandle raw
 * DELETE and PUT verbs, causing the request to fall through to the SPA
 * catch-all and return 404. Laravel honours the `_method` field on a POST and
 * routes it to the real DELETE/PUT handler, so this works everywhere the app
 * is deployed — the same trick already used for form/file updates.
 */
const spoofedRequest = (url: string, method: 'DELETE' | 'PUT', body?: Record<string, unknown>) => {
  const form = new FormData();
  form.append('_method', method);
  if (body) {
    for (const [key, value] of Object.entries(body)) {
      form.append(key, typeof value === 'string' ? value : JSON.stringify(value));
    }
  }
  return { url, method: 'POST', body: form };
};

// Define base query
export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Course', 'CourseImage', 'Trip', 'TripImage', 'Product', 'BlogPost', 'SocialInitiative', 'Event', 'TeamMember', 'Setting', 'Banner', 'FooterLink', 'Booking'],
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
      query: (id) => spoofedRequest(`/courses/${id}`, 'DELETE'),
      invalidatesTags: ['Course'],
    }),

    // Course Images
    uploadCourseImages: builder.mutation<Image[], { courseId: number; files: FormData }>({
      query: ({ courseId, files }) => ({
        url: `/courses/${courseId}/images`,
        method: 'POST',
        body: files,
      }),
      invalidatesTags: ['Course', 'CourseImage'],
    }),
    deleteCourseImage: builder.mutation<Image[], { courseId: number; imageId: number }>({
      query: ({ courseId, imageId }) => spoofedRequest(`/courses/${courseId}/images/${imageId}`, 'DELETE'),
      invalidatesTags: ['Course', 'CourseImage'],
    }),
    setCourseMainImage: builder.mutation<Image[], { courseId: number; imageId: number }>({
      query: ({ courseId, imageId }) => spoofedRequest(`/courses/${courseId}/images/${imageId}/set-main`, 'PUT'),
      invalidatesTags: ['Course', 'CourseImage'],
    }),
    reorderCourseImages: builder.mutation<Image[], { courseId: number; order: { id: number; order: number }[] }>({
      query: ({ courseId, order }) => spoofedRequest(`/courses/${courseId}/images/reorder`, 'PUT', { order }),
      invalidatesTags: ['CourseImage'],
    }),

    // Trips
    getTrips: builder.query<Trip[], { active?: boolean; featured?: boolean; search?: string }>({
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
      query: (id) => spoofedRequest(`/trips/${id}`, 'DELETE'),
      invalidatesTags: ['Trip'],
    }),

    // Trip Images
    uploadTripImages: builder.mutation<Image[], { tripId: number; files: FormData }>({
      query: ({ tripId, files }) => ({
        url: `/trips/${tripId}/images`,
        method: 'POST',
        body: files,
      }),
      invalidatesTags: ['Trip', 'TripImage'],
    }),
    deleteTripImage: builder.mutation<Image[], { tripId: number; imageId: number }>({
      query: ({ tripId, imageId }) => spoofedRequest(`/trips/${tripId}/images/${imageId}`, 'DELETE'),
      invalidatesTags: ['Trip', 'TripImage'],
    }),
    setTripMainImage: builder.mutation<Image[], { tripId: number; imageId: number }>({
      query: ({ tripId, imageId }) => spoofedRequest(`/trips/${tripId}/images/${imageId}/set-main`, 'PUT'),
      invalidatesTags: ['Trip', 'TripImage'],
    }),
    reorderTripImages: builder.mutation<Image[], { tripId: number; order: { id: number; order: number }[] }>({
      query: ({ tripId, order }) => spoofedRequest(`/trips/${tripId}/images/reorder`, 'PUT', { order }),
      invalidatesTags: ['TripImage'],
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
      query: (id) => spoofedRequest(`/products/${id}`, 'DELETE'),
      invalidatesTags: ['Product'],
    }),

    // Blog Posts
    getMedia: builder.query<{ data: MediaItem[] }, void>({
      query: () => '/media',
    }),
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
      query: (id) => spoofedRequest(`/blog-posts/${id}`, 'DELETE'),
      invalidatesTags: ['BlogPost'],
    }),

    // Community & Ocean Initiatives
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
      query: (id) => spoofedRequest(`/social-initiatives/${id}`, 'DELETE'),
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
      query: (id) => spoofedRequest(`/events/${id}`, 'DELETE'),
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
      query: (id) => spoofedRequest(`/team-members/${id}`, 'DELETE'),
      invalidatesTags: ['TeamMember'],
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
      query: (id) => spoofedRequest(`/settings/${id}`, 'DELETE'),
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
      query: (id) => spoofedRequest(`/banners/${id}`, 'DELETE'),
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
      query: (id) => spoofedRequest(`/footer-links/${id}`, 'DELETE'),
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
      query: (id) => spoofedRequest(`/bookings/${id}`, 'DELETE'),
      invalidatesTags: ['Booking'],
    }),

    // Contact
    sendContactMessage: builder.mutation<{ message: string }, { name: string; email: string; phone?: string; message: string }>({
      query: (body) => ({
        url: '/contact',
        method: 'POST',
        body,
      }),
    }),

    // Aggregated homepage data — single request for all homepage sections
    getHomeData: builder.query<{
      banners: Banner[];
      courses: Course[];
      trips: Trip[];
      products: Product[];
      blog_posts: BlogPost[];
      events: Event[];
      team_featured: TeamMember | null;
      settings: Setting[];
      social_initiatives: SocialInitiative[];
      footer_links: FooterLink[];
    }, void>({
      query: () => '/home-data',
      providesTags: ['Course', 'Trip', 'Product', 'BlogPost', 'Event', 'Banner', 'Setting', 'SocialInitiative', 'FooterLink', 'TeamMember'],
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
  useUploadCourseImagesMutation,
  useDeleteCourseImageMutation,
  useSetCourseMainImageMutation,
  useReorderCourseImagesMutation,

  useGetTripsQuery,
  useGetTripQuery,
  useCreateTripMutation,
  useUpdateTripMutation,
  useDeleteTripMutation,
  useUploadTripImagesMutation,
  useDeleteTripImageMutation,
  useSetTripMainImageMutation,
  useReorderTripImagesMutation,

  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,

  useGetMediaQuery,
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

  useSendContactMessageMutation,

  useGetHomeDataQuery,
} = api;
