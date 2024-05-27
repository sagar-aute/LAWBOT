import React from 'react';
import './PdfPreview.css';

const PdfPreview = ({ selectedFile }) => {
  const fileUrl =URL.createObjectURL(selectedFile);
  return (
    <div className="pdf-preview">
      <object
        data={fileUrl}
        type="application/pdf"
      >
        <p>Your browser does not support PDF previews. Please download the PDF to view it.</p>
      </object>
    </div>
  );
};

export default PdfPreview;
