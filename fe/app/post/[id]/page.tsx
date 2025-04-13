import { getPost } from "@/app/actions/postActions";

import NotFound from "@/app/components/post/PostNotFound";
import PostDetailView from "./PostDetailView";

interface PostDetailPageProps {
  params: { id: string };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const response = await getPost(params.id);

  if (!response.success || !response.data) return <NotFound />;

  const post = response.data;

  return <PostDetailView post={post} />;
}
