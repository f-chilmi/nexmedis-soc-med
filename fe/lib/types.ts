// User related types
export interface User {
  id: string;
  email: string;
  username: string;
  profilePicture?: string;
  createdAt: string;
}

export interface AuthUser extends User {
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username: string;
}

// Post related types
export interface Post {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  user: User;
  comment_count: number;
  like_count: number;
  is_liked: boolean;

  comments?: Comment[];
}

export interface PostResponse {
  posts: Post[];
  totalPosts: number;
  currentPage: number;
  totalPages: number;
}

export interface PostFormData {
  title: string;
  content: string;
  image?: File;
}

// Comment related types
export interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user: User;
}

export interface CommentFormData {
  content: string;
  postId: string;
}

export interface LikeFormData {
  postId: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
