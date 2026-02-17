import React from 'react';
import { GroundingChunk } from '../types';

interface TerminalOutputProps {
  title: string;
  content: string;
  loading?: boolean;
  groundingChunks?: GroundingChunk[];
}

const TerminalOutput: React.FC<TerminalOutputProps> = ({ title, content, loading, groundingChunks }) => {
  return (
    <div className="bg-[#0c0c0c] border border-gray-800 h-full flex flex-col font-mono text-sm overflow-hidden shadow-2xl">
      <div className="bg-[#1a1a1a] px-3 py-1 flex justify-between items-center border-b border-gray-800 select-none">
        <span className="font-bold text-gray-400 uppercase text-xs tracking-wider">{title}</span>
        <div className="flex space-x-2">
          <div className="w-2 h-2 rounded-full bg-gray-600"></div>
          <div className="w-2 h-2 rounded-full bg-gray-600"></div>
        </div>
      </div>
      <div className="p-4 flex-1 overflow-y-auto whitespace-pre-wrap text-gray-300 leading-relaxed">
        {loading ? (
          <div className="flex items-center space-x-2 text-yellow-500 animate-pulse">
            <span>PROCESSING REQUEST</span>
            <span className="animate-bounce">.</span>
            <span className="animate-bounce delay-100">.</span>
            <span className="animate-bounce delay-200">.</span>
          </div>
        ) : (
          <>
            {content}
            {groundingChunks && groundingChunks.length > 0 && (
              <div className="mt-6 border-t border-gray-800 pt-4">
                <h4 className="text-xs uppercase text-blue-500 font-bold mb-2">Source References</h4>
                <ul className="space-y-1">
                  {groundingChunks.map((chunk, i) => {
                    const uri = chunk.web?.uri || chunk.maps?.uri;
                    const title = chunk.web?.title || chunk.maps?.title || "Unknown Source";
                    if (!uri) return null;
                    return (
                      <li key={i}>
                        <a href={uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline truncate block">
                          [{i + 1}] {title}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TerminalOutput;