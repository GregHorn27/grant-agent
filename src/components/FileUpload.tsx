'use client'

import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText } from 'lucide-react'

interface FileUploadProps {
  onFilesUploaded: (files: File[]) => void
  onClose: () => void
}

export default function FileUpload({ onFilesUploaded, onClose }: FileUploadProps) {
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md']
    },
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (files) => {
      if (files.length > 0) {
        onFilesUploaded(files)
      }
    }
  })

  const getFileIcon = (file: File) => {
    return <FileText className="w-4 h-4 text-blue-500" />
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Upload Documents</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        
        {isDragActive ? (
          <p className="text-sm text-blue-600">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              Text (.txt) and Markdown (.md) files (max 10MB each)
            </p>
          </div>
        )}
      </div>

      {acceptedFiles.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-900 mb-2">Selected files:</p>
          <div className="space-y-2">
            {acceptedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                {getFileIcon(file)}
                <span>{file.name}</span>
                <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => onFilesUploaded([...acceptedFiles])}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
          >
            Upload {acceptedFiles.length} file{acceptedFiles.length !== 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  )
}