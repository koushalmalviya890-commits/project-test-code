import api from "./fetch-api";



class EventService {
  //  Sample
  static async getEvent() {
    try {
      const response = await api.get("/api/event-details");
      return response;
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  }

  //filer section 

  static async searchEvents(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/api/events/search?${queryString}`);
      return response;
    } catch (error) {
      console.error("Error searching events:", error);
      throw error;
    }
  }

    // Get featured events for homepage
  static async getFeaturedEvents(limit = 6) {
    try {
      const response = await api.get(`/api/events/featured?limit=${limit}`);
      return response;
    } catch (error) {
      console.error("Error fetching featured events:", error);
      throw error;
    }
  }

  // Filter events for homepage
  static async getEventsWithFilters(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/api/events/filter?${queryString}`);
      return response;
    } catch (error) {
      console.error("Error fetching filtered events:", error);
      throw error;
    }
  }

static async getEventDetail(_id:any){
  try{
    const response = await api.get(`/api/event-details/${_id}`)
    return response ;
  }
  catch(err){
    throw err;
  }
}


  // actual post

  static async createEvent(eventData:any) {
    try {
      const response = await api.postForm(`/api/event-details`, eventData);
      return response;
    } catch (error) {
      throw error;
    }
  }



// all events by service provider 

static async getAllEventsByServiceProvider(serviceProviderId:any) {
  try {
    const response = await api.get(`/api/event-details/service-provider/${serviceProviderId}`);
    return response;
  } catch (error) {
    throw error;
  }
}

// place booking tickets
static async placeBooking(bookingData: any) {
  try {
    const response = await api.post(`/api/event/place_order`, bookingData);
    return response;
  } catch (error) {
    throw error;
  }
}


static async placeBookingFree(bookingData: any) {
  try {
    const response = await api.post(`/api/event/book-free-tickets`, bookingData);
    return response;
  } catch (error) {
    throw error;
  }
}

//verify payment
static async verifyPayment(paymentData:any) {
  try {
    const response = await api.post(`/api/event/verify_payment`, paymentData);
    return response;
  } catch (error) {
    throw error;
  }
}

static async pricingDetails(payload:any){
  try{
    const response = await api.post(`/api/event-details/pricing`, payload);
    return response;
  }
  catch(err){
    throw err;
  }
}

static async postEventFeedback(payload:any){
  try{
    const response = await api.post(`/api/event-feedback`, payload);
    return response;
  }
  catch(err){
    throw err;
  }
}

}

export default EventService;
