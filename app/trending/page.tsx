import { Metadata } from "next";
import { getPageMetadata } from "@/lib/seo/metadata";
import TrendingClient from "./TrendingClient";

export const generateMetadata = async (): Promise<Metadata> => {
    return getPageMetadata('trending');
};

export default function TrendingPage() {
    return <TrendingClient />;
}
