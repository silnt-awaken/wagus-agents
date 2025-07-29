import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { 
  GitBranch, 
  Folder, 
  File, 
  Search, 
  RefreshCw, 
  Download, 
  Upload, 
  Check, 
  X, 
  Plus, 
  Minus,
  Eye,
  Code,
  Settings
} from 'lucide-react'
import { toast } from 'sonner'

interface FileNode {
  name: string
  type: 'file' | 'directory'
  path: string
  size?: number
  modified?: string
  children?: FileNode[]
}

interface DiffChange {
  type: 'added' | 'removed' | 'modified'
  file: string
  oldContent?: string
  newContent?: string
  lineChanges: {
    line: number
    type: 'add' | 'remove' | 'modify'
    content: string
  }[]
}

const RepositoryViewer = () => {
  const [connectedRepo, setConnectedRepo] = useState<string | null>(null)
  const [fileTree, setFileTree] = useState<FileNode[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [pendingChanges, setPendingChanges] = useState<DiffChange[]>([])
  const [viewMode, setViewMode] = useState<'files' | 'diff'>('files')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [repoUrl, setRepoUrl] = useState('')

  useEffect(() => {
    // Mock data for demonstration
    if (connectedRepo) {
      setFileTree([
        {
          name: 'src',
          type: 'directory',
          path: 'src',
          children: [
            {
              name: 'components',
              type: 'directory',
              path: 'src/components',
              children: [
                { name: 'App.tsx', type: 'file', path: 'src/components/App.tsx', size: 2048, modified: '2 hours ago' },
                { name: 'Header.tsx', type: 'file', path: 'src/components/Header.tsx', size: 1024, modified: '1 day ago' }
              ]
            },
            {
              name: 'hooks',
              type: 'directory',
              path: 'src/hooks',
              children: [
                { name: 'useAuth.ts', type: 'file', path: 'src/hooks/useAuth.ts', size: 512, modified: '3 hours ago' }
              ]
            },
            { name: 'index.tsx', type: 'file', path: 'src/index.tsx', size: 256, modified: '1 day ago' }
          ]
        },
        { name: 'package.json', type: 'file', path: 'package.json', size: 1536, modified: '2 days ago' },
        { name: 'README.md', type: 'file', path: 'README.md', size: 2048, modified: '1 week ago' }
      ])

      // Mock pending changes
      setPendingChanges([
        {
          type: 'modified',
          file: 'src/components/App.tsx',
          oldContent: 'const App = () => {\n  return <div>Hello World</div>\n}',
          newContent: 'const App = () => {\n  return <div>Hello WAGUS!</div>\n}',
          lineChanges: [
            { line: 2, type: 'modify', content: '  return <div>Hello WAGUS!</div>' }
          ]
        },
        {
          type: 'added',
          file: 'src/components/NewFeature.tsx',
          newContent: 'import React from "react"\n\nconst NewFeature = () => {\n  return <div>New Feature</div>\n}\n\nexport default NewFeature',
          lineChanges: [
            { line: 1, type: 'add', content: 'import React from "react"' },
            { line: 2, type: 'add', content: '' },
            { line: 3, type: 'add', content: 'const NewFeature = () => {' },
            { line: 4, type: 'add', content: '  return <div>New Feature</div>' },
            { line: 5, type: 'add', content: '}' },
            { line: 6, type: 'add', content: '' },
            { line: 7, type: 'add', content: 'export default NewFeature' }
          ]
        }
      ])
    }
  }, [connectedRepo])

  const connectRepository = () => {
    if (!repoUrl.trim()) {
      toast.error('Please enter a repository URL')
      return
    }

    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setConnectedRepo(repoUrl)
      setShowConnectModal(false)
      setRepoUrl('')
      setIsLoading(false)
      toast.success('Repository connected successfully')
    }, 2000)
  }

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath)
    setViewMode('files')
    
    // Mock file content
    const mockContent = `// ${filePath}\nimport React from 'react'\n\nconst Component = () => {\n  return (\n    <div className="p-4">\n      <h1>Hello from ${filePath}</h1>\n    </div>\n  )\n}\n\nexport default Component`
    setFileContent(mockContent)
  }

  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return nodes.map((node) => (
      <div key={node.path} style={{ marginLeft: `${level * 16}px` }}>
        <div
          className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${
            selectedFile === node.path ? 'bg-orange-50 text-orange-700' : ''
          }`}
          onClick={() => node.type === 'file' && handleFileSelect(node.path)}
        >
          {node.type === 'directory' ? (
            <Folder className="w-4 h-4 text-blue-600" />
          ) : (
            <File className="w-4 h-4 text-gray-600" />
          )}
          <span className="text-sm">{node.name}</span>
          {node.type === 'file' && node.size && (
            <span className="text-xs text-gray-500 ml-auto">
              {(node.size / 1024).toFixed(1)}KB
            </span>
          )}
        </div>
        {node.children && renderFileTree(node.children, level + 1)}
      </div>
    ))
  }

  const renderDiffView = () => {
    return (
      <div className="space-y-4">
        {pendingChanges.map((change, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {change.type === 'added' && <Plus className="w-4 h-4 text-green-600" />}
                  {change.type === 'removed' && <Minus className="w-4 h-4 text-red-600" />}
                  {change.type === 'modified' && <Code className="w-4 h-4 text-blue-600" />}
                  <span className="font-medium text-sm">{change.file}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    change.type === 'added' ? 'bg-green-100 text-green-800' :
                    change.type === 'removed' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {change.type}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedFile(change.file)}
                  className="text-orange-600 hover:text-orange-700 text-sm"
                >
                  View File
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-1">
                {change.lineChanges.map((lineChange, lineIndex) => (
                  <div
                    key={lineIndex}
                    className={`flex items-start space-x-3 p-2 rounded text-sm font-mono ${
                      lineChange.type === 'add' ? 'bg-green-50' :
                      lineChange.type === 'remove' ? 'bg-red-50' :
                      'bg-blue-50'
                    }`}
                  >
                    <span className="text-gray-500 w-8 text-right">{lineChange.line}</span>
                    <span className={`w-4 ${
                      lineChange.type === 'add' ? 'text-green-600' :
                      lineChange.type === 'remove' ? 'text-red-600' :
                      'text-blue-600'
                    }`}>
                      {lineChange.type === 'add' ? '+' : lineChange.type === 'remove' ? '-' : '~'}
                    </span>
                    <span className="flex-1">{lineChange.content}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!connectedRepo) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <GitBranch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Repository Connected</h3>
          <p className="text-gray-600 mb-6">Connect a repository to view files and manage changes</p>
          <button
            onClick={() => setShowConnectModal(true)}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Connect Repository
          </button>
        </div>

        {/* Connect Repository Modal */}
        {showConnectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Connect Repository</h3>
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repository URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/username/repository"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowConnectModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={connectRepository}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      'Connect'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex">
      {/* File Tree Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Repository</h2>
            <button
              onClick={() => setShowConnectModal(true)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-600 truncate">{connectedRepo}</p>
          
          {/* Search */}
          <div className="mt-3 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* File Tree */}
        <div className="flex-1 overflow-auto p-2">
          {renderFileTree(fileTree)}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('files')}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    viewMode === 'files'
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Eye className="w-4 h-4 mr-2 inline" />
                  Files
                </button>
                <button
                  onClick={() => setViewMode('diff')}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    viewMode === 'diff'
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <GitBranch className="w-4 h-4 mr-2 inline" />
                  Changes ({pendingChanges.length})
                </button>
              </div>
            </div>
            
            {pendingChanges.length > 0 && (
              <div className="flex items-center space-x-2">
                <button className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <X className="w-4 h-4 mr-2 inline" />
                  Discard
                </button>
                <button className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Check className="w-4 h-4 mr-2 inline" />
                  Commit Changes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'files' ? (
            selectedFile ? (
              <div className="h-full">
                <div className="p-3 bg-gray-50 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-900">{selectedFile}</span>
                </div>
                <Editor
                  height="100%"
                  defaultLanguage="typescript"
                  value={fileContent}
                  theme="vs-light"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    lineNumbers: 'on',
                    renderWhitespace: 'selection'
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <File className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Select a file to view its contents</p>
                </div>
              </div>
            )
          ) : (
            <div className="h-full overflow-auto p-6">
              {pendingChanges.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <GitBranch className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No pending changes</p>
                  </div>
                </div>
              ) : (
                renderDiffView()
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RepositoryViewer