import React, { useState, useEffect } from 'react';

const WebSocketComponent = () => {
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');

    // Connection opened
    socket.onopen = (event) => {
      console.log('WebSocket opened:', event);
    };

    // Listen for messages
    socket.onmessage = (event) => {
      console.log('Received:', event.data);
      setMessages((prevMessages) => [...prevMessages, event.data]);
    };

    // Connection closed
    socket.onclose = (event) => {
      if (event.wasClean) {
        console.log(`Closed cleanly, code=${event.code}, reason=${event.reason}`);
      } else {
        // Connection died
        console.error('Connection died');
      }
    };

    socket.onerror = (error) => {
      console.error(`[error] ${error.message}`);
    };

    // Set the WebSocket to the state
    setWs(socket);

    // Clean up the connection when component is unmounted
    return () => {
      socket.close(1000, 'Component unmounted');
    };
  }, []);

  const sendMessage = () => {
    if (ws) {
      if (ws.readyState === WebSocket.OPEN && inputValue.trim() !== '') {
        ws.send(inputValue);
        setInputValue('');
      } else {
        console.error('WebSocket is not open. readyState:', ws.readyState);
      }
    } else {
      console.error('WebSocket is not initialized.');
    }
  };
  console.log(messages)
  return (
    <div>
      <h2>Received Messages:</h2>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>

      <div>
        <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Enter message" />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default WebSocketComponent;
