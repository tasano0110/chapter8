export interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  categories: { id: string; name: string }[];
  thumbnail?: { url: string; height: number; width: number };
}
