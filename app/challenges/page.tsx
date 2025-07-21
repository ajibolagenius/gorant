import { Metadata } from "next";
import { getPageMetadata } from "@/lib/seo/metadata";
import ChallengeClient from "./ChallengeClient";

export const generateMetadata = async (): Promise<Metadata> => {
    return getPageMetadata('challenge', {
        title: "Rant Challenges",
        description: "Join community challenges, share your story, and earn badges on Rant."
    });
};

export default function ChallengePage() {
    return <ChallengeClient />;
}
