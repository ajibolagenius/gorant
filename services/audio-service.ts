interface AudioConfig {
    volume: number
    enabled: boolean
}

class AudioService {
    private config: AudioConfig = {
        volume: 0.3,
        enabled: true
    }
    private audioContext: AudioContext | null = null

    constructor() {
        this.loadConfig()
        // Only initialize audio context after a user gesture to comply with browser autoplay policy
        if (typeof window !== 'undefined') {
            document.addEventListener(
                'click',
                () => {
                    if (!this.audioContext) {
                        this.initializeAudioContext();
                    }
                },
                { once: true }
            );
        }
    }

    private initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
            // Resume audio context if it's suspended (browser autoplay policy)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume()
            }
        } catch (error) {
            console.warn('Audio context not supported, audio feedback disabled')
            this.config.enabled = false
        }
    }

    private loadConfig() {
        if (typeof window !== 'undefined') {
            const savedConfig = localStorage.getItem('audioConfig')
            if (savedConfig) {
                this.config = { ...this.config, ...JSON.parse(savedConfig) }
            }
        }
    }

    private saveConfig() {
        if (typeof window !== 'undefined') {
            localStorage.setItem('audioConfig', JSON.stringify(this.config))
        }
    }

    // Generate a simple tone using Web Audio API
    private async generateTone(frequency: number, duration: number = 0.2) {
        if (!this.audioContext || !this.config.enabled) {
            console.log('Audio context not available or disabled')
            return
        }

        try {
            // Resume audio context if suspended
            if (this.audioContext.state === 'suspended') {
                console.log('Resuming suspended audio context')
                await this.audioContext.resume()
            }

            console.log(`Generating tone: ${frequency}Hz for ${duration}s at volume ${this.config.volume}`)

            const oscillator = this.audioContext.createOscillator()
            const gainNode = this.audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(this.audioContext.destination)

            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
            oscillator.type = 'sine'

            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
            gainNode.gain.linearRampToValueAtTime(this.config.volume * 0.3, this.audioContext.currentTime + 0.01)
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.01 + duration)

            oscillator.start(this.audioContext.currentTime)
            oscillator.stop(this.audioContext.currentTime + duration)
        } catch (error) {
            console.warn('Failed to play audio:', error)
        }
    }

    // Play mood-based sound
    async playMoodSound(mood: string) {
        if (!this.config.enabled) return

        // Ensure audio context is initialized
        await this.initializeAudioOnInteraction()

        const frequencies: { [key: string]: number } = {
            happy: 523.25, // C5
            love: 659.25,  // E5
            neutral: 440,   // A4
            sad: 349.23,    // F4
            angry: 277.18,  // C#4
            anxious: 311.13, // D#4
            confused: 392,   // G4
            tired: 329.63,   // E4
            crying: 293.66,  // D4
            heartbroken: 261.63 // C4
        }

        const frequency = frequencies[mood.toLowerCase()] || 440
        console.log(`Playing mood sound: ${mood} (${frequency}Hz)`)
        await this.generateTone(frequency, 0.3)
    }

    // Play action sound
    async playActionSound(action: 'like' | 'post' | 'achievement' | 'bookmark' | 'tag' | 'comment') {
        if (!this.config.enabled) return

        // Ensure audio context is initialized
        await this.initializeAudioOnInteraction()

        const frequencies: { [key: string]: number } = {
            like: 523.25,     // C5
            post: 659.25,     // E5
            achievement: 783.99, // G5
            bookmark: 440,   // A4
            tag: 392,   // G4
            comment: 349.23    // F4
        }

        const frequency = frequencies[action] || 440
        console.log(`Playing action sound: ${action} (${frequency}Hz)`)
        await this.generateTone(frequency, 0.4)
    }

    // Set volume (0.0 to 1.0)
    setVolume(volume: number) {
        this.config.volume = Math.max(0, Math.min(1, volume))
        this.saveConfig()
    }

    // Enable/disable audio
    setEnabled(enabled: boolean) {
        this.config.enabled = enabled
        this.saveConfig()

        // Initialize audio context if enabling and not already initialized
        if (enabled && !this.audioContext && typeof window !== 'undefined') {
            this.initializeAudioContext()
        }
    }

    // Force initialize audio context (useful for user interaction)
    async initializeAudioOnInteraction() {
        if (!this.audioContext && typeof window !== 'undefined') {
            this.initializeAudioContext()
        }
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume()
        }
    }

    // Get current volume
    getVolume(): number {
        return this.config.volume
    }

    // Check if audio is enabled
    isEnabled(): boolean {
        return this.config.enabled
    }

    // Get audio config
    getConfig(): AudioConfig {
        return { ...this.config }
    }
}

// Export singleton instance
export const audioService = new AudioService()

// Export types
export type { AudioConfig }
