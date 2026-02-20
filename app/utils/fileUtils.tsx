import { DocumentIcon, PhotoIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const getIcon = ({ fileType }: any) => {
  if (fileType.includes('image')) {
    return <PhotoIcon className="w-5 h-5" />;
  }
  if (fileType.includes('text')) {
    return <DocumentTextIcon className="w-5 h-5" />;
  }
  return <DocumentIcon className="w-5 h-5" />;
};

// Helper function to format file size
export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FileIcon = ({ fileType }: any) => {
  const isUnsupported = 
    fileType?.startsWith("video/") ||
    fileType?.startsWith("audio/");

  const getIconColor = () => {
    if (isUnsupported) return 'text-gray-400';
    if (fileType.includes('pdf')) return 'text-red-500';
    if (fileType.includes('image')) return 'text-blue-500';
    if (fileType.includes('word') || fileType.includes('document')) return 'text-blue-700';
    if (fileType.includes('excel') || fileType.includes('sheet')) return 'text-green-600';
    if (fileType.includes('text')) return 'text-gray-500';
    return 'text-gray-400';
  };

  return (
    <div className={`${getIconColor()}`}>
      {getIcon({ fileType })}
    </div>
  );
};


// Handle file download
export const handleFileDownload = async (fileId: string | undefined, fileName: string) => {
  try {
    // Implement your file download logic here
    // This could be an API call to get the file
    const response = await fetch(`/api/files/${fileId}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    throw new Error(String('Error downloading file:' + error))
  }
};