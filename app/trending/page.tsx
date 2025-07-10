import { TrendingClient } from "./TrendingClient"

export const metadata = {
    title: "Trending Rants | Rant",
    description: "See what's trending in the Rant community. Discover the most popular and engaging rants right now.",
    alternates: {
        canonical: "https://gorant.live/trending"
    }
}

export default function TrendingPage() {
    return <TrendingClient />
}
