import { FeedbackData } from '@/types/feedback';

export const decodeUrlParams = (encodedData: string): FeedbackData | null => {
  try {
    const decodedString = Buffer.from(encodedData, 'base64').toString('utf-8');
    const data = JSON.parse(decodedString);
    
    // Validate required fields
    if (!data.username || !data.email || !data.serviceProviderId || !data.eventId) {
      throw new Error('Missing required fields');
    }
    
    return {
      username: data.username,
      email: data.email,
      serviceProviderId: data.serviceProviderId,
      eventId: data.eventId,
      eventTitle: data.eventTitle || 'Event'
    };
  } catch (error) {
    console.error('Error decoding URL parameters:', error);
    return null;
  }
};

export const encodeUrlParams = (data: FeedbackData): string => {
  try {
    const encodedString = Buffer.from(JSON.stringify(data)).toString('base64');
    return encodedString;
  } catch (error) {
    console.error('Error encoding URL parameters:', error);
    return '';
  }
};
