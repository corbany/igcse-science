import React, { useState } from 'react';
import { 
  Maximize2, 
  ZoomIn, 
  X,
  FileText
} from 'lucide-react';
import { ExamQuestionItem } from '../types';

interface ExamPaperFigureScreenshotProps {
  question: ExamQuestionItem;
  paperTitle?: string;
  onOpenPdfGuide?: () => void;
}

export const ExamPaperFigureScreenshot: React.FC<ExamPaperFigureScreenshotProps> = ({
  question,
  paperTitle
}) => {
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const figureTitle = question.figureCaption || question.diagramCaption || (question.questionText.match(/\b(Fig\.\s*\d+\.\d+)\b/i)?.[1] || 'Figure');
  const figurePage = question.figurePageNumber ? `Page ${question.figurePageNumber}` : null;
  const hasFigureContent = Boolean(question.diagramSvg || question.figureScreenshotUrl);

  return (
    <div 
      className="my-4 rounded-xl border border-slate-700 bg-slate-900/90 shadow-md overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-slate-800/90 border-b border-slate-700/80 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {figureTitle}
          </span>
          <span className="text-slate-200 font-medium">
            Official Examination Paper Figure
          </span>
          {figurePage && (
            <span className="text-slate-400 hidden sm:inline">
              ({figurePage} in Question Paper)
            </span>
          )}
        </div>

        {/* Zoom Control */}
        {hasFigureContent && (
          <button
            type="button"
            onClick={() => setIsZoomed(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs transition border border-slate-600 font-medium"
            title="Enlarge figure to full screen"
          >
            <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Enlarge Figure</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-3.5 bg-slate-950/80">
        {question.figureScreenshotUrl ? (
          <div 
            onClick={() => setIsZoomed(true)}
            className="relative group flex justify-center items-center bg-white rounded-lg p-3 sm:p-5 border border-slate-700 shadow-inner cursor-zoom-in overflow-hidden"
          >
            <img 
              src={question.figureScreenshotUrl} 
              alt={`${figureTitle} diagram`}
              className="max-h-[420px] max-w-full w-auto object-contain rounded transition-transform duration-200 group-hover:scale-[1.01]"
            />
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/85 backdrop-blur text-white px-2.5 py-1 rounded text-xs flex items-center gap-1.5 pointer-events-none shadow-md">
              <ZoomIn className="w-3.5 h-3.5 text-sky-400" /> Click to enlarge
            </div>
          </div>
        ) : question.diagramSvg ? (
          <div 
            onClick={() => setIsZoomed(true)}
            className="relative group flex justify-center items-center bg-white rounded-lg p-3 sm:p-5 border border-slate-700 shadow-inner cursor-zoom-in overflow-x-auto"
          >
            <div 
              className="w-full max-w-2xl transition-transform duration-200 group-hover:scale-[1.01] flex justify-center items-center text-slate-900"
              dangerouslySetInnerHTML={{ __html: question.diagramSvg }}
            />
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/85 backdrop-blur text-white px-2.5 py-1 rounded text-xs flex items-center gap-1.5 pointer-events-none shadow-md">
              <ZoomIn className="w-3.5 h-3.5 text-sky-400" /> Click to enlarge
            </div>
          </div>
        ) : (
          <div className="p-5 text-center bg-slate-900/50 rounded-lg border border-slate-800 text-slate-400">
            <div className="flex items-center justify-center gap-2 mb-1 text-slate-300 font-semibold text-sm">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>{figureTitle}</span>
            </div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {question.figurePromptDescription || 'Official examination figure reference.'}
            </p>
          </div>
        )}

        {question.diagramCaption && question.diagramCaption !== figureTitle && (
          <div className="mt-2 text-center text-xs text-slate-400 italic">
            {question.diagramCaption}
          </div>
        )}
      </div>

      {/* Lightbox Zoom Modal */}
      {isZoomed && hasFigureContent && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col p-3 sm:p-6"
          onClick={() => setIsZoomed(false)}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-white max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-sm">
                {figureTitle}
              </span>
              <span className="text-slate-200 text-sm font-medium">
                Official Examination Figure (Full View)
              </span>
              {figurePage && (
                <span className="text-slate-400 text-xs hidden sm:inline">
                  • {figurePage}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsZoomed(false)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Close full-screen view"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div 
            className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl max-w-5xl max-h-[85vh] overflow-auto flex items-center justify-center text-slate-900 border border-slate-300">
              {question.figureScreenshotUrl ? (
                <img 
                  src={question.figureScreenshotUrl} 
                  alt={`${figureTitle} full size`}
                  className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded"
                />
              ) : question.diagramSvg ? (
                <div 
                  className="w-full max-w-4xl flex justify-center items-center"
                  dangerouslySetInnerHTML={{ __html: question.diagramSvg }}
                />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
