"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Volume2, VolumeX, Settings } from "lucide-react"
import { audioService } from "@/services/audio-service"
import { toast } from "sonner"

interface AudioSettingsProps {
    className?: string
}

export function AudioSettings({ className = "" }: AudioSettingsProps) {
    const [enabled, setEnabled] = useState(true)
    const [volume, setVolume] = useState(0.3)

    useEffect(() => {
        // Load current audio settings
        const config = audioService.getConfig()
        setEnabled(config.enabled)
        setVolume(config.volume)
    }, [])

    const handleToggleAudio = (checked: boolean) => {
        setEnabled(checked)
        audioService.setEnabled(checked)
    }

    const handleVolumeChange = (value: number[]) => {
        const newVolume = value[0]
        setVolume(newVolume)
        audioService.setVolume(newVolume)
    }

    const testSound = async () => {
        if (enabled) {
            try {
                await audioService.playActionSound('like')
            } catch (error) {
                console.warn('Audio test failed:', error)
                toast.error('Audio test failed. Please check your browser settings.')
            }
        }
    }

    return (
        <Card className={`w-full ${className}`}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Audio Settings
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Audio Toggle */}
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="audio-toggle" className="text-base">
                            Audio Feedback
                        </Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Enable sound effects for actions and moods
                        </p>
                    </div>
                    <Switch
                        id="audio-toggle"
                        checked={enabled}
                        onCheckedChange={handleToggleAudio}
                    />
                </div>

                {/* Volume Control */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="volume-slider" className="text-base">
                            Volume
                        </Label>
                        <div className="flex items-center gap-2">
                            {enabled ? (
                                <Volume2 className="w-4 h-4 text-gray-500" />
                            ) : (
                                <VolumeX className="w-4 h-4 text-gray-500" />
                            )}
                            <span className="text-sm text-gray-500">
                                {Math.round(volume * 100)}%
                            </span>
                        </div>
                    </div>
                    <Slider
                        id="volume-slider"
                        value={[volume]}
                        onValueChange={handleVolumeChange}
                        max={1}
                        min={0}
                        step={0.1}
                        disabled={!enabled}
                        className="w-full"
                    />
                </div>

                {/* Test Sound Button */}
                <div className="flex justify-center">
                    <button
                        onClick={testSound}
                        disabled={!enabled}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                        Test Sound
                    </button>
                </div>

                {/* Audio Info */}
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    <p>Audio feedback includes:</p>
                    <p>• Mood-based sounds when posting</p>
                    <p>• Action sounds for likes and achievements</p>
                    <p>• Volume and settings are saved automatically</p>
                </div>
            </CardContent>
        </Card>
    )
}
