export interface EventResponse {
  id:                       number;
  title:                    string;
  description:              string;
  eventDate:                string;
  location:                 string;
  maxSeats:                 number;
  seatsBooked:              number;
  seatsAvailable:           number;
  createdBy:                string;
  registeredByCurrentUser:  boolean;
  status: string;
  likeCount?:               number;
  likedByCurrentUser?:      boolean;
}

export interface EventRequest {
  title:       string;
  description: string;
  eventDate:   string;
  location:    string;
  maxSeats:    number;
}

export interface EventLikeResponse {
  eventId:              number;
  likeCount:            number;
  likedByCurrentUser:   boolean;
}
