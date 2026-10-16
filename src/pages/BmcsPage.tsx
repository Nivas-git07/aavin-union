import { DirectoryView } from "@/components/directory/DirectoryView";
import type { DirectoryPageProps } from "@/types/navigation";

export function BmcsPage(props: DirectoryPageProps) {
  return <DirectoryView {...props} kind="bmcs" />;
}
