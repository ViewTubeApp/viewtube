import { CreateCategoryDialog } from "../_components/dialog";

interface EditCategoryDialogPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryDialogPage({ params }: EditCategoryDialogPageProps) {
  const { id } = await params;
  return <CreateCategoryDialog categoryId={id} />;
}
