import { useState } from 'react'
import { Brain, Sparkles, ArrowRight, Copy, Check, Wand2 } from 'lucide-react'
import { toast } from 'sonner'

interface PromptOptimizerProps {
  isOwned: boolean
  onPurchase: () => void
}

const PromptOptimizer = ({ isOwned, onPurchase }: PromptOptimizerProps) => {
  const [inputPrompt, setInputPrompt] = useState('')
  const [optimizedPrompt, setOptimizedPrompt] = useState('')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [copied, setCopied] = useState(false)

  const optimizePrompt = async () => {
    if (!inputPrompt.trim()) {
      toast.error('Please enter a prompt to optimize')
      return
    }

    setIsOptimizing(true)
    
    try {
      // Simulate AI optimization with realistic delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Enhanced prompt optimization logic
      const optimized = enhancePrompt(inputPrompt)
      setOptimizedPrompt(optimized)
      toast.success('Prompt optimized successfully!')
    } catch (error) {
      toast.error('Failed to optimize prompt. Please try again.')
    } finally {
      setIsOptimizing(false)
    }
  }

  const enhancePrompt = (prompt: string): string => {
    // Advanced prompt optimization techniques
    let enhanced = prompt.trim()
    
    // Add context and specificity
    if (!enhanced.includes('context') && !enhanced.includes('specific')) {
      enhanced = `Please provide a detailed and specific response. ${enhanced}`
    }
    
    // Add role-based instruction
    if (!enhanced.toLowerCase().includes('act as') && !enhanced.toLowerCase().includes('you are')) {
      enhanced = `Act as an expert in this field. ${enhanced}`
    }
    
    // Add output format specification
    if (!enhanced.includes('format') && !enhanced.includes('structure')) {
      enhanced = `${enhanced} Please structure your response clearly with examples where appropriate.`
    }
    
    // Add reasoning instruction
    if (!enhanced.includes('explain') && !enhanced.includes('reasoning')) {
      enhanced = `${enhanced} Explain your reasoning step by step.`
    }
    
    // Add quality constraints
    enhanced = `${enhanced} Ensure accuracy and provide actionable insights.`
    
    return enhanced
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(optimizedPrompt)
      setCopied(true)
      toast.success('Optimized prompt copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  if (!isOwned) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12 border-2 border-dashed rounded-lg" style={{ borderColor: `rgb(var(--border))` }}>
          <Brain className="w-16 h-16 mx-auto mb-4" style={{ color: `rgb(var(--primary))` }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: `rgb(var(--foreground))` }}>
            Prompt Optimizer Pro
          </h3>
          <p className="mb-6" style={{ color: `rgb(var(--foreground) / 0.7)` }}>
            Unlock AI-powered prompt optimization for better results. Transform your prompts into highly effective instructions.
          </p>
          <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: `rgb(var(--accent) / 0.1)` }}>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-2xl font-bold" style={{ color: `rgb(var(--primary))` }}>10,000</span>
              <span style={{ color: `rgb(var(--foreground) / 0.7)` }}>WAGUS</span>
            </div>
            <p className="text-sm" style={{ color: `rgb(var(--foreground) / 0.6)` }}>One-time purchase</p>
          </div>
          <button
            onClick={onPurchase}
            className="px-6 py-3 rounded-lg font-medium transition-colors"
            style={{ 
              backgroundColor: `rgb(var(--primary))`, 
              color: `rgb(var(--primary-foreground))` 
            }}
          >
            Purchase Prompt Optimizer Pro
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Brain className="w-8 h-8" style={{ color: `rgb(var(--primary))` }} />
          <h1 className="text-3xl font-bold" style={{ color: `rgb(var(--foreground))` }}>
            Prompt Optimizer Pro
          </h1>
          <Sparkles className="w-6 h-6" style={{ color: `rgb(var(--accent))` }} />
        </div>
        <p className="text-lg" style={{ color: `rgb(var(--foreground) / 0.7)` }}>
          Transform your prompts into highly effective AI instructions
        </p>
      </div>

      {/* Main Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-semibold" style={{ color: `rgb(var(--foreground))` }}>
              Original Prompt
            </h2>
          </div>
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Enter your prompt here... For example: 'Write a blog post about AI'"
            className="w-full h-64 p-4 rounded-lg border resize-none focus:ring-2 focus:ring-offset-2 transition-colors"
            style={{ 
              backgroundColor: `rgb(var(--card))`,
              borderColor: `rgb(var(--border))`,
              color: `rgb(var(--card-foreground))`,

            }}
          />
          <button
            onClick={optimizePrompt}
            disabled={isOptimizing || !inputPrompt.trim()}
            className="w-full py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: `rgb(var(--primary))`, 
              color: `rgb(var(--primary-foreground))` 
            }}
          >
            {isOptimizing ? (
              <>
                <Wand2 className="w-5 h-5 animate-spin" />
                <span>Optimizing...</span>
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                <span>Optimize Prompt</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold" style={{ color: `rgb(var(--foreground))` }}>
              Optimized Prompt
            </h2>
            {optimizedPrompt && (
              <button
                onClick={copyToClipboard}
                className="flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: `rgb(var(--accent) / 0.1)`,
                  color: `rgb(var(--accent))`
                }}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            )}
          </div>
          <div 
            className="w-full h-64 p-4 rounded-lg border overflow-y-auto"
            style={{ 
              backgroundColor: `rgb(var(--card))`,
              borderColor: `rgb(var(--border))`,
              color: `rgb(var(--card-foreground))`
            }}
          >
            {optimizedPrompt ? (
              <div className="whitespace-pre-wrap">{optimizedPrompt}</div>
            ) : (
              <div className="text-center py-16" style={{ color: `rgb(var(--foreground) / 0.5)` }}>
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Your optimized prompt will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-12 p-6 rounded-lg" style={{ backgroundColor: `rgb(var(--accent) / 0.1)` }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: `rgb(var(--foreground))` }}>
          💡 Optimization Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm" style={{ color: `rgb(var(--foreground) / 0.8)` }}>
          <div>
            <h4 className="font-medium mb-2">✨ What gets optimized:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Adds context and specificity</li>
              <li>Includes role-based instructions</li>
              <li>Specifies output format</li>
              <li>Adds reasoning requirements</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">🎯 Best practices:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Be clear about your desired outcome</li>
              <li>Include relevant context</li>
              <li>Specify the format you want</li>
              <li>Ask for examples when helpful</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PromptOptimizer