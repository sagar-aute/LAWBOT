import React, { useState } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import PdfPreview from './components/PdfPreview';
import Chat from './components/Chat';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileUpload = (file) => {
    setSelectedFile(URL.createObjectURL(file));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>PDF Preview</h1>
        <FileUpload onFileUpload={handleFileUpload} />
        <main className="App-main">
          {selectedFile && <PdfPreview pdfUrl={selectedFile} />}
        </main>
      </header>
      <div className="Chat">
        <h1>React Chat Interface</h1>
        <Chat />
      </div>
    </div>
  );
}

export default App;
