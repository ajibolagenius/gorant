import { Metadata } from "next";
import { getGroup } from "@/lib/db/repo";
import GroupDetailClient from "./GroupDetailClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(
    { params }: { params: { id: string } }
): Promise<Metadata> {
    const id = decodeURIComponent(params.id || "").slice(0, 64);
    try {
        const group = await getGroup(id);
        if (group) {
            return {
                title: `${group.name} | Rant Groups`,
                description: group.description || `Join the ${group.name} group on Rant.`,
            };
        }
    } catch {
        // Fall through to the default.
    }
    return { title: "Group | Rant" };
}

export default function GroupDetailPage({ params }: { params: { id: string } }) {
    const id = decodeURIComponent(params.id || "").slice(0, 64);
    return <GroupDetailClient id={id} />;
}
