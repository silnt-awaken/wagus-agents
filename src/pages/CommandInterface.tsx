import { useState, useRef, useEffect } from 'react'
import { 
  Send, 
  Terminal, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader, 
  Zap, 
  CreditCard,
  History,
  Copy,
  Play,
  AlertTriangle,
  Plus,
  Settings,
  ChevronDown,
  ChevronRight,
  FileText,
  Code,
  Database,
  Brain,
  Trash2,
  Pause,
  RotateCcw,
  Download,
  Eye,
  EyeOff,
  Star,
  Crown,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

interface Session {
  id: string
  name: string
  status: 'active' | 'paused' | 'completed' | 'error'
  createdAt: string
  lastActivity: string
  commands: Command[]
  model: AIModel
  totalCost: number
}

interface Command {
  id: string
  sessionId: string
  name: string
  description: string
  content: {
    markdown: string
    xml: string
    plaintext: string
  }
  timestamp: string
  status: 'pending' | 'running' | 'completed' | 'error'
  output?: string
  isPremium: boolean
  cost: number
  model: AIModel
  executionTime?: number
}

interface AIModel {
  id: string
  name: string
  provider: string
  description: string
  costPerToken: number
  maxTokens: number
  isPremium: boolean
}

interface PremiumCommand {
  id: string
  name: string
  description: string
  category: string
  cost: number
  popularity: number
  content: {
    markdown: string
    xml: string
    plaintext: string
  }
  estimatedTokens: number
  tags: string[]
  featured: boolean
}

const CommandInterface = () => {
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [showNewSessionModal, setShowNewSessionModal] = useState(false)
  const [showCommandMarketplace, setShowCommandMarketplace] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [pendingCommand, setPendingCommand] = useState<PremiumCommand | null>(null)
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null)
  const [expandedCommands, setExpandedCommands] = useState<Set<string>>(new Set())
  const [activeContentTab, setActiveContentTab] = useState<'markdown' | 'xml' | 'plaintext'>('markdown')
  const [newSessionName, setNewSessionName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const { credits, updateCredits } = useAuth()
  const navigate = useNavigate()

  const aiModels: AIModel[] = [
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'OpenAI',
      description: 'Most capable model for complex reasoning',
      costPerToken: 0.03,
      maxTokens: 8192,
      isPremium: false
    },
    {
      id: 'claude-sonnet-4',
      name: 'Claude Sonnet 4',
      provider: 'Anthropic',
      description: 'Advanced reasoning with excellent code generation',
      costPerToken: 0.025,
      maxTokens: 200000,
      isPremium: true
    },
    {
      id: 'kimi-k2-instruct',
      name: 'Kimi K2 Instruct',
      provider: 'Moonshot AI',
      description: 'Specialized for instruction following and coding',
      costPerToken: 0.02,
      maxTokens: 128000,
      isPremium: true
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'OpenAI',
      description: 'Faster GPT-4 with updated knowledge',
      costPerToken: 0.01,
      maxTokens: 128000,
      isPremium: false
    }
  ]

  const premiumCommands: PremiumCommand[] = [
    {
      id: 'full-stack-app',
      name: 'Full-Stack Application Generator',
      description: 'Generate complete full-stack applications with authentication, database, and deployment',
      category: 'Development',
      cost: 2500,
      popularity: 95,
      featured: true,
      estimatedTokens: 15000,
      tags: ['React', 'Node.js', 'Database', 'Authentication'],
      content: {
        markdown: `# Full-Stack Application Generator\n\nThis premium command generates a complete full-stack application with:\n\n## Features\n- User authentication system\n- Database integration\n- RESTful API\n- Modern UI components\n- Deployment configuration\n\n## Tech Stack\n- Frontend: React + TypeScript + Tailwind\n- Backend: Node.js + Express\n- Database: PostgreSQL/MongoDB\n- Authentication: JWT + bcrypt\n\n## Generated Structure\n\`\`\`\nclient/\n├── src/\n│   ├── components/\n│   ├── pages/\n│   ├── hooks/\n│   └── utils/\nserver/\n├── routes/\n├── models/\n├── middleware/\n└── config/\n\`\`\``,
        xml: `<?xml version="1.0" encoding="UTF-8"?>\n<command>\n  <name>Full-Stack Application Generator</name>\n  <type>premium</type>\n  <cost>50</cost>\n  <features>\n    <feature>Authentication System</feature>\n    <feature>Database Integration</feature>\n    <feature>RESTful API</feature>\n    <feature>Modern UI</feature>\n    <feature>Deployment Config</feature>\n  </features>\n  <techStack>\n    <frontend>React + TypeScript + Tailwind</frontend>\n    <backend>Node.js + Express</backend>\n    <database>PostgreSQL/MongoDB</database>\n    <auth>JWT + bcrypt</auth>\n  </techStack>\n</command>`,
        plaintext: `FULL-STACK APPLICATION GENERATOR\n\nCost: 50 WAGUS tokens\nEstimated completion: 15-20 minutes\n\nThis command will generate:\n1. Complete React frontend with TypeScript\n2. Node.js backend with Express\n3. Database models and migrations\n4. Authentication system\n5. API endpoints\n6. Deployment configuration\n\nRequirements:\n- Project name\n- Database preference (PostgreSQL/MongoDB)\n- Authentication method\n- UI framework preference\n\nOutput:\n- Complete codebase\n- Setup instructions\n- Deployment guide\n- Documentation`
      }
    },
    {
      id: 'ai-integration',
      name: 'AI Integration Suite',
      description: 'Integrate multiple AI services with smart routing and fallback systems',
      category: 'AI/ML',
      cost: 1800,
      popularity: 88,
      featured: true,
      estimatedTokens: 12000,
      tags: ['OpenAI', 'Claude', 'Gemini', 'Integration'],
      content: {
        markdown: `# AI Integration Suite\n\nComprehensive AI service integration with intelligent routing:\n\n## Supported Services\n- OpenAI GPT models\n- Anthropic Claude\n- Google Gemini\n- Custom model endpoints\n\n## Features\n- Smart model selection\n- Automatic fallback\n- Cost optimization\n- Rate limiting\n- Response caching\n\n## Implementation\n\`\`\`typescript\nclass AIRouter {\n  async route(prompt: string, requirements: Requirements) {\n    // Intelligent model selection\n  }\n}\n\`\`\``,
        xml: `<?xml version="1.0" encoding="UTF-8"?>\n<aiIntegration>\n  <services>\n    <service name="OpenAI" models="gpt-4,gpt-3.5-turbo" />\n    <service name="Anthropic" models="claude-3,claude-2" />\n    <service name="Google" models="gemini-pro,gemini-ultra" />\n  </services>\n  <features>\n    <smartRouting enabled="true" />\n    <fallbackSystem enabled="true" />\n    <costOptimization enabled="true" />\n    <rateLimiting enabled="true" />\n    <caching enabled="true" />\n  </features>\n</aiIntegration>`,
        plaintext: `AI INTEGRATION SUITE\n\nCost: 35 WAGUS tokens\n\nIntegrates multiple AI services:\n- OpenAI (GPT-4, GPT-3.5-turbo)\n- Anthropic (Claude-3, Claude-2)\n- Google (Gemini Pro, Gemini Ultra)\n- Custom endpoints\n\nFeatures:\n- Intelligent model routing\n- Automatic fallback systems\n- Cost optimization algorithms\n- Rate limiting protection\n- Response caching\n- Performance monitoring\n\nDeliverables:\n- Complete integration code\n- Configuration files\n- Testing suite\n- Documentation\n- Usage examples`
      }
    },
    {
      id: 'blockchain-dapp',
      name: 'Blockchain DApp Generator',
      description: 'Create decentralized applications with smart contracts and Web3 integration',
      category: 'Blockchain',
      cost: 3200,
      popularity: 82,
      featured: false,
      estimatedTokens: 13500,
      tags: ['Solana', 'Ethereum', 'Smart Contracts', 'Web3'],
      content: {
        markdown: `# Blockchain DApp Generator\n\nGenerate complete decentralized applications:\n\n## Supported Blockchains\n- Solana\n- Ethereum\n- Polygon\n- Binance Smart Chain\n\n## Components\n- Smart contracts\n- Web3 frontend\n- Wallet integration\n- Token management\n\n## Features\n\`\`\`solidity\ncontract MyDApp {\n    // Smart contract logic\n}\n\`\`\``,
        xml: `<?xml version="1.0" encoding="UTF-8"?>\n<dappGenerator>\n  <blockchains>\n    <blockchain name="Solana" language="Rust" />\n    <blockchain name="Ethereum" language="Solidity" />\n    <blockchain name="Polygon" language="Solidity" />\n  </blockchains>\n  <components>\n    <smartContracts />\n    <web3Frontend />\n    <walletIntegration />\n    <tokenManagement />\n  </components>\n</dappGenerator>`,
        plaintext: `BLOCKCHAIN DAPP GENERATOR\n\nCost: 45 WAGUS tokens\n\nSupported blockchains:\n- Solana (Rust/Anchor)\n- Ethereum (Solidity)\n- Polygon (Solidity)\n- BSC (Solidity)\n\nGenerated components:\n- Smart contracts\n- Web3 frontend integration\n- Wallet connection\n- Token/NFT management\n- Transaction handling\n\nOutput includes:\n- Contract source code\n- Deployment scripts\n- Frontend integration\n- Testing framework\n- Documentation`
      }
    },
    {
      id: 'microservices-arch',
      name: 'Microservices Architecture',
      description: 'Design and implement scalable microservices with Docker and Kubernetes',
      category: 'Architecture',
      cost: 2800,
      popularity: 76,
      featured: false,
      estimatedTokens: 11000,
      tags: ['Docker', 'Kubernetes', 'Microservices', 'DevOps'],
      content: {
        markdown: `# Microservices Architecture\n\nComplete microservices setup with:\n\n## Services\n- API Gateway\n- User Service\n- Payment Service\n- Notification Service\n\n## Infrastructure\n- Docker containers\n- Kubernetes orchestration\n- Service mesh\n- Monitoring stack\n\n## Configuration\n\`\`\`yaml\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: user-service\n\`\`\``,
        xml: `<?xml version="1.0" encoding="UTF-8"?>\n<microservices>\n  <services>\n    <service name="api-gateway" port="8080" />\n    <service name="user-service" port="8081" />\n    <service name="payment-service" port="8082" />\n    <service name="notification-service" port="8083" />\n  </services>\n  <infrastructure>\n    <docker enabled="true" />\n    <kubernetes enabled="true" />\n    <serviceMesh type="istio" />\n    <monitoring type="prometheus" />\n  </infrastructure>\n</microservices>`,
        plaintext: `MICROSERVICES ARCHITECTURE\n\nCost: 40 WAGUS tokens\n\nGenerated services:\n- API Gateway (routing, auth)\n- User Service (authentication)\n- Payment Service (transactions)\n- Notification Service (emails, SMS)\n\nInfrastructure:\n- Docker containerization\n- Kubernetes deployment\n- Service mesh (Istio)\n- Monitoring (Prometheus/Grafana)\n- Logging (ELK stack)\n\nDeliverables:\n- Service source code\n- Docker files\n- K8s manifests\n- CI/CD pipelines\n- Documentation`
      }
    },
    {
      id: 'data-pipeline',
      name: 'Data Pipeline & Analytics',
      description: 'Build ETL pipelines with real-time analytics and visualization dashboards',
      category: 'Data',
      cost: 1500,
      popularity: 71,
      featured: false,
      estimatedTokens: 9500,
      tags: ['ETL', 'Analytics', 'Dashboard', 'BigQuery'],
      content: {
        markdown: `# Data Pipeline & Analytics\n\nComplete data processing solution:\n\n## Pipeline Components\n- Data ingestion\n- Transformation\n- Storage\n- Analytics\n\n## Technologies\n- Apache Airflow\n- Apache Spark\n- BigQuery/Snowflake\n- Grafana/Tableau\n\n## Example Pipeline\n\`\`\`python\ndef process_data(data):\n    # ETL logic\n    return transformed_data\n\`\`\``,
        xml: `<?xml version="1.0" encoding="UTF-8"?>\n<dataPipeline>\n  <ingestion>\n    <source type="api" />\n    <source type="database" />\n    <source type="files" />\n  </ingestion>\n  <processing>\n    <engine>Apache Spark</engine>\n    <orchestrator>Apache Airflow</orchestrator>\n  </processing>\n  <storage>\n    <warehouse>BigQuery</warehouse>\n    <cache>Redis</cache>\n  </storage>\n  <analytics>\n    <dashboard>Grafana</dashboard>\n    <alerts>PagerDuty</alerts>\n  </analytics>\n</dataPipeline>`,
        plaintext: `DATA PIPELINE & ANALYTICS\n\nCost: 1500 WAGUS tokens\n\nPipeline components:\n- Data ingestion (APIs, DBs, files)\n- ETL processing (Apache Spark)\n- Orchestration (Apache Airflow)\n- Storage (BigQuery/Snowflake)\n- Caching (Redis)\n\nAnalytics features:\n- Real-time dashboards\n- Custom metrics\n- Alerting system\n- Data quality monitoring\n\nOutput:\n- Pipeline code\n- DAG definitions\n- Dashboard configs\n- Monitoring setup\n- Documentation`
      }
    },
    {
      id: 'enterprise-saas',
      name: 'Enterprise SaaS Platform',
      description: 'Complete enterprise-grade SaaS platform with multi-tenancy, billing, and advanced features',
      category: 'Enterprise',
      cost: 8500,
      popularity: 98,
      featured: true,
      estimatedTokens: 50000,
      tags: ['SaaS', 'Multi-tenant', 'Enterprise', 'Billing', 'Analytics'],
      content: {
        markdown: `# Enterprise SaaS Platform\n\nUltimate enterprise solution with:\n\n## Core Features\n- Multi-tenant architecture\n- Advanced user management\n- Subscription billing\n- Analytics dashboard\n- API management\n- White-label options\n\n## Tech Stack\n- Frontend: Next.js + TypeScript\n- Backend: Node.js + NestJS\n- Database: PostgreSQL + Redis\n- Payment: Stripe + PayPal\n- Analytics: Mixpanel + Custom\n\n## Enterprise Features\n\`\`\`typescript\nclass TenantManager {\n  async createTenant(config: TenantConfig) {\n    // Multi-tenant logic\n  }\n}\n\`\`\``,
        xml: `<?xml version="1.0" encoding="UTF-8"?>\n<enterpriseSaas>\n  <features>\n    <multiTenancy enabled="true" />\n    <billing provider="stripe" />\n    <analytics provider="mixpanel" />\n    <apiManagement enabled="true" />\n    <whiteLabel enabled="true" />\n  </features>\n  <architecture>\n    <frontend>Next.js + TypeScript</frontend>\n    <backend>NestJS + Node.js</backend>\n    <database>PostgreSQL + Redis</database>\n    <deployment>Docker + Kubernetes</deployment>\n  </architecture>\n</enterpriseSaas>`,
        plaintext: `ENTERPRISE SAAS PLATFORM\n\nCost: 8,500 WAGUS tokens\nEstimated completion: 2-3 hours\n\nComplete enterprise solution:\n- Multi-tenant architecture\n- Advanced user roles & permissions\n- Subscription billing (Stripe/PayPal)\n- Real-time analytics dashboard\n- API management & documentation\n- White-label customization\n- SSO integration\n- Compliance (GDPR, SOC2)\n\nDeliverables:\n- Complete codebase (50+ files)\n- Database schemas & migrations\n- API documentation\n- Deployment scripts\n- Admin dashboard\n- User documentation\n- Security audit checklist`
      }
    },
    {
      id: 'ai-agent-framework',
      name: 'AI Agent Framework',
      description: 'Build autonomous AI agents with memory, planning, and tool integration',
      category: 'AI/ML',
      cost: 12000,
      popularity: 94,
      featured: true,
      estimatedTokens: 60000,
      tags: ['AI Agents', 'LangChain', 'Memory', 'Planning', 'Tools'],
      content: {
        markdown: `# AI Agent Framework\n\nAdvanced autonomous AI agent system:\n\n## Agent Capabilities\n- Long-term memory\n- Strategic planning\n- Tool integration\n- Multi-modal processing\n- Self-improvement\n\n## Architecture\n- Agent orchestration\n- Memory management\n- Tool registry\n- Planning engine\n- Execution monitor\n\n## Implementation\n\`\`\`python\nclass AutonomousAgent:\n    def __init__(self, tools, memory):\n        self.tools = tools\n        self.memory = memory\n        self.planner = StrategicPlanner()\n\`\`\``,
        xml: `<?xml version="1.0" encoding="UTF-8"?>\n<aiAgentFramework>\n  <capabilities>\n    <memory type="longTerm" />\n    <planning type="strategic" />\n    <tools integration="dynamic" />\n    <multiModal enabled="true" />\n    <selfImprovement enabled="true" />\n  </capabilities>\n  <components>\n    <orchestrator />\n    <memoryManager />\n    <toolRegistry />\n    <planningEngine />\n    <executionMonitor />\n  </components>\n</aiAgentFramework>`,
        plaintext: `AI AGENT FRAMEWORK\n\nCost: 12,000 WAGUS tokens\nEstimated completion: 4-5 hours\n\nAdvanced AI agent system:\n- Autonomous decision making\n- Long-term memory storage\n- Strategic planning capabilities\n- Dynamic tool integration\n- Multi-modal processing\n- Self-improvement mechanisms\n- Agent communication protocols\n\nFramework includes:\n- Agent orchestration system\n- Memory management (vector DB)\n- Tool registry & integration\n- Planning & reasoning engine\n- Execution monitoring\n- Performance analytics\n\nDeliverables:\n- Complete framework code\n- Agent templates\n- Tool integration examples\n- Memory system setup\n- Documentation & tutorials`
      }
    },
    {
      id: 'quantum-crypto-suite',
      name: 'Quantum-Resistant Crypto Suite',
      description: 'Next-generation cryptographic suite with quantum-resistant algorithms',
      category: 'Security',
      cost: 15000,
      popularity: 89,
      featured: true,
      estimatedTokens: 45000,
      tags: ['Quantum', 'Cryptography', 'Security', 'Post-Quantum'],
      content: {
        markdown: `# Quantum-Resistant Crypto Suite\n\nFuture-proof cryptographic implementation:\n\n## Algorithms\n- CRYSTALS-Kyber (Key encapsulation)\n- CRYSTALS-Dilithium (Digital signatures)\n- SPHINCS+ (Hash-based signatures)\n- BIKE (Code-based cryptography)\n\n## Features\n- Hybrid classical/post-quantum\n- Performance optimization\n- Hardware acceleration\n- Compliance ready\n\n## Implementation\n\`\`\`rust\nuse post_quantum_crypto::*;\n\nstruct QuantumSafe {\n    kyber: KyberKeyPair,\n    dilithium: DilithiumKeyPair,\n}\n\`\`\``,
        xml: `<?xml version="1.0" encoding="UTF-8"?>\n<quantumCrypto>\n  <algorithms>\n    <keyEncapsulation>CRYSTALS-Kyber</keyEncapsulation>\n    <digitalSignatures>CRYSTALS-Dilithium</digitalSignatures>\n    <hashBased>SPHINCS+</hashBased>\n    <codeBased>BIKE</codeBased>\n  </algorithms>\n  <features>\n    <hybrid enabled="true" />\n    <optimization level="high" />\n    <hardware acceleration="true" />\n    <compliance standards="NIST" />\n  </features>\n</quantumCrypto>`,
        plaintext: `QUANTUM-RESISTANT CRYPTO SUITE\n\nCost: 15,000 WAGUS tokens\nEstimated completion: 6-8 hours\n\nNext-generation cryptography:\n- CRYSTALS-Kyber key encapsulation\n- CRYSTALS-Dilithium signatures\n- SPHINCS+ hash-based crypto\n- BIKE code-based algorithms\n- Hybrid classical/post-quantum\n\nImplementation features:\n- High-performance optimization\n- Hardware acceleration support\n- NIST compliance ready\n- Migration tools from classical\n- Comprehensive test suite\n\nDeliverables:\n- Complete crypto library\n- Performance benchmarks\n- Migration documentation\n- Compliance reports\n- Integration examples\n- Security audit results`
      }
    },
    {
      id: 'neural-architecture-search',
      name: 'Neural Architecture Search Engine',
      description: 'Automated neural network design with evolutionary algorithms and performance optimization',
      category: 'AI/ML',
      cost: 20000,
      popularity: 92,
      featured: true,
      estimatedTokens: 75000,
      tags: ['NAS', 'AutoML', 'Neural Networks', 'Optimization'],
      content: {
        markdown: `# Neural Architecture Search Engine\n\nAutomated neural network design system:\n\n## Search Methods\n- Evolutionary algorithms\n- Reinforcement learning\n- Differentiable architecture search\n- Progressive search\n\n## Optimization\n- Multi-objective optimization\n- Hardware-aware search\n- Efficiency constraints\n- Performance prediction\n\n## Implementation\n\`\`\`python\nclass NASEngine:\n    def __init__(self, search_space, objectives):\n        self.search_space = search_space\n        self.objectives = objectives\n        self.predictor = PerformancePredictor()\n\`\`\``,
        xml: `<?xml version="1.0" encoding="UTF-8"?>\n<nasEngine>\n  <searchMethods>\n    <evolutionary enabled="true" />\n    <reinforcementLearning enabled="true" />\n    <differentiable enabled="true" />\n    <progressive enabled="true" />\n  </searchMethods>\n  <optimization>\n    <multiObjective enabled="true" />\n    <hardwareAware enabled="true" />\n    <efficiency constraints="strict" />\n    <prediction accuracy="high" />\n  </optimization>\n</nasEngine>`,
        plaintext: `NEURAL ARCHITECTURE SEARCH ENGINE\n\nCost: 20,000 WAGUS tokens\nEstimated completion: 8-10 hours\n\nAutomated neural network design:\n- Evolutionary search algorithms\n- Reinforcement learning optimization\n- Differentiable architecture search\n- Progressive search strategies\n- Multi-objective optimization\n- Hardware-aware constraints\n\nAdvanced features:\n- Performance prediction models\n- Efficiency optimization\n- Custom search spaces\n- Distributed search\n- Result visualization\n- Model deployment\n\nDeliverables:\n- Complete NAS framework\n- Pre-trained predictors\n- Search space definitions\n- Optimization algorithms\n- Visualization tools\n- Research documentation`
      }
    },
    {
      id: 'metaverse-platform',
      name: 'Metaverse Platform Engine',
      description: 'Complete metaverse platform with VR/AR, blockchain integration, and social features',
      category: 'Metaverse',
      cost: 25000,
      popularity: 96,
      featured: true,
      estimatedTokens: 100000,
      tags: ['Metaverse', 'VR/AR', 'Blockchain', 'Social', '3D'],
      content: {
        markdown: `# Metaverse Platform Engine\n\nComplete metaverse ecosystem:\n\n## Core Features\n- 3D world engine\n- VR/AR support\n- Avatar system\n- Social interactions\n- Virtual economy\n\n## Blockchain Integration\n- NFT marketplace\n- Virtual land ownership\n- Cryptocurrency payments\n- Smart contracts\n\n## Implementation\n\`\`\`typescript\nclass MetaverseEngine {\n  constructor() {\n    this.worldEngine = new ThreeJSEngine();\n    this.blockchain = new Web3Integration();\n    this.social = new SocialLayer();\n  }\n}\n\`\`\``,
        xml: `<?xml version="1.0" encoding="UTF-8"?>\n<metaversePlatform>\n  <core>\n    <worldEngine>Three.js + WebGL</worldEngine>\n    <vrSupport enabled="true" />\n    <arSupport enabled="true" />\n    <avatarSystem enabled="true" />\n    <socialFeatures enabled="true" />\n  </core>\n  <blockchain>\n    <nftMarketplace enabled="true" />\n    <virtualLand enabled="true" />\n    <payments crypto="true" />\n    <smartContracts enabled="true" />\n  </blockchain>\n</metaversePlatform>`,
        plaintext: `METAVERSE PLATFORM ENGINE\n\nCost: 25,000 WAGUS tokens\nEstimated completion: 12-15 hours\n\nComplete metaverse ecosystem:\n- 3D world engine (Three.js/WebGL)\n- VR/AR device support\n- Advanced avatar system\n- Real-time social interactions\n- Virtual economy & marketplace\n- NFT integration\n- Virtual land ownership\n- Cryptocurrency payments\n- Smart contract integration\n\nPlatform features:\n- Multi-user environments\n- Physics simulation\n- Audio/video chat\n- Content creation tools\n- Analytics dashboard\n- Mobile compatibility\n\nDeliverables:\n- Complete platform code\n- 3D assets & templates\n- Smart contracts\n- Mobile apps\n- Admin dashboard\n- User documentation\n- Deployment guide`
      }
    }
  ]

  const categories = ['all', 'Development', 'AI/ML', 'Blockchain', 'Architecture', 'Data', 'Enterprise', 'Security', 'Metaverse']

  const activeSession = sessions.find(s => s.id === activeSessionId)

  useEffect(() => {
    // Load sessions from localStorage
    const savedSessions = localStorage.getItem('wagus-sessions')
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions)
      setSessions(parsedSessions)
      if (parsedSessions.length > 0) {
        setActiveSessionId(parsedSessions[0].id)
      }
    }

    // Set default model
    if (!selectedModel && aiModels.length > 0) {
      setSelectedModel(aiModels[0])
    }
  }, [])

  const createNewSession = () => {
    if (!newSessionName.trim()) {
      toast.error('Please enter a session name')
      return
    }

    const newSession: Session = {
      id: Date.now().toString(),
      name: newSessionName,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      commands: [],
      model: selectedModel || aiModels[0],
      totalCost: 0
    }

    const updatedSessions = [...sessions, newSession]
    setSessions(updatedSessions)
    setActiveSessionId(newSession.id)
    setNewSessionName('')
    setShowNewSessionModal(false)
    
    // Save to localStorage
    localStorage.setItem('wagus-sessions', JSON.stringify(updatedSessions))
    toast.success('New session created successfully')
  }

  const executeCommand = async (command: PremiumCommand) => {
    if (!activeSession) {
      toast.error('Please create a session first')
      return
    }

    if (credits < command.cost) {
      setPendingCommand(command)
      setShowPaymentModal(true)
      return
    }

    // Deduct credits
    updateCredits(-command.cost)
    toast.success(`${command.cost} WAGUS tokens deducted`)

    const newCommand: Command = {
      id: Date.now().toString(),
      sessionId: activeSession.id,
      name: command.name,
      description: command.description,
      content: command.content,
      timestamp: new Date().toISOString(),
      status: 'pending',
      isPremium: true,
      cost: command.cost,
      model: selectedModel || aiModels[0]
    }

    // Update session with new command
    const updatedSessions = sessions.map(session => {
      if (session.id === activeSession.id) {
        return {
          ...session,
          commands: [...session.commands, newCommand],
          lastActivity: new Date().toISOString(),
          totalCost: session.totalCost + command.cost
        }
      }
      return session
    })

    setSessions(updatedSessions)
    localStorage.setItem('wagus-sessions', JSON.stringify(updatedSessions))
    setShowCommandMarketplace(false)

    // Simulate command execution
    setTimeout(() => {
      const runningUpdatedSessions = updatedSessions.map(session => {
        if (session.id === activeSession.id) {
          return {
            ...session,
            commands: session.commands.map(cmd => 
              cmd.id === newCommand.id 
                ? { ...cmd, status: 'running' as const }
                : cmd
            )
          }
        }
        return session
      })
      setSessions(runningUpdatedSessions)
      localStorage.setItem('wagus-sessions', JSON.stringify(runningUpdatedSessions))
    }, 1000)

    // Complete command execution
    setTimeout(() => {
      const completedOutput = `✅ Command "${command.name}" executed successfully\n\n🤖 AI Model: ${selectedModel?.name || 'GPT-4'}\n💰 Cost: ${command.cost} WAGUS tokens\n⏱️ Execution time: ${Math.floor(Math.random() * 30) + 10} seconds\n\n📋 Generated Content:\n${command.content.plaintext.substring(0, 200)}...\n\n🎯 Status: Ready for download and implementation\n\n💡 Next Steps:\n1. Review generated content in different formats\n2. Download files for implementation\n3. Follow setup instructions\n4. Test and deploy\n\n🔗 All files have been prepared and are ready for download.`
      
      const finalUpdatedSessions = sessions.map(session => {
        if (session.id === activeSession.id) {
          return {
            ...session,
            commands: session.commands.map(cmd => 
              cmd.id === newCommand.id 
                ? { 
                    ...cmd, 
                    status: 'completed' as const,
                    output: completedOutput,
                    executionTime: Math.floor(Math.random() * 30) + 10
                  }
                : cmd
            )
          }
        }
        return session
      })
      setSessions(finalUpdatedSessions)
      localStorage.setItem('wagus-sessions', JSON.stringify(finalUpdatedSessions))
      toast.success('Command completed successfully!')
    }, 5000)
  }

  const toggleCommandExpansion = (commandId: string) => {
    const newExpanded = new Set(expandedCommands)
    if (newExpanded.has(commandId)) {
      newExpanded.delete(commandId)
    } else {
      newExpanded.add(commandId)
    }
    setExpandedCommands(newExpanded)
  }

  const filteredCommands = premiumCommands.filter(command => {
    const matchesSearch = command.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         command.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         command.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || command.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getStatusIcon = (status: Command['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'running': return <Loader className="w-4 h-4 text-blue-500 animate-spin" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusColor = (status: Command['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      case 'running': return 'text-blue-600 bg-blue-50'
      case 'completed': return 'text-green-600 bg-green-50'
      case 'error': return 'text-red-600 bg-red-50'
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Command Sessions</h1>
            <p className="text-gray-600">Manage multiple AI command sessions simultaneously</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Terminal className="w-4 h-4" />
              <span>{sessions.length} sessions</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
              <CreditCard className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">{credits} WAGUS</span>
            </div>
            <button
              onClick={() => setShowCommandMarketplace(true)}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Crown className="w-4 h-4 mr-2" />
              Premium Commands
            </button>
            <button
              onClick={() => setShowNewSessionModal(true)}
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Session
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sessions Sidebar */}
        <div className="w-80 border-r border-gray-200 bg-gray-50">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Sessions</h3>
            <div className="space-y-2">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setActiveSessionId(session.id)}
                  className={`w-full p-3 text-left rounded-lg border transition-colors ${
                    activeSessionId === session.id
                      ? 'bg-white border-orange-200 shadow-sm'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 truncate">{session.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      session.status === 'active' ? 'bg-green-100 text-green-800' :
                      session.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      session.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    <div>{session.commands.length} commands</div>
                    <div>{session.totalCost} WAGUS spent</div>
                    <div>Model: {session.model.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {activeSession ? (
            <>
              {/* Session Header */}
              <div className="p-6 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{activeSession.name}</h2>
                    <p className="text-sm text-gray-600">
                      Created {new Date(activeSession.createdAt).toLocaleDateString()} • 
                      {activeSession.commands.length} commands • 
                      {activeSession.totalCost} WAGUS spent
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedModel?.id || ''}
                      onChange={(e) => {
                        const model = aiModels.find(m => m.id === e.target.value)
                        setSelectedModel(model || null)
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {aiModels.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name} ({model.provider})
                          {model.isPremium && ' 👑'}
                        </option>
                      ))}
                    </select>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Commands List */}
              <div className="flex-1 overflow-auto p-6">
                {activeSession.commands.length === 0 ? (
                  <div className="text-center py-12">
                    <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No commands yet</h3>
                    <p className="text-gray-600 mb-4">Add premium commands to start building</p>
                    <button
                      onClick={() => setShowCommandMarketplace(true)}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Browse Premium Commands
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {activeSession.commands.map((command) => (
                      <div key={command.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {/* Command Header */}
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(command.status)}
                              <div>
                                <h4 className="font-medium text-gray-900">{command.name}</h4>
                                <p className="text-sm text-gray-600">{command.description}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(command.timestamp).toLocaleString()} • 
                                  Model: {command.model.name} • 
                                  Cost: {command.cost} WAGUS
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(command.status)}`}>
                                {command.status}
                              </span>
                              <button
                                onClick={() => toggleCommandExpansion(command.id)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                {expandedCommands.has(command.id) ? 
                                  <ChevronDown className="w-4 h-4" /> : 
                                  <ChevronRight className="w-4 h-4" />
                                }
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Command Content */}
                        {expandedCommands.has(command.id) && (
                          <div className="p-4">
                            {/* Content Format Tabs */}
                            <div className="flex space-x-1 mb-4 border-b border-gray-200">
                              {(['markdown', 'xml', 'plaintext'] as const).map((format) => (
                                <button
                                  key={format}
                                  onClick={() => setActiveContentTab(format)}
                                  className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                                    activeContentTab === format
                                      ? 'border-orange-500 text-orange-600'
                                      : 'border-transparent text-gray-500 hover:text-gray-700'
                                  }`}
                                >
                                  {format === 'markdown' && <FileText className="w-4 h-4 inline mr-1" />}
                                  {format === 'xml' && <Code className="w-4 h-4 inline mr-1" />}
                                  {format === 'plaintext' && <Database className="w-4 h-4 inline mr-1" />}
                                  {format.toUpperCase()}
                                </button>
                              ))}
                            </div>

                            {/* Content Display */}
                            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
                              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                                {command.content[activeContentTab]}
                              </pre>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center space-x-2">
                                <button className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copy
                                </button>
                                <button className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </button>
                              </div>
                              {command.status === 'completed' && (
                                <span className="text-sm text-green-600 font-medium">
                                  ✅ Ready for implementation
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Command Output */}
                        {command.output && (
                          <div className="p-4 border-t border-gray-200">
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Execution Output</h5>
                            <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-gray-50 rounded p-3">
                              {command.output}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Terminal className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No session selected</h3>
                <p className="text-gray-600 mb-4">Create a new session to get started</p>
                <button
                  onClick={() => setShowNewSessionModal(true)}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Create Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Session Modal */}
      {showNewSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Session</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Name
                </label>
                <input
                  type="text"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="e.g., E-commerce App Development"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Model
                </label>
                <select
                  value={selectedModel?.id || ''}
                  onChange={(e) => {
                    const model = aiModels.find(m => m.id === e.target.value)
                    setSelectedModel(model || null)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {aiModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} ({model.provider})
                      {model.isPremium && ' 👑'}
                    </option>
                  ))}
                </select>
                {selectedModel && (
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedModel.description} • ${selectedModel.costPerToken}/token
                  </p>
                )}
              </div>
            </div>
            <div className="flex space-x-3 pt-6">
              <button
                onClick={() => {
                  setShowNewSessionModal(false)
                  setNewSessionName('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createNewSession}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Create Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Commands Marketplace */}
      {showCommandMarketplace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl h-5/6 flex flex-col">
            {/* Marketplace Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Premium Commands Marketplace</h3>
                  <p className="text-gray-600">Powerful AI commands with rich content and documentation</p>
                </div>
                <button
                  onClick={() => setShowCommandMarketplace(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              {/* Search and Filters */}
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search commands..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Commands Grid */}
            <div className="flex-1 overflow-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCommands.map((command) => (
                  <div key={command.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Command Card Header */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{command.name}</h4>
                            {command.featured && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{command.description}</p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span className="px-2 py-1 bg-gray-100 rounded">{command.category}</span>
                            <span>⭐ {command.popularity}%</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {command.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                            {tag}
                          </span>
                        ))}
                        {command.tags.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            +{command.tags.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Pricing */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Crown className="w-4 h-4 text-purple-600" />
                          <span className="font-semibold text-purple-600">{command.cost} WAGUS</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          ~{command.estimatedTokens.toLocaleString()} tokens
                        </span>
                      </div>
                    </div>

                    {/* Command Actions */}
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => executeCommand(command)}
                          disabled={!activeSession}
                          className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          {!activeSession ? 'Create Session First' : 'Execute Command'}
                        </button>
                        <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && pendingCommand && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Insufficient WAGUS Tokens</h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false)
                  setPendingCommand(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium">Premium Command Requires More Tokens</p>
                  <p className="text-sm text-gray-600 mt-1">
                    The command "{pendingCommand.name}" requires {pendingCommand.cost} WAGUS tokens to execute.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Your current tokens:</span>
                  <span className="font-medium">{credits}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Required tokens:</span>
                  <span className="font-medium">{pendingCommand.cost}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2 mt-2">
                  <span className="text-gray-600">Tokens needed:</span>
                  <span className="font-medium text-red-600">
                    {pendingCommand.cost - credits}
                  </span>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                <p>• Purchase WAGUS tokens to unlock premium commands</p>
                <p>• Commands include rich content in multiple formats</p>
                <p>• Your command will be saved and executed after purchase</p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowPaymentModal(false)
                    setPendingCommand(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowPaymentModal(false)
                    navigate('/payment')
                  }}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Buy WAGUS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommandInterface