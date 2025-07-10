"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PostRantModal } from "@/components/post-rant-modal"
import { FilterPanel } from "@/components/filter-panel"
import { GamificationPanel } from "@/components/gamification-panel"
import { EnhancedRantCard } from "@/components/enhanced-rant-card"
import { MasonryGrid } from "@/components/masonry-grid"
import { InfiniteScroll } from "@/components/infinite-scroll"
import { Plus, TrendingUp, Clock, Heart } from "@phosphor-icons/react"
import { toast } from "sonner"

interface Rant {
  id: string
  content: string
  mood: "angry" | "frustrated" | "sad" | "confused" | "excited" | "happy"
  tags: string[]
  timestamp: string
  likes: number
  comments: number
  isLiked: boolean
  isBookmarked: boolean
  author: {
    id: string
    username: string
    avatar: string
    level: number
    badges: string[]
  }
}

const SAMPLE_RANTS: Rant[] = [
  {
    id: "1",
    content:
      "Why do people think it's okay to play music loudly on public transport? Some of us are trying to have a peaceful commute!",
    mood: "frustrated",
    tags: ["public-transport", "etiquette", "daily-life"],
    timestamp: "2024-01-10T10:30:00Z",
    likes: 24,
    comments: 8,
    isLiked: false,
    isBookmarked: false,
    author: {
      id: "user1",
      username: "CommuterRage",
      avatar: "/placeholder-user.jpg",
      level: 5,
      badges: ["Frequent Ranter", "Community Helper"],
    },
  },
  {
    id: "2",
    content:
      "Just discovered my favorite coffee shop is closing down after 15 years. This neighborhood is losing all its character to chain stores!",
    mood: "sad",
    tags: ["local-business", "community", "change"],
    timestamp: "2024-01-10T09:15:00Z",
    likes: 42,
    comments: 15,
    isLiked: true,
    isBookmarked: true,
    author: {
      id: "user2",
      username: "CoffeeLover",
      avatar: "/placeholder-user.jpg",
      level: 8,
      badges: ["Local Expert", "Thoughtful Contributor"],
    },
  },
  {
    id: "3",
    content:
      "Technology is supposed to make our lives easier, but I just spent 2 hours trying to update my phone and now half my apps don't work!",
    mood: "angry",
    tags: ["technology", "frustration", "updates"],
    timestamp: "2024-01-10T08:45:00Z",
    likes: 67,
    comments: 23,
    isLiked: false,
    isBookmarked: false,
    author: {
      id: "user3",
      username: "TechStruggler",
      avatar: "/placeholder-user.jpg",
      level: 3,
      badges: ["New Member"],
    },
  },
  {
    id: "4",
    content:
      "Why do streaming services keep removing shows just when you're about to watch them? It's like they know exactly what you want to see!",
    mood: "confused",
    tags: ["streaming", "entertainment", "timing"],
    timestamp: "2024-01-10T07:20:00Z",
    likes: 89,
    comments: 34,
    isLiked: true,
    isBookmarked: false,
    author: {
      id: "user4",
      username: "StreamingVictim",
      avatar: "/placeholder-user.jpg",
      level: 6,
      badges: ["Entertainment Expert", "Popular Poster"],
    },
  },
  {
    id: "5",
    content:
      "Finally finished that project I've been procrastinating on for weeks! Sometimes the best motivation is a looming deadline.",
    mood: "excited",
    tags: ["productivity", "achievement", "procrastination"],
    timestamp: "2024-01-10T06:30:00Z",
    likes: 156,
    comments: 45,
    isLiked: true,
    isBookmarked: true,
    author: {
      id: "user5",
      username: "ProductivityGuru",
      avatar: "/placeholder-user.jpg",
      level: 12,
      badges: ["Motivational Speaker", "Achievement Hunter", "Community Leader"],
    },
  },
]

export default function Page() {
  const [rants, setRants] = useState<Rant[]>(SAMPLE_RANTS)
  const [filteredRants, setFilteredRants] = useState<Rant[]>(SAMPLE_RANTS)
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "trending">("recent")
  const [selectedMoods, setSelectedMoods] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Filter and sort rants
  useEffect(() => {
    let filtered = [...rants]

    // Filter by mood
    if (selectedMoods.length > 0) {
      filtered = filtered.filter((rant) => selectedMoods.includes(rant.mood))
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((rant) => rant.tags.some((tag) => selectedTags.includes(tag)))
    }

    // Sort
    switch (sortBy) {
      case "popular":
        filtered.sort((a, b) => b.likes - a.likes)
        break
      case "trending":
        filtered.sort((a, b) => b.likes + b.comments - (a.likes + a.comments))
        break
      case "recent":
      default:
        filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        break
    }

    setFilteredRants(filtered)
  }, [rants, selectedMoods, selectedTags, sortBy])

  const handleLike = (rantId: string) => {
    setRants((prev) =>
      prev.map((rant) =>
        rant.id === rantId
          ? {
              ...rant,
              isLiked: !rant.isLiked,
              likes: rant.isLiked ? rant.likes - 1 : rant.likes + 1,
            }
          : rant,
      ),
    )
  }

  const handleBookmark = (rantId: string) => {
    setRants((prev) => prev.map((rant) => (rant.id === rantId ? { ...rant, isBookmarked: !rant.isBookmarked } : rant)))
  }

  const handleShare = (rantId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/rant/${rantId}`)
    toast.success("Link copied to clipboard!")
  }

  const handlePostRant = (content: string, mood: string, tags: string[]) => {
    const newRant: Rant = {
      id: Date.now().toString(),
      content,
      mood: mood as Rant["mood"],
      tags,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      isLiked: false,
      isBookmarked: false,
      author: {
        id: "current-user",
        username: "You",
        avatar: "/placeholder-user.jpg",
        level: 1,
        badges: ["New Member"],
      },
    }

    setRants((prev) => [newRant, ...prev])
    setIsPostModalOpen(false)
    toast.success("Rant posted successfully!")
  }

  const loadMoreRants = () => {
    // Simulate loading more rants
    const additionalRants = SAMPLE_RANTS.map((rant) => ({
      ...rant,
      id: `${rant.id}-${Date.now()}`,
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    }))

    setRants((prev) => [...prev, ...additionalRants])
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Rant
            </h1>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Anonymous Venting
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy("recent")}
              className={sortBy === "recent" ? "bg-primary/10" : ""}
            >
              <Clock size={16} weight="duotone" />
              Recent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy("popular")}
              className={sortBy === "popular" ? "bg-primary/10" : ""}
            >
              <Heart size={16} weight="duotone" />
              Popular
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy("trending")}
              className={sortBy === "trending" ? "bg-primary/10" : ""}
            >
              <TrendingUp size={16} weight="duotone" />
              Trending
            </Button>
            <Button onClick={() => setIsPostModalOpen(true)}>
              <Plus size={16} weight="duotone" />
              Post Rant
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <GamificationPanel />
            <FilterPanel
              selectedMoods={selectedMoods}
              selectedTags={selectedTags}
              onMoodChange={setSelectedMoods}
              onTagChange={setSelectedTags}
              onClearFilters={() => {
                setSelectedMoods([])
                setSelectedTags([])
              }}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp size={20} weight="duotone" />
                    Rant Feed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Share your thoughts anonymously and connect with others who understand.
                    {filteredRants.length !== rants.length && (
                      <span className="ml-2 text-sm">
                        Showing {filteredRants.length} of {rants.length} rants
                      </span>
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>

            <InfiniteScroll
              hasMore={true}
              loadMore={loadMoreRants}
              loader={<div className="text-center py-4">Loading more rants...</div>}
            >
              <MasonryGrid>
                {filteredRants.map((rant) => (
                  <EnhancedRantCard
                    key={rant.id}
                    rant={rant}
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                    onShare={handleShare}
                  />
                ))}
              </MasonryGrid>
            </InfiniteScroll>

            {filteredRants.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-muted-foreground mb-4">No rants match your current filters.</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedMoods([])
                      setSelectedTags([])
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <footer className="sticky bottom-0 z-40 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-12 items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>© 2024 Rant</span>
            <Separator orientation="vertical" className="h-4" />
            <a href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {rants.length} Total Rants
            </Badge>
          </div>
        </div>
      </footer>

      <PostRantModal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} onPost={handlePostRant} />
    </div>
  )
}
