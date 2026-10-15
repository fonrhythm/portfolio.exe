import { loadSite } from "@/lib/content";
export const dynamicParams = false;
export function generateStaticParams() {
  return loadSite().screens.map((s) => {
    const [folder, ...rest] = s.path.split("/").filter(Boolean);
    return { folder, rest };
  });
}
export default function Page() { return null; }
