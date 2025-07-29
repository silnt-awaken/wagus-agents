// Agent type definitions

export interface Agent {
  id: string
  name: string
  category: string
  description: string
  price: number
  tier: 'Starter' | 'Professional' | 'Enterprise' | 'Legendary'
  rating: number
  downloads: number
  tags: string[]
  content: string
  preview: string
  isPurchased: boolean
}

export interface Category {
  id: string
  name: string
  icon: string
  count: number
}

export interface AgentBundle {
  id: string
  name: string
  description: string
  agents: string[] // Agent IDs
  originalPrice: number
  bundlePrice: number
  savings: number
  tier: 'Professional' | 'Enterprise' | 'Legendary'
  isPurchased: boolean
}

export interface AgentReview {
  id: string
  agentId: string
  userId: string
  username: string
  rating: number
  comment: string
  date: string
  helpful: number
}

export interface AgentStats {
  totalAgents: number
  totalDownloads: number
  averageRating: number
  categoryCounts: Record<string, number>
  tierCounts: Record<string, number>
}

export type SortOption = 'name' | 'price' | 'rating' | 'downloads' | 'newest'
export type FilterTier = 'all' | 'Starter' | 'Professional' | 'Enterprise' | 'Legendary'
export type FilterCategory = 'all' | 'engineering' | 'design' | 'marketing' | 'product' | 'project-management' | 'studio-operations' | 'testing' | 'bonus'