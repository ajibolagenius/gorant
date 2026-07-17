import { Metadata } from "next";
import { getPageMetadata } from "@/lib/seo/metadata";
import { getProfile } from "@/lib/db/repo";
import { friendlyNameFromId } from "@/lib/utils";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(
    { params }: { params: { id: string } }
): Promise<Metadata> {
    const id = decodeURIComponent(params.id || "").slice(0, 64);
    let displayName = friendlyNameFromId(id);
    let bio = "";
    try {
        const profile = await getProfile(id);
        if (profile?.display_name) displayName = profile.display_name;
        if (profile?.bio) bio = profile.bio;
    } catch {
        // Fall back to the deterministic name if the lookup fails.
    }
    return getPageMetadata("profile", { id, displayName, bio });
}

export default function ProfilePage({ params }: { params: { id: string } }) {
    const id = decodeURIComponent(params.id || "").slice(0, 64);
    return <ProfileClient id={id} />;
}
