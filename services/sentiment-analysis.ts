interface SentimentResult {
  score: number // -1 to 1, where -1 is very negative, 1 is very positive
  magnitude: number // 0 to 1, intensity of emotion
  label: "positive" | "negative" | "neutral"
}

export class SentimentAnalysisService {
  private static positiveWords = [
    "happy",
    "joy",
    "love",
    "excited",
    "amazing",
    "wonderful",
    "great",
    "fantastic",
    "awesome",
    "brilliant",
    "excellent",
    "perfect",
    "beautiful",
    "grateful",
    "blessed",
    "thrilled",
    "delighted",
    "pleased",
    "satisfied",
    "content",
    "optimistic",
    "hopeful",
  ]

  private static negativeWords = [
    "sad",
    "angry",
    "hate",
    "terrible",
    "awful",
    "horrible",
    "disgusting",
    "furious",
    "depressed",
    "anxious",
    "worried",
    "scared",
    "frustrated",
    "annoyed",
    "upset",
    "disappointed",
    "devastated",
    "heartbroken",
    "miserable",
    "stressed",
    "overwhelmed",
  ]

  private static intensifiers = [
    "very",
    "extremely",
    "incredibly",
    "absolutely",
    "completely",
    "totally",
    "really",
    "quite",
    "rather",
    "pretty",
    "so",
    "too",
  ]

  static async analyzeSentiment(text: string): Promise<number> {
    const words = text.toLowerCase().split(/\s+/)
    let score = 0
    let wordCount = 0
    let intensifierMultiplier = 1

    for (let i = 0; i < words.length; i++) {
      const word = words[i].replace(/[^\w]/g, "") // Remove punctuation

      // Check for intensifiers
      if (this.intensifiers.includes(word)) {
        intensifierMultiplier = 1.5
        continue
      }

      // Check for positive words
      if (this.positiveWords.includes(word)) {
        score += 1 * intensifierMultiplier
        wordCount++
      }

      // Check for negative words
      else if (this.negativeWords.includes(word)) {
        score -= 1 * intensifierMultiplier
        wordCount++
      }

      // Reset intensifier after applying
      intensifierMultiplier = 1
    }

    // Normalize score
    if (wordCount === 0) return 0

    const normalizedScore = score / wordCount

    // Clamp between -1 and 1
    return Math.max(-1, Math.min(1, normalizedScore))
  }

  static getSentimentLabel(score: number): "positive" | "negative" | "neutral" {
    if (score > 0.1) return "positive"
    if (score < -0.1) return "negative"
    return "neutral"
  }

  static getSentimentEmoji(score: number): string {
    if (score > 0.5) return "😊"
    if (score > 0.1) return "🙂"
    if (score < -0.5) return "😢"
    if (score < -0.1) return "😐"
    return "😶"
  }

  static async batchAnalyzeSentiment(texts: string[]): Promise<number[]> {
    return Promise.all(texts.map((text) => this.analyzeSentiment(text)))
  }
}
