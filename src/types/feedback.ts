export interface FeedbackData {
  username: string;
  email: string;
  serviceProviderId: string;
  eventId: string;
  eventTitle: string;
}

export interface FeedbackPayload {
  eventId: string;
  serviceProviderId: string;
  name: string;
  email: string;
  rating: number;
  comments: string;
}

export interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}
