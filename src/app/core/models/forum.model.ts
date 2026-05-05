export interface CategoryResponse {
  id:          number;
  name:        string;
  description: string;
  threadCount: number;
}

export interface ThreadSummary {
  id:             number;
  title:          string;
  categoryName:   string;
  authorUsername: string;
  postCount:      number;
  createdAt:      string;
}

export interface PostResponse {
  id:             number;
  authorName: string;
  content:        string;
  createdAt:      string;
}


export interface ThreadDetail {
  id:             number;
  title:          string;
  categoryName:   string;
  createdAt:      string;
  posts:          PostResponse[];
}

export interface ThreadRequest { 
    title: string; 
    categoryId: number; 
}


export interface PostRequest { 
    content: string; 
}