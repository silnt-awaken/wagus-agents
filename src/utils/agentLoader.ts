// Agent loader utility
import { Agent } from '../types/agent'

// Define pricing tiers based on complexity and demand
const PRICING_MATRIX = {
  // Engineering - High complexity, high demand
  'ai-engineer': { price: 25000, tier: 'Legendary' as const },
  'backend-architect': { price: 18000, tier: 'Enterprise' as const },
  'devops-automator': { price: 15000, tier: 'Enterprise' as const },
  'frontend-developer': { price: 12000, tier: 'Professional' as const },
  'mobile-app-builder': { price: 14000, tier: 'Professional' as const },
  'rapid-prototyper': { price: 8000, tier: 'Professional' as const },
  'test-writer-fixer': { price: 6000, tier: 'Starter' as const },

  // Design - Creative value
  'ui-designer': { price: 16000, tier: 'Enterprise' as const },
  'ux-researcher': { price: 14000, tier: 'Professional' as const },
  'brand-guardian': { price: 12000, tier: 'Professional' as const },
  'visual-storyteller': { price: 10000, tier: 'Professional' as const },
  'whimsy-injector': { price: 7000, tier: 'Starter' as const },

  // Marketing - ROI potential
  'growth-hacker': { price: 20000, tier: 'Enterprise' as const },
  'content-creator': { price: 15000, tier: 'Enterprise' as const },
  'app-store-optimizer': { price: 12000, tier: 'Professional' as const },
  'instagram-curator': { price: 8000, tier: 'Professional' as const },
  'tiktok-strategist': { price: 9000, tier: 'Professional' as const },
  'twitter-engager': { price: 6000, tier: 'Starter' as const },
  'reddit-community-builder': { price: 7000, tier: 'Starter' as const },

  // Product - Strategic value
  'trend-researcher': { price: 16000, tier: 'Enterprise' as const },
  'feedback-synthesizer': { price: 11000, tier: 'Professional' as const },
  'sprint-prioritizer': { price: 9000, tier: 'Professional' as const },

  // Project Management - Efficiency
  'project-shipper': { price: 13000, tier: 'Professional' as const },
  'studio-producer': { price: 10000, tier: 'Professional' as const },
  'experiment-tracker': { price: 8000, tier: 'Professional' as const },

  // Studio Operations - Business critical
  'analytics-reporter': { price: 14000, tier: 'Professional' as const },
  'finance-tracker': { price: 12000, tier: 'Professional' as const },
  'legal-compliance-checker': { price: 18000, tier: 'Enterprise' as const },
  'infrastructure-maintainer': { price: 11000, tier: 'Professional' as const },
  'support-responder': { price: 7000, tier: 'Starter' as const },

  // Testing - Quality assurance
  'performance-benchmarker': { price: 13000, tier: 'Professional' as const },
  'api-tester': { price: 9000, tier: 'Professional' as const },
  'test-results-analyzer': { price: 8000, tier: 'Professional' as const },
  'tool-evaluator': { price: 6000, tier: 'Starter' as const },
  'workflow-optimizer': { price: 7000, tier: 'Starter' as const },

  // Bonus - Fun and unique
  'joker': { price: 3000, tier: 'Starter' as const },
  'studio-coach': { price: 5000, tier: 'Starter' as const }
}

// Generate mock ratings and downloads based on tier and category
function generateMetrics(tier: string, category: string) {
  const baseRating = {
    'Legendary': 4.9,
    'Enterprise': 4.7,
    'Professional': 4.5,
    'Starter': 4.3
  }[tier] || 4.0

  const baseDownloads = {
    'Legendary': 1200,
    'Enterprise': 800,
    'Professional': 500,
    'Starter': 300
  }[tier] || 200

  // Add some randomness
  const rating = baseRating + (Math.random() * 0.2 - 0.1)
  const downloads = Math.floor(baseDownloads + (Math.random() * 400 - 200))

  return {
    rating: Math.round(rating * 10) / 10,
    downloads: Math.max(downloads, 50)
  }
}

// Extract tags from markdown content
function extractTags(content: string, category: string): string[] {
  const categoryTags = {
    'engineering': ['Development', 'Code', 'Technical'],
    'design': ['Design', 'UI/UX', 'Creative'],
    'marketing': ['Marketing', 'Growth', 'Social'],
    'product': ['Product', 'Strategy', 'Planning'],
    'project-management': ['Management', 'Planning', 'Delivery'],
    'studio-operations': ['Operations', 'Business', 'Analytics'],
    'testing': ['Testing', 'Quality', 'Automation'],
    'bonus': ['Fun', 'Team', 'Culture']
  }[category] || ['General']

  // Extract additional tags from content
  const contentTags: string[] = []
  const commonTerms = ['AI', 'ML', 'React', 'TypeScript', 'Python', 'API', 'Mobile', 'Web', 'Analytics', 'Automation']
  
  commonTerms.forEach(term => {
    if (content.toLowerCase().includes(term.toLowerCase())) {
      contentTags.push(term)
    }
  })

  return [...categoryTags, ...contentTags.slice(0, 3)]
}

// Extract preview from markdown content
function extractPreview(content: string): string {
  // Look for description or summary in the markdown
  const lines = content.split('\n')
  
  for (const line of lines) {
    if (line.trim() && !line.startsWith('#') && !line.startsWith('-') && line.length > 50) {
      return line.trim().substring(0, 120) + '...'
    }
  }
  
  return 'Professional AI agent to enhance your workflow'
}

// Agent file structure mapping
const AGENT_FILE_MAPPING = {
  // Engineering
  'ai-engineer': { file: 'engineering/ai-engineer.md', category: 'engineering' },
  'backend-architect': { file: 'engineering/backend-architect.md', category: 'engineering' },
  'devops-automator': { file: 'engineering/devops-automator.md', category: 'engineering' },
  'frontend-developer': { file: 'engineering/frontend-developer.md', category: 'engineering' },
  'mobile-app-builder': { file: 'engineering/mobile-app-builder.md', category: 'engineering' },
  'rapid-prototyper': { file: 'engineering/rapid-prototyper.md', category: 'engineering' },
  'test-writer-fixer': { file: 'engineering/test-writer-fixer.md', category: 'engineering' },

  // Design
  'ui-designer': { file: 'design/ui-designer.md', category: 'design' },
  'ux-researcher': { file: 'design/ux-researcher.md', category: 'design' },
  'brand-guardian': { file: 'design/brand-guardian.md', category: 'design' },
  'visual-storyteller': { file: 'design/visual-storyteller.md', category: 'design' },
  'whimsy-injector': { file: 'design/whimsy-injector.md', category: 'design' },

  // Marketing
  'growth-hacker': { file: 'marketing/growth-hacker.md', category: 'marketing' },
  'content-creator': { file: 'marketing/content-creator.md', category: 'marketing' },
  'app-store-optimizer': { file: 'marketing/app-store-optimizer.md', category: 'marketing' },
  'instagram-curator': { file: 'marketing/instagram-curator.md', category: 'marketing' },
  'tiktok-strategist': { file: 'marketing/tiktok-strategist.md', category: 'marketing' },
  'twitter-engager': { file: 'marketing/twitter-engager.md', category: 'marketing' },
  'reddit-community-builder': { file: 'marketing/reddit-community-builder.md', category: 'marketing' },

  // Product
  'trend-researcher': { file: 'product/trend-researcher.md', category: 'product' },
  'feedback-synthesizer': { file: 'product/feedback-synthesizer.md', category: 'product' },
  'sprint-prioritizer': { file: 'product/sprint-prioritizer.md', category: 'product' },

  // Project Management
  'project-shipper': { file: 'project-management/project-shipper.md', category: 'project-management' },
  'studio-producer': { file: 'project-management/studio-producer.md', category: 'project-management' },
  'experiment-tracker': { file: 'project-management/experiment-tracker.md', category: 'project-management' },

  // Studio Operations
  'analytics-reporter': { file: 'studio-operations/analytics-reporter.md', category: 'studio-operations' },
  'finance-tracker': { file: 'studio-operations/finance-tracker.md', category: 'studio-operations' },
  'legal-compliance-checker': { file: 'studio-operations/legal-compliance-checker.md', category: 'studio-operations' },
  'infrastructure-maintainer': { file: 'studio-operations/infrastructure-maintainer.md', category: 'studio-operations' },
  'support-responder': { file: 'studio-operations/support-responder.md', category: 'studio-operations' },

  // Testing
  'performance-benchmarker': { file: 'testing/performance-benchmarker.md', category: 'testing' },
  'api-tester': { file: 'testing/api-tester.md', category: 'testing' },
  'test-results-analyzer': { file: 'testing/test-results-analyzer.md', category: 'testing' },
  'tool-evaluator': { file: 'testing/tool-evaluator.md', category: 'testing' },
  'workflow-optimizer': { file: 'testing/workflow-optimizer.md', category: 'testing' },

  // Bonus
  'joker': { file: 'bonus/joker.md', category: 'bonus' },
  'studio-coach': { file: 'bonus/studio-coach.md', category: 'bonus' }
}

// Parse markdown content to extract agent information
function parseMarkdownAgent(content: string, agentId: string, category: string): Partial<Agent> {
  const lines = content.split('\n')
  let name = ''
  let description = ''
  let fullContent = content
  
  // Extract title (name)
  for (const line of lines) {
    if (line.startsWith('# ')) {
      name = line.substring(2).trim()
      break
    }
  }
  
  // Extract description (first substantial paragraph)
  let foundDescription = false
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('-') && !trimmed.startsWith('*') && trimmed.length > 30) {
      description = trimmed
      foundDescription = true
      break
    }
  }
  
  // Fallback name and description
  if (!name) {
    name = agentId.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }
  
  if (!foundDescription) {
    description = `Professional ${category} agent to enhance your workflow`
  }
  
  return {
    name,
    description,
    content: fullContent
  }
}

// Load agents from markdown files
export async function loadAgentsFromMarkdown(): Promise<Agent[]> {
  const agents: Agent[] = []
  
  // In a real implementation, this would read from the file system
  // For now, we'll simulate loading from the known agent files
  
  for (const [agentId, fileInfo] of Object.entries(AGENT_FILE_MAPPING)) {
    const pricing = PRICING_MATRIX[agentId as keyof typeof PRICING_MATRIX]
    if (pricing) {
      try {
        // Try to load actual markdown content first, fallback to simulation
        const content = await loadActualMarkdownContent(agentId)
        const parsedAgent = parseMarkdownAgent(content, agentId, fileInfo.category)
        const metrics = generateMetrics(pricing.tier, fileInfo.category)
        
        agents.push({
          id: agentId,
          name: parsedAgent.name || agentId,
          category: fileInfo.category,
          description: parsedAgent.description || `Professional ${fileInfo.category} agent`,
          price: pricing.price,
          tier: pricing.tier,
          rating: metrics.rating,
          downloads: metrics.downloads,
          tags: extractTags(parsedAgent.content || '', fileInfo.category),
          content: parsedAgent.content || '',
          preview: extractPreview(parsedAgent.content || ''),
          isPurchased: false
        })
      } catch (error) {
        console.warn(`Failed to load agent ${agentId}:`, error)
        // Create a basic agent entry even if loading fails
        const metrics = generateMetrics(pricing.tier, fileInfo.category)
        const fallbackName = agentId.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
        
        agents.push({
          id: agentId,
          name: fallbackName,
          category: fileInfo.category,
          description: `Professional ${fileInfo.category} agent`,
          price: pricing.price,
          tier: pricing.tier,
          rating: metrics.rating,
          downloads: metrics.downloads,
          tags: [fileInfo.category, pricing.tier],
          content: `# ${fallbackName}\n\nProfessional ${fileInfo.category} agent.`,
          preview: `Professional ${fileInfo.category} agent.`,
          isPurchased: false
        })
      }
    }
  }
  
  return agents
}

// Simulate markdown content (replace with actual file reading in production)
async function simulateMarkdownContent(agentId: string, category: string): Promise<string> {
  // This simulates the structure of the actual markdown files
  const templates = {
    'ai-engineer': `# AI Engineer

Advanced AI development and machine learning expertise for building cutting-edge applications.

## Core Responsibilities
- Design and implement machine learning models
- Develop AI-powered applications
- Optimize neural networks and algorithms
- Integrate AI services and APIs

## Expertise Areas
- Python, TensorFlow, PyTorch
- Natural Language Processing
- Computer Vision
- Deep Learning architectures

## Example Use Cases
- Build recommendation systems
- Create chatbots and virtual assistants
- Develop image recognition systems
- Implement predictive analytics`,
    
    'growth-hacker': `# Growth Hacker

Data-driven growth strategies and optimization to scale your business exponentially.

## Core Responsibilities
- Analyze user acquisition funnels
- Design and execute growth experiments
- Optimize conversion rates
- Develop viral marketing strategies

## Expertise Areas
- Analytics and data interpretation
- A/B testing methodologies
- User behavior analysis
- Marketing automation

## Example Use Cases
- Increase user acquisition by 300%
- Optimize onboarding flows
- Design referral programs
- Improve retention metrics`,
    
    'ui-designer': `# UI Designer

Beautiful, user-centered interface design that converts visitors into customers.

## Core Responsibilities
- Create stunning user interfaces
- Design responsive layouts
- Develop design systems
- Ensure accessibility compliance

## Expertise Areas
- Figma, Sketch, Adobe Creative Suite
- Design systems and component libraries
- User experience principles
- Visual design and typography

## Example Use Cases
- Design mobile app interfaces
- Create web application dashboards
- Develop brand identity systems
- Optimize user conversion flows`
  }
  
  // Return specific template or generate generic content
  if (templates[agentId as keyof typeof templates]) {
    return templates[agentId as keyof typeof templates]
  }
  
  // Generate generic content based on agent ID and category
  const name = agentId.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
  
  return `# ${name}

Professional ${category} expertise to enhance your workflow and deliver exceptional results.

## Core Responsibilities
- Provide expert guidance in ${category}
- Implement best practices and industry standards
- Optimize processes and workflows
- Deliver high-quality solutions

## Expertise Areas
- Advanced ${category} techniques
- Industry best practices
- Modern tools and frameworks
- Performance optimization

## Example Use Cases
- Solve complex ${category} challenges
- Implement scalable solutions
- Optimize existing processes
- Provide strategic guidance`
}

// Load agent content from file
export async function loadAgentContent(agentId: string): Promise<string> {
  const fileInfo = AGENT_FILE_MAPPING[agentId as keyof typeof AGENT_FILE_MAPPING]
  if (!fileInfo) {
    return `# ${agentId}\n\nAgent not found.`
  }
  
  try {
    // Try to load from the actual markdown file
    const response = await fetch(`/agents_md/${fileInfo.file}`)
    if (response.ok) {
      return await response.text()
    }
  } catch (error) {
    console.warn(`Failed to load ${fileInfo.file}:`, error)
  }
  
  // Fallback to simulated content
  return await simulateMarkdownContent(agentId, fileInfo.category)
}

// Load actual markdown content from public assets
export async function loadActualMarkdownContent(agentId: string): Promise<string> {
  const fileInfo = AGENT_FILE_MAPPING[agentId as keyof typeof AGENT_FILE_MAPPING]
  if (!fileInfo) {
    throw new Error(`Agent ${agentId} not found in file mapping`)
  }
  
  try {
    // Load files from public assets directory
    const response = await fetch(`/agents_md/${fileInfo.file}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${fileInfo.file}: ${response.statusText}`)
    }
    return await response.text()
  } catch (error) {
    console.warn(`Failed to load actual content for ${agentId}, using fallback:`, error)
    return await simulateMarkdownContent(agentId, fileInfo.category)
  }
}