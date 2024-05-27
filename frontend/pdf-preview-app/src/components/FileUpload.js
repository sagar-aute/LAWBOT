import React, { useState } from 'react';
import './FileUpload.css';
import PdfPreview from './PdfPreview';

const FileUpload = ({ onFileUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  // const handleFileChange = (e) => {
  //   const file = e.target.files[0];
  //   setSelectedFile(file);
  //   onFileUpload(file);
  // };
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  
    const formData = new FormData();
    formData.append('pdf', file);
  
    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        console.log('File uploaded successfully');
        // Handle successful upload if needed
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };
  

  return (
    <div>
      <div className="file-upload">
        <label htmlFor="pdf-upload" className="file-label">
          Upload PDF
        </label>
        <input
          type="file"
          accept=".pdf"
          id="pdf-upload"
          onChange={handleFileChange}
          className="file-input"
        />
        {selectedFile && (
          <p className="file-selected">Selected file: {selectedFile.name}</p>
        )}
    </div>
    {selectedFile && <PdfPreview selectedFile={selectedFile} />} 
   </div>
  );
};

export default FileUpload;
