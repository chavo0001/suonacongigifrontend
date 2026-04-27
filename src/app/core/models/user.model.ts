export interface Genre {
  id:   number;
  name: string;
}

export interface Instrument {
  id:   number;
  name: string;
}

export interface Artist {
  id:   number;
  name: string;
}

export interface MusicalProfile {
  bio:             string;
  genres:          Genre[];
  instruments:     Instrument[];
  favoriteArtists: Artist[];
}

export interface MusicalProfileDto {
  bio:            string;
  genreIds:       number[];
  instrumentIds:  number[];
  artistIds:      number[];
}

export interface UserProfile {
  id:               number;
  username:         string;
  email:            string;
  role:             string;
  musicalProfile?:  MusicalProfile;
}