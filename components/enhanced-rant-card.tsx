"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Heart, ChatCircle, Share, Bookmark, BookmarkSimple, Trophy, Clock } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

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

interface EnhancedRantCardProps {
  rant: Rant
  onLike: (id: string) => void
  onBookmark: (id: string) => void
  onShare: (id: string) => void
}

const moodColors = {
  angry: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
  frustrated:
    "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800",
  sad: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
  confused:
    "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
  excited:
    "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
  happy: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
}

const moodEmojis = {
  angry: "😠",
  frustrated: "😤",
  sad: "😢",
  confused: "😕",
  excited: "🤩",
  happy: "😊",
}

export function EnhancedRantCard({ rant, onLike, onBookmark, onShare }: EnhancedRantCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const shouldTruncate = rant.content.length > 200

  return (
    <Card className="group hover:shadow-md transition-all duration-200 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={rant.author.avatar || "/placeholder.svg"} alt={rant.author.username} />
              <AvatarFallback>{rant.author.username[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{rant.author.username}</span>
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                  Level {rant.author.level}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock size={12} weight="duotone" />
                {formatDistanceToNow(new Date(rant.timestamp), { addSuffix: true })}
              </div>
            </div>
          </div>
          <Badge variant="outline" className={cn("text-xs", moodColors[rant.mood])}>
            {moodEmojis[rant.mood]} {rant.mood}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <p className="text-sm leading-relaxed">
            {shouldTruncate && !isExpanded ? `${rant.content.slice(0, 200)}...` : rant.content}
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-2 text-primary hover:underline text-xs font-medium"
              >
                {isExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </p>

          {rant.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {rant.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs px-2 py-0.5 hover:bg-primary/10 cursor-pointer transition-colors"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {rant.author.badges.length > 0 && (
            <div className="flex items-center gap-1 pt-2">
              <Trophy size={12} weight="duotone" className="text-yellow-500" />
              <div className="flex flex-wrap gap-1">
                {rant.author.badges.slice(0, 2).map((badge) => (
                  <Badge
                    key={badge}
                    variant="outline"
                    className="text-xs px-1.5 py-0.5 bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800"
                  >
                    {badge}
                  </Badge>
                ))}
                {rant.author.badges.length > 2 && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                    +{rant.author.badges.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="pt-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(rant.id)}
              className={cn("h-8 px-2 gap-1.5 transition-colors", rant.isLiked && "text-red-500 hover:text-red-600")}
            >
              <Heart size={16} weight={rant.isLiked ? "fill" : "duotone"} />
              <span className="text-xs">{rant.likes}</span>
            </Button>

            <Button variant="ghost" size="sm" className="h-8 px-2 gap-1.5">
              <ChatCircle size={16} weight="duotone" />
              <span className="text-xs">{rant.comments}</span>
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onBookmark(rant.id)}
              className={cn("h-8 px-2 transition-colors", rant.isBookmarked && "text-blue-500 hover:text-blue-600")}
            >
              {rant.isBookmarked ? <BookmarkSimple size={16} weight="fill" /> : <Bookmark size={16} weight="duotone" />}
            </Button>

            <Button variant="ghost" size="sm" onClick={() => onShare(rant.id)} className="h-8 px-2">
              <Share size={16} weight="duotone" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
