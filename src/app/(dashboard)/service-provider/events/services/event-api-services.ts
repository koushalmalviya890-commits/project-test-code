import api from "./fetch-api";

class EventService {
  // actual post

  static async createEvent(eventData:FormData) {
    try {
      const response = await api.postForm(`/api/event-details`, eventData);
      return response;
    } catch (error) {
      throw error;
    }
  }


 // NEW METHOD 1 - Get individual event for editing
  static async getEventForEdit(eventId: string) {
    try {
      const response = await api.get(`/api/event-details/${eventId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async sendBulkEventInvitations(formData: FormData) {
   // console.log('Calling bulk email API...');
    try {
      const response = await api.postForm('/api/events/send-bulk-invitations', formData);
     // console.log('Bulk email response:', response);
      return response;
    } catch (error) {
      console.error('Bulk email API error:', error);
      throw error;
    }
  }

  // NEW METHOD 2 - Update event
  static async updateEvent(eventId: string, eventData: FormData) {
    try {
      const response = await api.putForm(`/api/event-details/${eventId}/edit`, eventData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // NEW METHOD 3 - Delete event
  // static async deleteEvent(eventId: string) {
  //   try {
  //     const response = await api.delete(`/api/event-details/${eventId}`);
  //     return response;
  //   } catch (error) {
  //     throw error;
  //   }
  // }


// all events by service provider 

static async getAllEventsByServiceProvider(
  serviceProviderId: any,
  filters: { period?: string; startDate?: string; endDate?: string }
) {
  try {
    const queryParams = new URLSearchParams({
      ...(filters.period ? { period: filters.period } : {}),
      ...(filters.startDate ? { startDate: filters.startDate } : {}),
      ...(filters.endDate ? { endDate: filters.endDate } : {}),
    }).toString();

    const response = await api.get(
      `/api/event-details/service-provider/${serviceProviderId}?${queryParams}`
    );

    return response;
  } catch (error) {
    throw error;
  }
}






// In your EventService file
static async getBookingsByEvent(eventId: string, serviceProviderId: string) {
  try {
    const response = await api.get(`/api/booking-detail/${eventId}/service-provider/${serviceProviderId}`);
    return response;
  } catch (error) {
    throw error;
  }
}


 // Fetch feedback for a specific event and service provider
// In your EventService class
static async getFeedback(
  eventId: string, 
  serviceProviderId: string, 
  sortBy = 'newest', 
  filterBy = 'all', 
  page = 1, 
  limit = 6
) {
  try {
    const queryParams = new URLSearchParams({
      sortBy,
      filterBy,
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await api.get(
      `/api/event-feedback/${eventId}/service-provider/${serviceProviderId}?${queryParams}`
    );
    return response;
  } catch (error) {
    throw error;
  }
}

}

export default EventService;
