import { TrendingClient } from "./TrendingClient"
import { Metadata } from "next"
import { getPageMetadata } from "@/lib/seo/metadata"

export const generateMetadata = async (): Promise<Metadata> {
    return getPageMetadata('trending');
}

export default function TrendingPage() {
    return <TrendingClient />
}
