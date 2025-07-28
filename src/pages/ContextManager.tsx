import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  Code, 
  GitBranch, 
  Search, 
  Filter, 
  Folder, 
  Plus,
  X,
  Download,
  Eye
} from 'lucide-react'
import { toast } from 'sonner'

interface Context {
  id: string
  name: string
  type: 'markdown' | 'xml' | 'pdf' | 'image' | 'repository'
  size: number
  uploadedAt: string
  tags: string[]
  content?: string
}

const ContextManager = () => {
  const [contexts, setContexts] = useState<Context[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [repoUrl, setRepoUrl] = useState('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()
      
      reader.onload = () => {
        const newContext: Context = {
          id: Date.now().toString(),
          name: file.name,
          type: getFileType(file.name),
          size: file.size,
          uploadedAt: new Date().toISOString(),
          tags: [],
          content: reader.result as string
        }
        
        setContexts(prev => [...prev, newContext])
        toast.success(`Uploaded ${file.name} successfully`)
      }
      
      reader.readAsText(file)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/markdown': ['.md', '.markdown'],
      'application/xml': ['.xml'],
      'text/xml': ['.xml'],
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg']
    }
  })

  const getFileType = (filename: string): Context['type'] => {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'md':
      case 'markdown':
        return 'markdown'
      case 'xml':
        return 'xml'
      case 'pdf':
        return 'pdf'
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return 'image'
      default:
        return 'markdown'
    }
  }

  const getFileIcon = (type: Context['type']) => {
    switch (type) {
      case 'markdown':
        return <FileText className="w-5 h-5 text-blue-600" />
      case 'xml':
        return <Code className="w-5 h-5 text-green-600" />
      case 'pdf':
        return <File className="w-5 h-5 text-red-600" />
      case 'image':
        return <Image className="w-5 h-5 text-purple-600" />
      case 'repository':
        return <GitBranch className="w-5 h-5 text-orange-600" />
      default:
        return <File className="w-5 h-5 text-gray-600" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleRepoUpload = () => {
    if (!repoUrl.trim()) {
      toast.error('Please enter a repository URL')
      return
    }

    const newContext: Context = {
      id: Date.now().toString(),
      name: repoUrl.split('/').pop() || 'Repository',
      type: 'repository',
      size: 0,
      uploadedAt: new Date().toISOString(),
      tags: ['repository'],
      content: repoUrl
    }

    setContexts(prev => [...prev, newContext])
    setRepoUrl('')
    setShowUploadModal(false)
    toast.success('Repository linked successfully')
  }

  const filteredContexts = contexts.filter(context => {
    const matchesSearch = context.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || context.type === selectedType
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => context.tags.includes(tag))
    return matchesSearch && matchesType && matchesTags
  })

  const allTags = Array.from(new Set(contexts.flatMap(c => c.tags)))

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Context Manager</h1>
          <p className="text-gray-600">Upload and organize your development contexts</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Repository
        </button>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragActive
            ? 'border-orange-400 bg-orange-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {isDragActive ? 'Drop files here' : 'Upload your contexts'}
        </h3>
        <p className="text-gray-600 mb-4">
          Drag & drop files here, or click to select files
        </p>
        <p className="text-sm text-gray-500">
          Supports: Markdown (.md), XML (.xml), PDF (.pdf), Images (.png, .jpg, .svg)
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search contexts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="markdown">Markdown</option>
              <option value="xml">XML</option>
              <option value="pdf">PDF</option>
              <option value="image">Images</option>
              <option value="repository">Repositories</option>
            </select>
          </div>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Tags:</span>
              <div className="flex flex-wrap gap-1">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTags(prev => 
                        prev.includes(tag) 
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      )
                    }}
                    className={`px-2 py-1 text-xs rounded-full transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Context List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Contexts ({filteredContexts.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredContexts.length === 0 ? (
            <div className="p-8 text-center">
              <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No contexts found</p>
              <p className="text-sm text-gray-500">Upload some files to get started</p>
            </div>
          ) : (
            filteredContexts.map((context) => (
              <div key={context.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(context.type)}
                    <div>
                      <h3 className="font-medium text-gray-900">{context.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="capitalize">{context.type}</span>
                        <span>•</span>
                        <span>{formatFileSize(context.size)}</span>
                        <span>•</span>
                        <span>{new Date(context.uploadedAt).toLocaleDateString()}</span>
                      </div>
                      {context.tags.length > 0 && (
                        <div className="flex space-x-1 mt-1">
                          {context.tags.map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Repository Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Repository</h3>
              <button
                onClick={() => setShowUploadModal(false)}
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
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRepoUpload}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Add Repository
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContextManager