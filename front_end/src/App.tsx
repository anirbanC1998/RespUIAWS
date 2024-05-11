import React,  { useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => setInputText(e.target.value);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files ? e.target.files[0] : null);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    console.log('Submit:', inputText, file);
    // API call to upload file and text
  };

  return (
    <div className="App">
      <header className="App-header">
        <form onSubmit={handleSubmit} className="flex flex-col items-center justify-left min-h-screen">
          <input
            type="text"
            placeholder="Enter Text"
            value={inputText}
            onChange={handleTextChange}
            className="input input-bordered input-primary w-full max-w-xs"
          />
          <input
            type="file"
            onChange={handleFileChange}
            className="input input-bordered input-primary w-full max-w-xs mt-4"
          />
          <button type="submit" className="btn btn-primary mt-4">
            Submit
          </button>
        </form>
      </header>
    </div>
  );
}

export default App;
