export const metadata = {
    title: "Bookmarked Rants | Rant",
    description: "View all your bookmarked rants in one place. Easily revisit your favorite posts on Rant.",
    alternates: {
        canonical: "https://gorant.live/bookmarks"
    }
}

import BookmarksClient from "./BookmarksClient"

export default function BookmarksPage() {
    return <BookmarksClient />
}
