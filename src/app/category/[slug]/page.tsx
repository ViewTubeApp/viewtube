import { loadVideoList } from "@/queries/server/load-video-list";
import { type Metadata } from "next";

import { publicVideoListQueryOptions } from "@/constants/query";

import { VideoGrid } from "@/components/video-grid";

export const metadata: Metadata = {
  title: "Category",
};

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const videos = await loadVideoList({ ...publicVideoListQueryOptions, categorySlug: slug });
  return <VideoGrid categorySlug={slug} videos={videos} />;
}
