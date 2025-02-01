import { CreateModelDialog } from "../_components/dialog";

interface EditModelDialogPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditModelDialogPage({ params }: EditModelDialogPageProps) {
  const { id } = await params;
  return <CreateModelDialog modelId={id} />;
}
