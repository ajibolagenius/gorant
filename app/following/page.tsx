import { Metadata } from "next";
import FollowingClient from "./FollowingClient";

export const metadata: Metadata = {
    title: "Following | Rant",
    description: "Rants from the people you follow.",
};

export default function FollowingPage() {
    return <FollowingClient />;
}
