import { redirect } from "next/navigation";

export const instant = false;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  redirect(`/shop?category=${encodeURIComponent(slug)}`);
}
