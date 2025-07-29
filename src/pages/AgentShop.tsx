import { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  Star,
  Crown,
  Sparkles,
  Download,
  Eye,
  ShoppingCart,
  CreditCard,
  Brain,
  Zap,
  Code,
  Database,
  Shield,
  Globe,
  Cpu,
  FileText,
  ChevronDown,
  ChevronRight,
  Heart,
  Share2,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../components/AuthProvider'
import { useNavigate } from 'react-router-dom'

interface Agent {
  id: string
  name: string
  description: string
  longDescription: string
  category: string
  price: number
  rating: number
  reviews: number
  downloads: number
  featured: boolean
  premium: boolean
  tags: string[]
  capabilities: string[]
  documentation: {
    markdown: string
    xml: string
    plaintext: string
  }
  author: string
  version: string
  lastUpdated: string
  compatibility: string[]
  requirements: string[]
  preview: string
}

const AgentShop = () => {
  const [agents, setAgents] = useState<Agent[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popularity')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'markdown' | 'xml' | 'plaintext'>('markdown')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const { credits, updateCredits } = useAuth()
  const navigate = useNavigate()

  const categories = [
    'all', 'Development', 'AI/ML', 'Data Science', 'Security', 'DevOps', 
    'Blockchain', 'Design', 'Marketing', 'Finance', 'Research'
  ]

  const premiumAgents: Agent[] = [
    {
      id: 'code-architect',
      name: 'Code Architect Pro',
      description: 'Advanced code generation and architecture design agent',
      longDescription: 'The Code Architect Pro is an elite AI agent specialized in generating enterprise-grade code architectures, design patterns, and scalable solutions. It combines years of software engineering best practices with cutting-edge AI capabilities.',
      category: 'Development',
      price: 5000,
      rating: 4.9,
      reviews: 1247,
      downloads: 8932,
      featured: true,
      premium: true,
      tags: ['Code Generation', 'Architecture', 'Design Patterns', 'Enterprise'],
      capabilities: [
        'Generate complete application architectures',
        'Design scalable microservices',
        'Create design pattern implementations',
        'Optimize code performance',
        'Generate comprehensive documentation'
      ],
      documentation: {
        markdown: `# Code Architect Pro\n\n## Overview\nThe Code Architect Pro is your ultimate companion for building enterprise-grade software architectures.\n\n## Key Features\n- **Architecture Generation**: Creates complete system architectures\n- **Design Patterns**: Implements proven design patterns\n- **Code Optimization**: Analyzes and optimizes existing code\n- **Documentation**: Generates comprehensive technical docs\n\n## Usage\n\`\`\`typescript\nconst architect = new CodeArchitectPro({\n  language: 'typescript',\n  framework: 'react',\n  architecture: 'microservices'\n});\n\nconst result = await architect.generateArchitecture({\n  requirements: 'E-commerce platform',\n  scale: 'enterprise'\n});\n\`\`\`\n\n## Supported Languages\n- TypeScript/JavaScript\n- Python\n- Java\n- C#\n- Go\n- Rust`,
        xml: `<?xml version="1.0" encoding="UTF-8"?>\n<agent>\n  <name>Code Architect Pro</name>\n  <version>2.1.0</version>\n  <capabilities>\n    <capability>Architecture Generation</capability>\n    <capability>Design Patterns</capability>\n    <capability>Code Optimization</capability>\n    <capability>Documentation</capability>\n  </capabilities>\n  <languages>\n    <language>TypeScript</language>\n    <language>Python</language>\n    <language>Java</language>\n    <language>C#</language>\n    <language>Go</language>\n    <language>Rust</language>\n  </languages>\n  <frameworks>\n    <framework>React</framework>\n    <framework>Vue</framework>\n    <framework>Angular</framework>\n    <framework>Express</framework>\n    <framework>FastAPI</framework>\n    <framework>Spring Boot</framework>\n  </frameworks>\n</agent>`,
        plaintext: `CODE ARCHITECT PRO\n\nPrice: 5,000 WAGUS tokens\nVersion: 2.1.0\nAuthor: WAGUS AI Labs\n\nDESCRIPTION:\nAdvanced AI agent for enterprise-grade code architecture and design.\n\nCAPABILITIES:\n- Generate complete application architectures\n- Implement proven design patterns\n- Optimize code performance and scalability\n- Create comprehensive technical documentation\n- Support multiple programming languages\n\nSUPPORTED LANGUAGES:\n- TypeScript/JavaScript\n- Python\n- Java\n- C#\n- Go\n- Rust\n\nFRAMEWORKS:\n- React, Vue, Angular\n- Express, FastAPI\n- Spring Boot, .NET\n\nREQUIREMENTS:\n- Minimum 8GB RAM\n- Node.js 18+\n- API access to OpenAI or Claude\n\nINSTALLATION:\n1. Download agent package\n2. Install dependencies\n3. Configure API keys\n4. Run initialization script`
      },
      author: 'WAGUS AI Labs',
      version: '2.1.0',
      lastUpdated: '2025-01-15',
      compatibility: ['Node.js 18+', 'Python 3.9+', 'Docker'],
      requirements: ['8GB RAM', 'OpenAI API', 'Git'],
      preview: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic%20AI%20code%20architect%20holographic%20interface%20with%20glowing%20code%20structures&image_size=landscape_16_9'
    },
    {
      id: 'data-wizard',
      name: 'Data Wizard Elite',
      description: 'Advanced data analysis and machine learning agent',
      longDescription: 'Data Wizard Elite transforms raw data into actionable insights using advanced machine learning algorithms, statistical analysis, and predictive modeling capabilities.',
      category: 'Data Science',
      price: 7500,
      rating: 4.8,
      reviews: 892,
      downloads: 5643,
      featured: true,
      premium: true,
      tags: ['Machine Learning', 'Data Analysis', 'Predictive Modeling', 'Statistics'],
      capabilities: [
        'Advanced statistical analysis',
        'Machine learning model training',
        'Predictive analytics',
        'Data visualization',
        'Automated feature engineering'
      ],
      documentation: {
        markdown: `# Data Wizard Elite\n\n## Overview\nTransform your data into powerful insights with advanced ML capabilities.\n\n## Features\n- **Statistical Analysis**: Comprehensive statistical modeling\n- **ML Training**: Automated model training and optimization\n- **Predictions**: Advanced predictive analytics\n- **Visualization**: Interactive data visualizations\n\n## Example Usage\n\`\`\`python\nfrom data_wizard import DataWizardElite\n\nwizard = DataWizardElite()\nmodel = wizard.train_model(\n    data=df,\n    target='sales',\n    model_type='regression'\n)\n\npredictions = wizard.predict(new_data)\n\`\`\``,
        xml: `<?xml version="1.0" encoding="UTF-8"?>\n<dataWizard>\n  <capabilities>\n    <analysis type="statistical" />\n    <modeling type="machine_learning" />\n    <prediction type="advanced" />\n    <visualization type="interactive" />\n  </capabilities>\n  <algorithms>\n    <algorithm>Random Forest</algorithm>\n    <algorithm>XGBoost</algorithm>\n    <algorithm>Neural Networks</algorithm>\n    <algorithm>SVM</algorithm>\n  </algorithms>\n</dataWizard>`,
        plaintext: `DATA WIZARD ELITE\n\nPrice: 7,500 WAGUS tokens\n\nAdvanced data science and machine learning agent:\n- Statistical analysis and modeling\n- Automated ML model training\n- Predictive analytics\n- Interactive data visualization\n- Feature engineering\n\nSupported algorithms:\n- Random Forest\n- XGBoost\n- Neural Networks\n- Support Vector Machines\n- Deep Learning models\n\nData formats:\n- CSV, JSON, Parquet\n- SQL databases\n- APIs and streaming data\n\nRequirements:\n- Python 3.9+\n- 16GB RAM recommended\n- GPU for deep learning (optional)`
      },
      author: 'DataCorp Analytics',
      version: '3.2.1',
      lastUpdated: '2025-01-12',
      compatibility: ['Python 3.9+', 'Jupyter', 'Docker'],
      requirements: ['16GB RAM', 'Python ML Stack', 'GPU (optional)'],
      preview: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=advanced%20data%20visualization%20dashboard%20with%20AI%20analytics%20charts%20and%20graphs&image_size=landscape_16_9'
    },
    {
      id: 'security-sentinel',
      name: 'Security Sentinel Pro',
      description: 'Comprehensive cybersecurity and threat detection agent',
      longDescription: 'Security Sentinel Pro provides enterprise-grade security analysis, vulnerability detection, and threat intelligence to protect your applications and infrastructure.',
      category: 'Security',
      price: 12000,
      rating: 4.9,
      reviews: 567,
      downloads: 3421,
      featured: true,
      premium: true,
      tags: ['Cybersecurity', 'Threat Detection', 'Vulnerability Assessment', 'Compliance'],
      capabilities: [
        'Automated vulnerability scanning',
        'Threat intelligence analysis',
        'Security compliance checking',
        'Incident response automation',
        'Penetration testing simulation'
      ],
      documentation: {
        markdown: `# Security Sentinel Pro\n\n## Overview\nEnterprise-grade cybersecurity agent for comprehensive threat protection.\n\n## Core Features\n- **Vulnerability Scanning**: Automated security assessments\n- **Threat Intelligence**: Real-time threat analysis\n- **Compliance**: GDPR, SOC2, ISO27001 compliance\n- **Incident Response**: Automated response workflows\n\n## Security Frameworks\n- OWASP Top 10\n- NIST Cybersecurity Framework\n- CIS Controls\n- MITRE ATT&CK\n\n## Usage\n\`\`\`python\nsentinel = SecuritySentinel()\nresults = sentinel.scan_application(\n    target='https://myapp.com',\n    depth='comprehensive'\n)\n\`\`\``,
        xml: `<?xml version="1.0" encoding="UTF-8"?>\n<securitySentinel>\n  <scanTypes>\n    <scan type="vulnerability" />\n    <scan type="penetration" />\n    <scan type="compliance" />\n    <scan type="threat_intelligence" />\n  </scanTypes>\n  <frameworks>\n    <framework>OWASP</framework>\n    <framework>NIST</framework>\n    <framework>CIS</framework>\n    <framework>MITRE</framework>\n  </frameworks>\n</securitySentinel>`,
        plaintext: `SECURITY SENTINEL PRO\n\nPrice: 12,000 WAGUS tokens\n\nComprehensive cybersecurity agent:\n- Automated vulnerability scanning\n- Real-time threat intelligence\n- Security compliance checking\n- Incident response automation\n- Penetration testing simulation\n\nSecurity frameworks:\n- OWASP Top 10\n- NIST Cybersecurity Framework\n- CIS Controls\n- MITRE ATT&CK\n\nCompliance standards:\n- GDPR\n- SOC2\n- ISO27001\n- PCI DSS\n\nRequirements:\n- Linux/Windows/macOS\n- Network access\n- Admin privileges\n- 8GB RAM minimum`
      },
      author: 'CyberGuard Systems',
      version: '4.0.2',
      lastUpdated: '2025-01-10',
      compatibility: ['Linux', 'Windows', 'macOS', 'Docker'],
      requirements: ['Admin privileges', 'Network access', '8GB RAM'],
      preview: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=cybersecurity%20dashboard%20with%20threat%20detection%20shields%20and%20security%20monitoring&image_size=landscape_16_9'
    },
    {
      id: 'blockchain-builder',
      name: 'Blockchain Builder Supreme',
      description: 'Advanced blockchain and smart contract development agent',
      longDescription: 'Blockchain Builder Supreme creates sophisticated blockchain applications, smart contracts, and DeFi protocols with enterprise-grade security and optimization.',
      category: 'Blockchain',
      price: 15000,
      rating: 4.7,
      reviews: 423,
      downloads: 2156,
      featured: true,
      premium: true,
      tags: ['Blockchain', 'Smart Contracts', 'DeFi', 'Web3'],
      capabilities: [
        'Smart contract development',
        'DeFi protocol creation',
        'NFT marketplace building',
        'Cross-chain integration',
        'Security auditing'
      ],
      documentation: {
        markdown: `# Blockchain Builder Supreme\n\n## Overview\nCreate sophisticated blockchain applications and smart contracts.\n\n## Supported Blockchains\n- Ethereum\n- Solana\n- Polygon\n- Binance Smart Chain\n- Avalanche\n\n## Features\n- **Smart Contracts**: Solidity, Rust, Move\n- **DeFi Protocols**: DEX, Lending, Staking\n- **NFT Systems**: Marketplaces, Collections\n- **Cross-chain**: Bridge development\n\n## Example\n\`\`\`solidity\ncontract MyDeFiProtocol {\n    function stake(uint256 amount) external {\n        // Staking logic\n    }\n}\n\`\`\``,
        xml: `<?xml version="1.0" encoding="UTF-8"?>\n<blockchainBuilder>\n  <blockchains>\n    <blockchain>Ethereum</blockchain>\n    <blockchain>Solana</blockchain>\n    <blockchain>Polygon</blockchain>\n    <blockchain>BSC</blockchain>\n  </blockchains>\n  <protocols>\n    <protocol type="defi" />\n    <protocol type="nft" />\n    <protocol type="dao" />\n  </protocols>\n</blockchainBuilder>`,
        plaintext: `BLOCKCHAIN BUILDER SUPREME\n\nPrice: 15,000 WAGUS tokens\n\nAdvanced blockchain development:\n- Smart contract creation (Solidity, Rust)\n- DeFi protocol development\n- NFT marketplace building\n- Cross-chain bridge development\n- Security auditing tools\n\nSupported blockchains:\n- Ethereum\n- Solana\n- Polygon\n- Binance Smart Chain\n- Avalanche\n\nProtocol types:\n- DEX (Decentralized Exchange)\n- Lending protocols\n- Staking systems\n- NFT marketplaces\n- DAO governance\n\nRequirements:\n- Node.js 18+\n- Blockchain development tools\n- Wallet integration\n- Test network access`
      },
      author: 'Web3 Innovations',
      version: '1.8.0',
      lastUpdated: '2025-01-08',
      compatibility: ['Ethereum', 'Solana', 'Polygon', 'BSC'],
      requirements: ['Node.js 18+', 'Web3 tools', 'Wallet'],
      preview: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic%20blockchain%20network%20with%20smart%20contracts%20and%20cryptocurrency%20nodes&image_size=landscape_16_9'
    },
    {
      id: 'quantum-ai',
      name: 'Quantum AI Researcher',
      description: 'Cutting-edge quantum computing and AI research agent',
      longDescription: 'Quantum AI Researcher pushes the boundaries of quantum computing and artificial intelligence, developing quantum algorithms and hybrid quantum-classical systems.',
      category: 'Research',
      price: 25000,
      rating: 5.0,
      reviews: 89,
      downloads: 234,
      featured: true,
      premium: true,
      tags: ['Quantum Computing', 'AI Research', 'Algorithms', 'Innovation'],
      capabilities: [
        'Quantum algorithm development',
        'Quantum machine learning',
        'Quantum cryptography',
        'Hybrid quantum-classical systems',
        'Research paper generation'
      ],
      documentation: {
        markdown: `# Quantum AI Researcher\n\n## Overview\nPioneering quantum computing and AI research capabilities.\n\n## Quantum Capabilities\n- **Algorithms**: Shor's, Grover's, VQE\n- **ML**: Quantum neural networks\n- **Cryptography**: Post-quantum security\n- **Simulation**: Quantum system modeling\n\n## Research Areas\n- Quantum supremacy\n- Quantum error correction\n- Quantum networking\n- Quantum sensing\n\n## Example\n\`\`\`python\nfrom quantum_ai import QuantumResearcher\n\nresearcher = QuantumResearcher()\nalgorithm = researcher.develop_quantum_algorithm(\n    problem='optimization',\n    qubits=50\n)\n\`\`\``,
        xml: `<?xml version="1.0" encoding="UTF-8"?>\n<quantumAI>\n  <algorithms>\n    <algorithm>Shor</algorithm>\n    <algorithm>Grover</algorithm>\n    <algorithm>VQE</algorithm>\n    <algorithm>QAOA</algorithm>\n  </algorithms>\n  <research>\n    <area>Quantum Supremacy</area>\n    <area>Error Correction</area>\n    <area>Quantum Networking</area>\n  </research>\n</quantumAI>`,
        plaintext: `QUANTUM AI RESEARCHER\n\nPrice: 25,000 WAGUS tokens\n\nCutting-edge quantum research:\n- Quantum algorithm development\n- Quantum machine learning\n- Post-quantum cryptography\n- Hybrid quantum-classical systems\n- Research paper generation\n\nQuantum algorithms:\n- Shor's algorithm\n- Grover's algorithm\n- Variational Quantum Eigensolver\n- Quantum Approximate Optimization\n\nResearch areas:\n- Quantum supremacy\n- Quantum error correction\n- Quantum networking\n- Quantum sensing\n\nRequirements:\n- Quantum simulator access\n- High-performance computing\n- Advanced mathematics background\n- Research institution access`
      },
      author: 'Quantum Labs Institute',
      version: '0.9.1',
      lastUpdated: '2025-01-05',
      compatibility: ['Qiskit', 'Cirq', 'PennyLane'],
      requirements: ['Quantum simulator', 'HPC access', 'PhD level'],
      preview: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=quantum%20computer%20with%20glowing%20qubits%20and%20AI%20neural%20networks%20in%20laboratory&image_size=landscape_16_9'
    }
  ]

  useEffect(() => {
    setAgents(premiumAgents)
    
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('wagus-agent-favorites')
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)))
    }
  }, [])

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedAgents = [...filteredAgents].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price
      case 'price-high': return b.price - a.price
      case 'rating': return b.rating - a.rating
      case 'downloads': return b.downloads - a.downloads
      case 'newest': return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      default: return b.downloads - a.downloads // popularity
    }
  })

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

  const purchaseAgent = (agent: Agent) => {
    if (credits < agent.price) {
      setSelectedAgent(agent)
      setShowPurchaseModal(true)
      return
    }

    updateCredits(-agent.price)
    toast.success(`Successfully purchased ${agent.name} for ${agent.price} WAGUS tokens!`)
    
    // Save purchased agent
    const purchased = JSON.parse(localStorage.getItem('wagus-purchased-agents') || '[]')
    purchased.push({
      ...agent,
      purchaseDate: new Date().toISOString()
    })
    localStorage.setItem('wagus-purchased-agents', JSON.stringify(purchased))
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Development': return <Code className="w-5 h-5" />
      case 'AI/ML': return <Brain className="w-5 h-5" />
      case 'Data Science': return <Database className="w-5 h-5" />
      case 'Security': return <Shield className="w-5 h-5" />
      case 'Blockchain': return <Cpu className="w-5 h-5" />
      case 'Research': return <FileText className="w-5 h-5" />
      default: return <Zap className="w-5 h-5" />
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ShoppingCart className="w-8 h-8 mr-3 text-orange-600" />
              Agent Shop
            </h1>
            <p className="text-gray-600 mt-1">Discover and purchase premium AI agents for your projects</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg">
              <CreditCard className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-700">{credits.toLocaleString()} WAGUS</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search agents by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="popularity">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest</option>
              <option value="downloads">Most Downloaded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAgents.map((agent) => (
            <div key={agent.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
              {/* Agent Preview Image */}
              <div className="relative h-48 bg-gradient-to-br from-orange-400 to-purple-600">
                <img
                  src={agent.preview}
                  alt={agent.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  {agent.featured && (
                    <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full flex items-center">
                      <Crown className="w-3 h-3 mr-1" />
                      Featured
                    </span>
                  )}
                  {agent.premium && (
                    <span className="px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded-full flex items-center">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Premium
                    </span>
                  )}
                </div>
                <button
                  onClick={() => toggleFavorite(agent.id)}
                  className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                >
                  <Heart className={`w-4 h-4 ${favorites.has(agent.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                </button>
              </div>

              {/* Agent Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(agent.category)}
                    <span className="text-sm text-gray-600">{agent.category}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{agent.rating}</span>
                    <span className="text-xs text-gray-500">({agent.reviews})</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{agent.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{agent.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {agent.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                  {agent.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      +{agent.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>{agent.downloads.toLocaleString()} downloads</span>
                  <span>v{agent.version}</span>
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-orange-600">
                    {agent.price.toLocaleString()} WAGUS
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedAgent(agent)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => purchaseAgent(agent)}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Buy</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {sortedAgents.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-purple-600 rounded-xl flex items-center justify-center">
                    {getCategoryIcon(selectedAgent.category)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedAgent.name}</h2>
                    <p className="text-gray-600">{selectedAgent.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>by {selectedAgent.author}</span>
                      <span>v{selectedAgent.version}</span>
                      <span>{selectedAgent.downloads.toLocaleString()} downloads</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[60vh] overflow-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Documentation</h3>
                    <div className="flex space-x-1 mb-4">
                      {(['markdown', 'xml', 'plaintext'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === tab
                              ? 'bg-orange-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                        {selectedAgent.documentation[activeTab]}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Capabilities</h3>
                    <ul className="space-y-2">
                      {selectedAgent.capabilities.map((capability, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">{capability}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {selectedAgent.price.toLocaleString()} WAGUS
                    </div>
                    <button
                      onClick={() => purchaseAgent(selectedAgent)}
                      className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>Purchase Agent</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {selectedAgent.requirements.map((req, index) => (
                          <li key={index}>• {req}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Compatibility</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedAgent.compatibility.map((comp, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedAgent.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insufficient Credits Modal */}
      {showPurchaseModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Insufficient WAGUS Tokens</h3>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium">Not enough tokens to purchase this agent</p>
                  <p className="text-sm text-gray-600 mt-1">
                    You need {selectedAgent.price.toLocaleString()} WAGUS tokens to purchase {selectedAgent.name}.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Your current tokens:</span>
                  <span className="font-medium">{credits.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Required tokens:</span>
                  <span className="font-medium">{selectedAgent.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2 mt-2">
                  <span className="text-gray-600">Tokens needed:</span>
                  <span className="font-medium text-red-600">
                    {(selectedAgent.price - credits).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowPurchaseModal(false)
                    navigate('/payment')
                  }}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Buy Tokens
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgentShop