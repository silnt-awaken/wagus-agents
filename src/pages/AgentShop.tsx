import { useState, useEffect } from 'react'
import { Search, Filter, Star, ShoppingCart, Download, Eye, Users, Zap, Crown, Gem, Heart, Sparkles, CreditCard, Code, Palette, TrendingUp, Package, Settings, CheckCircle, Gift, FileText, X } from 'lucide-react'
import { toast } from 'sonner'
import { Agent, Category } from '../types/agent'
import { loadAgentsFromMarkdown, loadAgentContent } from '../utils/agentLoader'

const AGENT_CATEGORIES: Category[] = [
  { id: 'engineering', name: 'Engineering', icon: '⚙️', count: 7 },
  { id: 'design', name: 'Design', icon: '🎨', count: 5 },
  { id: 'marketing', name: 'Marketing', icon: '📈', count: 7 },
  { id: 'product', name: 'Product', icon: '📱', count: 3 },
  { id: 'project-management', name: 'Project Management', icon: '📋', count: 3 },
  { id: 'studio-operations', name: 'Studio Operations', icon: '🏢', count: 5 },
  { id: 'testing', name: 'Testing', icon: '🧪', count: 5 },
  { id: 'bonus', name: 'Bonus', icon: '🎁', count: 2 }
]

const TIER_COLORS = {
  Starter: 'bg-green-100 text-green-800 border-green-200',
  Professional: 'bg-blue-100 text-blue-800 border-blue-200',
  Enterprise: 'bg-purple-100 text-purple-800 border-purple-200',
  Legendary: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-300'
}

const TIER_ICONS = {
  Starter: Zap,
  Professional: Star,
  Enterprise: Crown,
  Legendary: Gem
}

export default function AgentShop() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTier, setSelectedTier] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating' | 'downloads'>('name')
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [userCredits, setUserCredits] = useState(50000) // Mock user credits
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [categories] = useState(['all', 'Engineering', 'Design', 'Marketing', 'Product', 'Project Management', 'Studio Operations', 'Testing', 'Bonus'])

  // Mock agent data with pricing based on complexity and demand
  const mockAgents: Agent[] = [
    // Engineering - High demand, complex
    { id: 'ai-engineer', name: 'AI Engineer', category: 'Engineering', description: 'Advanced AI development and machine learning expertise', price: 25000, tier: 'Legendary', rating: 4.9, downloads: 1250, tags: ['AI', 'ML', 'Python', 'TensorFlow'], content: '', preview: 'Build cutting-edge AI applications with expert guidance', isPurchased: false },
    { id: 'backend-architect', name: 'Backend Architect', category: 'Engineering', description: 'Scalable backend systems and microservices design', price: 18000, tier: 'Enterprise', rating: 4.8, downloads: 980, tags: ['Backend', 'Microservices', 'API'], content: '', preview: 'Design robust, scalable backend architectures', isPurchased: false },
    { id: 'frontend-developer', name: 'Frontend Developer', category: 'Engineering', description: 'Modern React and TypeScript development', price: 12000, tier: 'Professional', rating: 4.6, downloads: 1100, tags: ['React', 'TypeScript', 'UI'], content: '', preview: 'Build beautiful, responsive user interfaces', isPurchased: false }
  ]

  useEffect(() => {
    // Load agents from markdown files
    const loadAgents = async () => {
      try {
        const loadedAgents = await loadAgentsFromMarkdown()
        setAgents(loadedAgents)
        setFilteredAgents(loadedAgents)
        setLoading(false)
      } catch (error) {
        console.error('Failed to load agents:', error)
        // Fallback to mock data
        setAgents(mockAgents)
        setFilteredAgents(mockAgents)
        setLoading(false)
      }
    }
    
    loadAgents()
  }, [])

  useEffect(() => {
    let filtered = agents

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(agent => agent.category === selectedCategory)
    }

    // Filter by tier
    if (selectedTier !== 'all') {
      filtered = filtered.filter(agent => agent.tier === selectedTier)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(agent => 
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return b.price - a.price
        case 'rating':
          return b.rating - a.rating
        case 'downloads':
          return b.downloads - a.downloads
        default:
          return a.name.localeCompare(b.name)
      }
    })

    setFilteredAgents(filtered)
  }, [agents, selectedCategory, selectedTier, searchQuery, sortBy])

  const handlePurchase = (agent: Agent) => {
    if (userCredits >= agent.price) {
      setUserCredits(prev => prev - agent.price)
      setAgents(prev => prev.map(a => 
        a.id === agent.id ? { ...a, isPurchased: true } : a
      ))
      toast.success(`Successfully purchased ${agent.name}!`)
    } else {
      toast.error('Insufficient WAGUS credits!')
    }
  }

  const toggleFavorite = (agentId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(agentId)) {
      newFavorites.delete(agentId)
    } else {
      newFavorites.add(agentId)
    }
    setFavorites(newFavorites)
    localStorage.setItem('wagus-agent-favorites', JSON.stringify([...newFavorites]))
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Engineering': return <Code className="w-5 h-5" />
      case 'Design': return <Palette className="w-5 h-5" />
      case 'Marketing': return <TrendingUp className="w-5 h-5" />
      case 'Product': return <Package className="w-5 h-5" />
      case 'Project Management': return <Users className="w-5 h-5" />
      case 'Studio Operations': return <Settings className="w-5 h-5" />
      case 'Testing': return <CheckCircle className="w-5 h-5" />
      case 'Bonus': return <Gift className="w-5 h-5" />
      case 'Research': return <FileText className="w-5 h-5" />
      default: return <Zap className="w-5 h-5" />
    }
  }

  const getTierIcon = (tier: string) => {
    const Icon = TIER_ICONS[tier as keyof typeof TIER_ICONS]
    return Icon ? <Icon className="w-4 h-4" /> : null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-3 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 space-y-3 md:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
              <ShoppingCart className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3 text-orange-600" />
              Agent Shop
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">Discover and purchase premium AI agents for your projects</p>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-1 md:py-2 bg-orange-50 border border-orange-200 rounded-lg">
              <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
              <span className="text-sm md:text-base font-medium text-orange-700">{userCredits.toLocaleString()} WAGUS</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2 md:gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 md:flex-none px-2 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'rating' | 'downloads')}
              className="flex-1 md:flex-none px-2 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="name">Name</option>
              <option value="rating">Rating</option>
              <option value="price">Price</option>
              <option value="downloads">Downloads</option>
            </select>
          </div>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="flex-1 overflow-auto p-3 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {filteredAgents.map((agent) => (
            <div key={agent.id} className="bg-white rounded-lg md:rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
              {/* Agent Preview Image */}
              <div className="relative h-32 md:h-48 bg-gradient-to-br from-orange-400 to-purple-600">
                <img
                  src={`https://via.placeholder.com/400x225/6366f1/ffffff?text=${encodeURIComponent(agent.name)}`}
                  alt={agent.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <div className="absolute top-2 md:top-3 left-2 md:left-3 flex gap-1 md:gap-2">
                  {agent.tier === 'Legendary' && (
                    <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-yellow-500 text-white text-xs font-medium rounded-full flex items-center">
                      <Crown className="w-2 h-2 md:w-3 md:h-3 mr-0.5 md:mr-1" />
                      <span className="hidden md:inline">Legendary</span>
                    </span>
                  )}
                  {(agent.tier === 'Enterprise' || agent.tier === 'Professional') && (
                    <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-purple-600 text-white text-xs font-medium rounded-full flex items-center">
                      <Sparkles className="w-2 h-2 md:w-3 md:h-3 mr-0.5 md:mr-1" />
                      <span className="hidden md:inline">{agent.tier}</span>
                    </span>
                  )}
                </div>
                <button
                  onClick={() => toggleFavorite(agent.id)}
                  className="absolute top-2 md:top-3 right-2 md:right-3 p-1.5 md:p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                >
                  <Heart className={`w-3 h-3 md:w-4 md:h-4 ${favorites.has(agent.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                </button>
              </div>

              {/* Agent Info */}
              <div className="p-3 md:p-6">
                <div className="flex items-start justify-between mb-2 md:mb-3">
                  <div className="flex items-center space-x-1 md:space-x-2">
                    <div className="w-3 h-3 md:w-5 md:h-5">{getCategoryIcon(agent.category)}</div>
                    <span className="text-xs md:text-sm text-gray-600 truncate">{agent.category}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs md:text-sm font-medium">{agent.rating}</span>
                    <span className="text-xs text-gray-500 hidden md:inline">({agent.downloads})</span>
                  </div>
                </div>

                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 md:mb-2 line-clamp-1">{agent.name}</h3>
                <p className="text-gray-600 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2">{agent.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3 md:mb-4">
                  {agent.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="px-1.5 md:px-2 py-0.5 md:py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                  {agent.tags.length > 2 && (
                    <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      +{agent.tags.length - 2}
                    </span>
                  )}
                </div>

                {/* Stats - Hidden on mobile */}
                <div className="hidden md:flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>{agent.downloads.toLocaleString()} downloads</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{agent.tier}</span>
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between">
                  <div className="text-lg md:text-2xl font-bold text-orange-600">
                    {agent.price.toLocaleString()}
                    <span className="text-xs md:text-sm text-gray-500 ml-1">WAGUS</span>
                  </div>
                  <div className="flex gap-1 md:gap-2">
                    <button
                      onClick={() => setSelectedAgent(agent)}
                      className="px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                    <button
                      onClick={() => handlePurchase(agent)}
                      className="px-2 md:px-4 py-1.5 md:py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-1 md:space-x-2"
                    >
                      <ShoppingCart className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="text-xs md:text-sm">Buy</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-lg md:rounded-xl max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-400 to-purple-600 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                    <div className="w-6 h-6 md:w-8 md:h-8">{getCategoryIcon(selectedAgent.category)}</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg md:text-2xl font-bold text-gray-900 truncate">{selectedAgent.name}</h2>
                    <p className="text-sm md:text-base text-gray-600 line-clamp-2">{selectedAgent.description}</p>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 text-xs md:text-sm text-gray-500">
                      <span>{selectedAgent.tier} Tier</span>
                      <span>{selectedAgent.downloads.toLocaleString()} downloads</span>
                      <span>Rating: {selectedAgent.rating}/5</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 ml-2 flex-shrink-0"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
            </div>
            <div className="p-4 md:p-6 overflow-y-auto">
              <p className="text-sm md:text-base text-gray-700 mb-4 md:mb-6">{selectedAgent.preview}</p>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-2xl md:text-3xl font-bold text-orange-600">
                  {selectedAgent.price.toLocaleString()} WAGUS
                </div>
                <button
                  onClick={() => {
                    handlePurchase(selectedAgent)
                    setSelectedAgent(null)
                  }}
                  className="w-full md:w-auto px-4 md:px-6 py-2 md:py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm md:text-base">Purchase Agent</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}