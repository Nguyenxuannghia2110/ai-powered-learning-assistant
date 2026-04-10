import React, { useState, useRef } from 'react';
import { X, UploadCloud, Download } from 'lucide-react';
import quizService from '../../services/quizService';

export default function SpreadsheetUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
    } else {
      alert("Please upload a valid .xlsx or .csv file");
    }
  };

  const handleUploadFromDevice = async () => {
    if (!file) {
      inputRef.current?.click();
      return;
    }
    
    try {
      setIsUploading(true);
      const res = await quizService.previewQuizFromSheet(file);
      onUploadSuccess(res, file.name);
      onClose();
      setFile(null);
    } catch (err) {
      console.error(err);
      alert(err.error || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await quizService.downloadQuizTemplate();
    } catch(err) {
      console.error("Download template failed", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080f0c]/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-[#111614] border border-[#1e2924] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X size={20} />
        </button>

        <div className="p-8 flex flex-col items-center">
          <div className="w-12 h-12 bg-emerald-900/40 text-emerald-400 rounded-full flex items-center justify-center mb-6 border border-emerald-800/50">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2 text-center">Dataset Integration</h2>
          <p className="text-slate-400 text-sm text-center mb-8">
            Upload your quiz data spreadsheet to automatically generate assessments.
          </p>

          <input 
            ref={inputRef}
            type="file" 
            accept=".xlsx,.csv" 
            className="hidden" 
            onChange={handleChange} 
          />

          <div 
            className={`w-full aspect-[21/9] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
              dragActive ? "border-emerald-400 bg-emerald-900/20" : "border-emerald-800/50 hover:bg-[#1a231f] hover:border-emerald-600/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <UploadCloud className="w-10 h-10 text-emerald-400 mb-3" />
            <p className="font-medium text-white mb-1">
              {file ? file.name : "Drag & drop your matrix here"}
            </p>
            {!file && (
              <p className="text-sm text-slate-500">or click to browse local files</p>
            )}
          </div>

          <button 
            disabled={isUploading}
            onClick={(e) => { e.stopPropagation(); handleUploadFromDevice(); }}
            className="w-full py-3.5 mt-8 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-emerald-950 font-bold rounded-xl transition-all"
          >
            {isUploading ? "Processing..." : (file ? "Upload from device" : "Select File First")}
          </button>

          <div className="flex flex-col items-center mt-6 space-y-3 w-full">
            <p className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border border-slate-500 text-[8px] flex justify-center items-center">i</span>
              SUPPORTS .XLSX, .CSV
            </p>
            
            <button 
              onClick={handleDownloadTemplate}
              className="text-sm text-slate-400 hover:text-white flex items-center gap-1 border-b border-transparent hover:border-slate-400 pb-0.5 transition"
            >
              <Download size={14} /> Download template
            </button>
          </div>
        </div>

        <div className="bg-[#0b0e0c] p-4 flex justify-between items-center text-[10px] uppercase font-semibold tracking-widest text-slate-500 border-t border-[#1e2924]">
          <div className="flex flex-col">
            <span className="mb-0.5 opacity-50">STORAGE PROTOCOL</span>
            <span className="text-slate-400">AES-256 Encrypted</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="mb-0.5 opacity-50">MAX PAYLOAD</span>
            <span className="text-slate-400">256.00 MB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
