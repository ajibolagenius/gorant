import { supabase } from '@/lib/supabaseClient'
import { Rant, Comment } from '@/components/enhanced-rant-card'
import { normalizeRant, getAnonymousId } from '@/lib/utils'
import { ContentModerationService } from './content-moderation'

export interface RantFilters {
    mood?: string
    tags?: string[]
    sortBy?: 'latest' | 'popular' | 'most_liked'
    limit?: number
    offset?: number
}

export interface RantOperationResult<T = unknown> {
    success: boolean
    data?: T
    error?: string
    code?: 'VALIDATION_ERROR' | 'NETWORK_ERROR' | 'PERMISSION_ERROR' | 'UNKNOWN_ERROR'
}

export class RantService {
    static async fetchRants(filters: RantFilters = {}): Promise<RantOperationResult<Rant[]>> {
        try {
            let query = supabase
                .from('rants')
                .select('id, content, mood, likes_count, comments_count, anonymous_id, created_at, tags')

            // Apply filters
            if (filters.mood) {
                query = query.eq('mood', filters.mood)
            }

            // Apply sorting
            switch (filters.sortBy) {
                case 'popular':
                    query = query.order('likes_count', { ascending: false })
                    break
                case 'most_liked':
                    query = query.order('likes_count', { ascending: false })
                    break
                default:
                    query = query.order('created_at', { ascending: false })
            }

            // Apply pagination
            if (filters.limit) {
                query = query.limit(filters.limit)
            }
            if (filters.offset) {
                query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
            }

            const { data, error } = await query

            if (error) throw error

            const normalizedRants = (data || []).map(normalizeRant)

            return {
                success: true,
                data: normalizedRants
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch rants',
                code: 'NETWORK_ERROR'
            }
        }
    }

    static async createRant(content: string, mood: string, tags: string[] = []): Promise<RantOperationResult<Rant>> {
        try {
            // Content moderation
            const moderationResult = await ContentModerationService.moderateContent(content)
            if (!moderationResult.isAppropriate) {
                return {
                    success: false,
                    error: `Content flagged: ${moderationResult.reason}`,
                    code: 'VALIDATION_ERROR'
                }
            }

            const { data, error } = await supabase
                .from('rants')
                .insert([{
                    content: content.trim(),
                    mood,
                    tags,
                    anonymous_id: getAnonymousId(),
                    created_at: new Date().toISOString()
                }])
                .select()
                .single()

            if (error) throw error

            return {
                success: true,
                data: normalizeRant(data)
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create rant',
                code: 'NETWORK_ERROR'
            }
        }
    }

    static async likeRant(rantId: string): Promise<RantOperationResult<void>> {
        try {
            // Get current likes count
            const { data: currentRant, error: fetchError } = await supabase
                .from('rants')
                .select('likes_count')
                .eq('id', rantId)
                .single()

            if (fetchError) throw fetchError

            // Update likes count
            const { error } = await supabase
                .from('rants')
                .update({ likes_count: (currentRant.likes_count || 0) + 1 })
                .eq('id', rantId)

            if (error) throw error

            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to like rant'
            }
        }
    }

    static async fetchComments(rantIds: string[]): Promise<RantOperationResult<{ [key: string]: Comment[] }>> {
        try {
            if (!rantIds.length) {
                return { success: true, data: {} }
            }

            const { data, error } = await supabase
                .from('comments')
                .select('id, rant_id, content, created_at, anonymous_id, likes_count')
                .in('rant_id', rantIds)
                .order('created_at', { ascending: false })

            if (error) throw error

            // Group comments by rant_id
            const grouped: { [key: string]: Comment[] } = {}
            for (const comment of data || []) {
                if (!grouped[comment.rant_id]) {
                    grouped[comment.rant_id] = []
                }
                grouped[comment.rant_id].push(comment)
            }

            return {
                success: true,
                data: grouped
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch comments'
            }
        }
    }
}
