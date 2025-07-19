import {
    Smiley,
    SmileySad,
    SmileyMeh,
    SmileyNervous,
    Heart,
    HeartBreak,
    Cloud,
    Confetti,
    SmileySticker
} from "@phosphor-icons/react"

export interface MoodConfig {
    icon: React.ComponentType<any>
    emoji: string
    label: string
    value: string
    color: string
    description?: string
}

export class MoodFactory {
    private static readonly moodConfigs: Record<string, Omit<MoodConfig, 'value'>> = {
        sad: {
            icon: SmileySad,
            emoji: "😢",
            label: "Sad",
            color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
            description: "Feeling down or melancholy"
        },
        crying: {
            icon: SmileySad,
            emoji: "😭",
            label: "Crying",
            color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
            description: "Overwhelmed with sadness"
        },
        happy: {
            icon: Smiley,
            emoji: "😊",
            label: "Happy",
            color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
            description: "Feeling joyful and content"
        },
        // ... other moods
    }

    static getAllMoods(): MoodConfig[] {
        return Object.entries(this.moodConfigs).map(([value, config]) => ({
            ...config,
            value
        }))
    }

    static getMood(value: string): MoodConfig | null {
        const config = this.moodConfigs[value]
        return config ? { ...config, value } : null
    }

    static getMoodColor(value: string): string {
        return this.moodConfigs[value]?.color || 'bg-gray-100 text-gray-800'
    }
}
