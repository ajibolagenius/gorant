interface ModerationResult {
  isAppropriate: boolean
  reason?: string
  confidence: number
  categories: string[]
}

export class ContentModerationService {
  private static bannedWords = [
    "spam",
    "scam",
    "hate",
    "violence",
    "harassment",
    "bullying",
    "discrimination",
    "threat",
    "abuse",
    "explicit",
  ]

  private static suspiciousPatterns = [
    /(.)\1{4,}/g, // Repeated characters
    /[A-Z]{10,}/g, // Excessive caps
    /\b\d{10,}\b/g, // Long numbers (potential phone/ID)
    /https?:\/\/[^\s]+/g, // URLs
  ]

  static async moderateContent(content: string): Promise<ModerationResult> {
    const lowerContent = content.toLowerCase()
    const result: ModerationResult = {
      isAppropriate: true,
      confidence: 0.9,
      categories: [],
    }

    // Check for banned words
    for (const word of this.bannedWords) {
      if (lowerContent.includes(word)) {
        result.isAppropriate = false
        result.reason = `Contains inappropriate content: ${word}`
        result.categories.push("inappropriate_language")
        break
      }
    }

    // Check for suspicious patterns
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(content)) {
        result.confidence *= 0.8
        if (pattern === this.suspiciousPatterns[0]) {
          result.categories.push("spam_like")
        } else if (pattern === this.suspiciousPatterns[1]) {
          result.categories.push("excessive_caps")
        } else if (pattern === this.suspiciousPatterns[2]) {
          result.categories.push("personal_info")
        } else if (pattern === this.suspiciousPatterns[3]) {
          result.categories.push("external_links")
        }
      }
    }

    // Length checks
    if (content.length < 10) {
      result.categories.push("too_short")
      result.confidence *= 0.7
    }

    if (content.length > 1000) {
      result.categories.push("too_long")
      result.confidence *= 0.8
    }

    // If confidence is too low, flag for review
    if (result.confidence < 0.6 && result.isAppropriate) {
      result.isAppropriate = false
      result.reason = "Content flagged for manual review"
      result.categories.push("needs_review")
    }

    return result
  }

  static async reportContent(contentId: string, reason: string, reporterId: string): Promise<boolean> {
    // In a real app, this would send to a moderation queue
    console.log(`Content ${contentId} reported by ${reporterId} for: ${reason}`)
    return true
  }

  static calculateReputationImpact(moderationResult: ModerationResult): number {
    if (!moderationResult.isAppropriate) {
      return -5 // Negative impact for inappropriate content
    }

    if (moderationResult.categories.includes("spam_like")) {
      return -2
    }

    if (moderationResult.categories.includes("excessive_caps")) {
      return -1
    }

    return 0 // No impact for clean content
  }
}
