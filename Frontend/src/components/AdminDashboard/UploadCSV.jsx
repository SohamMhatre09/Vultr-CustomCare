import React, { useState, useRef } from 'react';
import {useSelector} from 'react-redux';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { uploadCSV } from '../../services/operations/adminServices';

const UploadCSV = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const token = useSelector((state) => state.auth.token);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'text/csv') {
      if (selectedFile.size <= 10 * 1024 * 1024) { // 10MB limit
        setFile(selectedFile);
      } else {
        toast.error('File size exceeds 10MB limit');
      }
    } else {
      toast.error('Please select a valid CSV file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
  
    try {
      const formData = new FormData();
      formData.append('file', file);
  
      const response = await uploadCSV(
        file,
        token,
        (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      );
  
      toast.success('CSV uploaded successfully!');
      onUpload(response);
      resetUpload();
    } catch (error) {
      toast.error('Error uploading CSV');
      console.error('CSV upload error:', error);
      resetUpload();
    }
  };
  const resetUpload = () => {
    setFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full p-6">
      <form
        onSubmit={handleSubmit}
        className={`relative p-8 border-2 rounded-2xl shadow-lg transition-all duration-300 bg-white
          ${dragOver ? 'border-blue-500 ring-4 ring-blue-100' : 'border-gray-200'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div 
          className="cursor-pointer flex flex-col items-center justify-center p-8 border-dashed border-2 rounded-xl text-center 
          hover:bg-blue-50 transition-colors group"
          onClick={() => fileInputRef.current.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <Upload 
            size={56} 
            className={`mb-4 text-gray-400 group-hover:text-blue-500 transition-colors
            ${dragOver ? 'text-blue-500 animate-bounce' : ''}`} 
          />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Upload CSV File</h2>
          <p className="text-gray-500 mb-4">
            Drag & drop or 
            <span className="text-blue-500 ml-1 hover:underline">browse files</span>
          </p>
          <p className="text-xs text-gray-400">Supported file type: .csv (Max 10MB)</p>
        </div>

        {file && (
          <div className="mt-6 bg-gray-100 p-4 rounded-xl flex items-center space-x-4">
            <FileText className="text-blue-500" size={32} />
            <div className="flex-grow">
              <p className="font-medium text-gray-700">{file.name}</p>
              <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
            <button 
              type="button" 
              onClick={resetUpload} 
              className="text-red-500 hover:bg-red-100 rounded-full p-2"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {uploadProgress > 0 && (
          <div className="mt-6 w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={!file || uploadProgress > 0}
          className={`w-full mt-6 py-3.5 rounded-lg font-semibold transition-all duration-300
          flex items-center justify-center space-x-2
          ${file && uploadProgress === 0
            ? 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
          {uploadProgress > 0 ? (
            <>
              <CheckCircle size={20} />
              <span>Uploading {uploadProgress}%</span>
            </>
          ) : (
            'Upload CSV'
          )}
        </button>
      </form>
    </div>
  );
};

export default UploadCSV;
