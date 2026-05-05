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
  // LIKe Stato persistente del cuore per l'utente corrente.
  likedByCurrentUser?:      boolean;
  // LIKe Conteggio like restituito dagli endpoint dedicati.
  likeCount?:               number;
}

// LIKe Risposta degli endpoint dedicati ai like degli eventi.
export interface EventLikeResponse {
  eventId:                  number;
  likeCount:                number;
  likedByCurrentUser:       boolean;
}

export interface EventRequest {
  title:       string;
  description: string;
  eventDate:   string;
  location:    string;
  maxSeats:    number;
}
