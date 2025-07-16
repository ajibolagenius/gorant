// TypeScript module declaration for 'lenis' to resolve linter error

declare module 'lenis' {
    const Lenis: any;
    export default Lenis;
}

interface Rant {
    id: string;
    content: string;
    mood: string;
    created_at: string;
    likes_count: number;
    comments_count: number;
    anonymous_id: string;
    tags?: string[];
    is_trending?: boolean;
    sentiment_score?: number;
    moderation_status?: "approved" | "flagged" | "pending";
    reputation_impact?: number;
    reported?: boolean;
    moderation_score?: number;
}
