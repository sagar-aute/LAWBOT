// Chat.js
import React, { useState } from 'react';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  // const handleSendMessage = () => {
  //   if (inputText.trim() !== '') {
  //     // User sends a message
  //     const userMessage = { text: inputText, sender: 'user' };
  //     const lawbotResponse = {
  //       text: getLawbotResponse(inputText),
  //       sender: 'lawbot',
  //     };

  //     setMessages([...messages, userMessage, lawbotResponse]);
  //     setInputText('');
  //   }
  // };

  const handleSendMessage = async () => {  // Make the function async
    if (inputText.trim() !== '') {
      const userMessage = { text: inputText, sender: 'user' };
      
      // Wait for the lawbot response before setting the messages
      const lawbotResponseText = await getLawbotResponse(inputText);
      const lawbotResponse = {
        text: lawbotResponseText,
        sender: 'lawbot',
      };
  
      setMessages(messages => [...messages, userMessage, lawbotResponse]);
      setInputText('');
    }
  };


  const getLawbotResponse = async (userInput) => {
    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ 'question': userInput })
      });
  
      if (response.ok) {
        const data = await response.json();
        return data.history[data.history.length - 1].content; // Assuming the last entry is the response
      }
    } catch (error) {
      console.error('Error fetching response:', error);
      return "There was an error communicating with the server.";
    }
  };
  

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            <span className={`tag ${message.sender}`}>{message.sender === 'user' ? 'You' : 'Lawbot'}: </span>
            {message.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
