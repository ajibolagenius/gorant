import { Metadata } from "next";
import GroupsClient from "./GroupsClient";

export const metadata: Metadata = {
    title: "Groups | Rant",
    description: "Find your people. Join topic groups and rant together.",
};

export default function GroupsPage() {
    return <GroupsClient />;
}
