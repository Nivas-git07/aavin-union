import { DirectoryView } from "@/components/directory/DirectoryView";
import type { DirectoryPageProps } from "@/types/navigation";

export function SocietiesPage(props: DirectoryPageProps) {
  return <DirectoryView {...props} kind="societies" />;
}
