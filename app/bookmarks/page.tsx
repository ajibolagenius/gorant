import { Metadata } from "next";
import { getPageMetadata } from "@/lib/seo/metadata";
import BookmarksClient from "./BookmarksClient";

export const generateMetadata = async (): Promise<Metadata> => {
    return getPageMetadata('bookmarks');
};

export default function BookmarksPage() {
    return <BookmarksClient />;
}
