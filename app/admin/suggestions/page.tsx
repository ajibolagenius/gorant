"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AdminNavigation } from "@/components/analytics/admin-navigation"
import { LightbulbFilament, MagnifyingGlass, Funnel, SortAscending, CaretDown } from "@phosphor-icons/react"
import { useRouter } from 'next/navigation'
import { useAdminProtection } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

// Status badge colors
const statusColors: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    'approved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
    'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    'completed': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    'rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
}

// Priority badge colors
const priorityColors: Record<string, string> = {
    'Critical': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
    'High': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    'Medium': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    'Low': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800',
    'Not important': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800',
}

// Category badge colors
const categoryColors: Record<string, string> = {
    'Feature': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
    'Bug': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
    'Enhancement': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    'Documentation': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800',
}

// Suggestion type definition
type Suggestion = {
    id: string;
    title: string;
    description: string;
    votes_up: number;
    votes_down: number;
    status: string;
    created_at: string;
    category: string;
    priority: string;
    admin_notes?: string;
}

export default function SuggestionsAdmin() {
    const router = useRouter()
    const isAuthorized = useAdminProtection(router)
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [priorityFilter, setPriorityFilter] = useState('all')
    const [sortBy, setSortBy] = useState('newest')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editStatus, setEditStatus] = useState('')
    const [editPriority, setEditPriority] = useState('')
    const [editAdminNotes, setEditAdminNotes] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)

    const ITEMS_PER_PAGE = 10

    // Fetch suggestions
    const fetchSuggestions = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('suggestions')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching suggestions:', error)
                toast({
                    title: 'Error',
                    description: 'Failed to load suggestions. Please try again.',
                    variant: 'destructive',
                })
            } else {
                setSuggestions(data || [])
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error)
        } finally {
            setLoading(false)
        }
    }

    // Initial data fetch
    useEffect(() => {
        if (isAuthorized) {
            fetchSuggestions()
        }
    }, [isAuthorized])

    // Filter and sort suggestions
    const filteredSuggestions = suggestions.filter(suggestion => {
        // Search filter
        const matchesSearch = searchQuery === '' ||
            suggestion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            suggestion.description.toLowerCase().includes(searchQuery.toLowerCase())

        // Status filter
        const matchesStatus = statusFilter === 'all' || suggestion.status === statusFilter

        // Category filter
        const matchesCategory = categoryFilter === 'all' || suggestion.category === categoryFilter

        // Priority filter
        const matchesPriority = priorityFilter === 'all' || suggestion.priority === priorityFilter

        return matchesSearch && matchesStatus && matchesCategory && matchesPriority
    })

    // Sort suggestions
    const sortedSuggestions = [...filteredSuggestions].sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            case 'oldest':
                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            case 'most-votes':
                return (b.votes_up - b.votes_down) - (a.votes_up - a.votes_down)
            case 'priority-high':
                const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1, 'Not important': 0 }
                return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
                    (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
            case 'priority-low':
                const priorityOrderReverse = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3, 'Not important': 4 }
                return (priorityOrderReverse[b.priority as keyof typeof priorityOrderReverse] || 0) -
                    (priorityOrderReverse[a.priority as keyof typeof priorityOrderReverse] || 0)
            default:
                return 0
        }
    })

    // Pagination
    const totalPages = Math.ceil(sortedSuggestions.length / ITEMS_PER_PAGE)
    const paginatedSuggestions = sortedSuggestions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    // Handle suggestion edit
    const handleEditSuggestion = (suggestion: Suggestion) => {
        setSelectedSuggestion(suggestion)
        setEditStatus(suggestion.status)
        setEditPriority(suggestion.priority)
        setEditAdminNotes(suggestion.admin_notes || '')
        setIsEditDialogOpen(true)
    }

    // Update suggestion
    const handleUpdateSuggestion = async () => {
        if (!selectedSuggestion) return

        setIsUpdating(true)
        try {
            const { error } = await supabase
                .from('suggestions')
                .update({
                    status: editStatus,
                    priority: editPriority,
                    admin_notes: editAdminNotes,
                })
                .eq('id', selectedSuggestion.id)

            if (error) {
                console.error('Error updating suggestion:', error)
                toast({
                    title: 'Error',
                    description: 'Failed to update suggestion. Please try again.',
                    variant: 'destructive',
                })
            } else {
                toast({
                    title: 'Success',
                    description: 'Suggestion updated successfully.',
                })
                setIsEditDialogOpen(false)
                fetchSuggestions()
            }
        } catch (error) {
            console.error('Error updating suggestion:', error)
        } finally {
            setIsUpdating(false)
        }
    }

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    if (!isAuthorized) {
        return null // Will redirect via useAdminProtection
    }

    return (
        <div className="min-h-screen bg-background">
            <AdminNavigation />

            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Suggestions Management</h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        Review and manage user suggestions and feature requests. Update status, priority, and add admin notes.
                    </p>
                </div>

                <Card className="shadow-sm border-0 bg-card/80 dark:bg-card/80 backdrop-blur mb-6">
                    <CardContent className="pt-6">
                        {/* Filters and Search */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder="Search suggestions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[130px]">
                                        <Funnel className="w-4 h-4 mr-2" />
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="in-progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="w-[130px]">
                                        <Funnel className="w-4 h-4 mr-2" />
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="Feature">Feature</SelectItem>
                                        <SelectItem value="Bug">Bug</SelectItem>
                                        <SelectItem value="Enhancement">Enhancement</SelectItem>
                                        <SelectItem value="Documentation">Documentation</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                    <SelectTrigger className="w-[130px]">
                                        <Funnel className="w-4 h-4 mr-2" />
                                        <SelectValue placeholder="Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Priorities</SelectItem>
                                        <SelectItem value="Critical">Critical</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Not important">Not important</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={sortBy} onValu={setSortBy}>
                                    <SelectTrigger className="w-[130px]">
                                        <SortAscending className="w-4 h-4 mr-2" />
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">Newest</SelectItem>
                                        <SelectItem value="oldest">Oldest</SelectItem>
                                        <SelectItem value="most-votes">Most Votes</SelectItem>
                                        <SelectItem value="priority-high">Priority (High→Low)</SelectItem>
                                        <SelectItem value="priority-low">Priority (Low→High)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Suggestions List */}
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : paginatedSuggestions.length === 0 ? (
                            <div className="text-center py-12">
                                <LightbulbFilament weight="duotone" className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium">No suggestions found</h3>
                                <p className="text-muted-foreground">Try adjusting your filters or search query</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {paginatedSuggestions.map((suggestion) => (
                                    <Card key={suggestion.id} className="overflow-hidden">
                                        <div className="flex flex-col md:flex-row">
                                            <div className="flex-1 p-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className="text-lg font-medium">{suggestion.title}</h3>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className={categoryColors[suggestion.category] || ''}>
                                                            {suggestion.category}
                                                        </Badge>
                                                        <Badge variant="outline" className={priorityColors[suggestion.priority] || ''}>
                                                            {suggestion.priority}
                                                        </Badge>
                                                        <Badge variant="outline" className={statusColors[suggestion.status] || ''}>
                                                            {suggestion.status === 'in-progress' ? 'In Progress' :
                                                                suggestion.status.charAt(0).toUpperCase() + suggestion.status.slice(1)}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <p className="text-muted-foreground mb-2 line-clamp-2">{suggestion.description}</p>

                                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                    <div>
                                                        Submitted: {formatDate(suggestion.created_at)}
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="flex items-center">
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <span className="flex items-center">
                                                                        👍 {suggestion.votes_up}
                                                                    </span>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Upvotes</TooltipContent>
                                                            </Tooltip>
                                                        </span>
                                                        <span className="flex items-center">
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <span className="flex items-center">
                                                                        👎 {suggestion.votes_down}
                                                                    </span>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Downvotes</TooltipContent>
                                                            </Tooltip>
                                                        </span>
                                                        <span className="flex items-center">
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <span className="flex items-center">
                                                                        Net: {suggestion.votes_up - suggestion.votes_down}
                                                                    </span>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Net votes</TooltipContent>
                                                            </Tooltip>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-muted/30 p-4 flex flex-row md:flex-col justify-end items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditSuggestion(suggestion)}
                                                >
                                                    Edit
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-6">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(1)}
                                        disabled={currentPage === 1}
                                    >
                                        First
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </Button>

                                    <span className="text-sm px-4">
                                        Page {currentPage} of {totalPages}
                                    </span>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(totalPages)}
                                        disabled={currentPage === totalPages}
                                    >
                                        Last
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Suggestion</DialogTitle>
                    </DialogHeader>

                    {selectedSuggestion && (
                        <div className="space-y-4 py-4">
                            <div>
                                <h3 className="font-medium mb-1">{selectedSuggestion.title}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{selectedSuggestion.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <Select value={editStatus} onValueChange={setEditStatus}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="in-progress">In Progress</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Priority</label>
                                    <Select value={editPriority} onValueChange={setEditPriority}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Critical">Critical</SelectItem>
                                            <SelectItem value="High">High</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="Low">Low</SelectItem>
                                            <SelectItem value="Not important">Not important</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Admin Notes</label>
                                <Textarea
                                    value={editAdminNotes}
                                    onChange={(e) => setEditAdminNotes(e.target.value)}
                                    placeholder="Add internal notes about this suggestion"
                                    rows={4}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateSuggestion} disabled={isUpdating}>
                            {isUpdating ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    Updating...
                                </>
                            ) : (
                                'Update Suggestion'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
