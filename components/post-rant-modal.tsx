"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, X } from "lucide-react"
import { audioService } from "@/services/audio-service"
import { useNotifications, notificationHelpers } from "@/hooks/use-notifications"

interface Mood {
    icon: React.ElementType
    label: string
    value: string
    color: string
}

interface PostRantModalProps {
    isOpen: boolean
    onClose: () => void
    moods: Mood[]
    onSubmit: (content: string, mood: string, tags: string[]) => void
}

export function PostRantModal({ isOpen, onClose, moods, onSubmit }: PostRantModalProps) {
    const [content, setContent] = useState("")
    const [selectedMood, setSelectedMood] = useState("")
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState("")
    const [cooldown, setCooldown] = useState(0)
    const { addNotification } = useNotifications()

    // Cooldown logic
    useEffect(() => {
        if (!isOpen) return
        const lastPost = localStorage.getItem("lastRantPost")
        if (lastPost) {
            const diff = 10 - Math.floor((Date.now() - Number(lastPost)) / 1000)
            if (diff > 0) setCooldown(diff)
        }
    }, [isOpen])

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [cooldown])

    const handleSubmit = () => {
        if (!content.trim() || !selectedMood || cooldown > 0) return
        audioService.playMoodSound(selectedMood)
        audioService.playActionSound('post')
        onSubmit(content.trim(), selectedMood, tags)
        // Set cooldown
        localStorage.setItem("lastRantPost", Date.now().toString())
        setCooldown(10)
        // Trigger achievement notifications (demo)
        const rantCount = parseInt(localStorage.getItem("rantCount") || "0") + 1
        localStorage.setItem("rantCount", rantCount.toString())

        if (rantCount === 1) {
            addNotification(notificationHelpers.achievement("first-rant", "First Rant"))
        } else if (rantCount === 10) {
            addNotification(notificationHelpers.achievement("10-rants", "Rant Master"))
        } else if (rantCount === 50) {
            addNotification(notificationHelpers.achievement("50-rants", "Rant Legend"))
        }

        // Reset form
        setContent("")
        setSelectedMood("")
        setTags([])
        setTagInput("")
        onClose()
    }

    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
            setTags([...tags, tagInput.trim().toLowerCase()])
            setTagInput("")
        }
    }

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove))
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Share Your Thoughts</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Content Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            What's on your mind?
                        </label>
                        <Textarea
                            placeholder="Let it all out... Your thoughts are safe here."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="min-h-[120px] resize-none border-gray-200 dark:border-gray-600 focus:border-purple-400 dark:bg-gray-700 dark:text-white"
                            maxLength={1000}
                        />
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">{content.length}/1000 characters</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">Anonymous • Safe • Private</span>
                        </div>
                    </div>

                    {/* Mood Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            How are you feeling?
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {moods.map((mood) => (
                                <Button
                                    key={mood.value}
                                    variant={selectedMood === mood.value ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedMood(mood.value)}
                                    className={`${selectedMood === mood.value
                                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                                        : "hover:bg-purple-50 dark:hover:bg-purple-900"
                                        } justify-start`}
                                >
                                    <mood.icon weight="duotone" className={`w-5 h-5 mr-2 ${mood.color.replace(/bg-[^ ]+/, '').replace('text-', 'text-')}`} />
                                    {mood.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags (optional)</label>
                        <div className="flex gap-2 mb-2">
                            <Input
                                placeholder="Add a tag..."
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault()
                                        addTag()
                                    }
                                }}
                                className="flex-1 border-gray-200 dark:border-gray-600 focus:border-purple-400 dark:bg-gray-700 dark:text-white"
                                maxLength={20}
                            />
                            <Button type="button" variant="outline" onClick={addTag} disabled={!tagInput.trim() || tags.length >= 5}>
                                Add
                            </Button>
                        </div>
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {tags.map((tag, index) => (
                                    <Badge
                                        key={index}
                                        variant="secondary"
                                        className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                    >
                                        #{tag}
                                        <button onClick={() => removeTag(tag)} className="ml-1 hover:text-purple-600">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Tags help others find and relate to your rant. Max 5 tags.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!content.trim() || !selectedMood || cooldown > 0}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            {cooldown > 0 ? `Wait ${cooldown}s` : "Post Rant"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
