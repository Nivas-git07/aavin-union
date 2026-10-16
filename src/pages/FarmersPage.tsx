import { DirectoryView } from "@/components/directory/DirectoryView";
import type { DirectoryPageProps } from "@/types/navigation";

export function FarmersPage(props: DirectoryPageProps) {
  return <DirectoryView {...props} kind="farmers" />;
}
