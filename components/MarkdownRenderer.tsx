import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // A very basic parser to handle bolding and newlines for cleaner output without heavy dependencies.
  // In a production app with npm access, 'react-markdown' is preferred.
  
  const processText = (text: string) => {
    return text.split('\n').map((line, index) => {
      // Basic bold processing for **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={index} className={`min-h-[1.2em] ${line.startsWith('#') ? 'font-bold text-lg mt-2 mb-1 text-emerald-800' : 'mb-1'}`}>
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="font-semibold text-emerald-900">{part.slice(2, -2)}</strong>;
            }
            // Handle bullet points
            if (part.trim().startsWith('* ') || part.trim().startsWith('- ')) {
                return <span key={i} className="ml-2 block">• {part.trim().substring(2)}</span>
            }
            return <span key={i}>{part}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <div className={`text-sm md:text-base leading-relaxed text-gray-700 ${className}`}>
      {processText(content)}
    </div>
  );
};

export default MarkdownRenderer;