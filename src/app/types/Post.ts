export interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  categories: { id: string; name: string }[];
  thumbnailImageKey?: string;
  thumbnail?: { url: string; height: number; width: number };
}
