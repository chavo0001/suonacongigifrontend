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
}

export interface EventRequest {
  title:       string;
  description: string;
  eventDate:   string;
  location:    string;
  maxSeats:    number;
}