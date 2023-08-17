import React, { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [messages, setMessages] = useState([]);
  const [plasadaRate, setPlasadaRate] = useState(0.05);
  const [totalMeronBet, setTotalMeronBet] = useState(0);
  const [totalWalaBet, setTotalWalaBet] = useState(0);
  const socketRef = useRef(null);
  const [meronOdds, setMeronOdds] = useState(0);
  const [walaOdds, setWalaOdds] = useState(0);
  const [commission, setCommission] = useState(0);
  const [betAmount, setBetAmount] = useState('');
  const handleLogin = () => {
    if (username === 'admin' && password === 'password') {
      setRole('admin');
      setLoggedIn(true);
    } else if (username === 'teller' && password === 'password') {
      setRole('teller');
      setLoggedIn(true);
    } else {
      alert('Invalid credentials!');
    }
  };

  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:8080');

    socketRef.current.onopen = () => {
      console.log('WebSocket connected!');
    };

    socketRef.current.onmessage = (message) => {
      const { type, data } = JSON.parse(message.data);
      switch (type) {
        case 'oddsData':
          setCommission(data.commission);
          setMeronOdds(data.meronOdds);
          setWalaOdds(data.walaOdds);
          setTotalMeronBet(data.totalMeronBet); // Handle the totalMeronBet value
          setTotalWalaBet(data.totalWalaBet);
          break;
        case 'chatMessage':
          setMessages((prevMessages) => [...prevMessages, data.content]);
          break;
        default:
          console.warn('Received unknown message type:', type);
      }
    };

    return () => {
      socketRef.current.close();
    };
  }, []);

  const handleAddBet = (type) => {
    if (type === 'Meron') {
      setTotalMeronBet((prev) => prev + Number(betAmount));
    } else if (type === 'Wala') {
      setTotalWalaBet((prev) => prev + Number(betAmount));
    }
    setBetAmount(''); // reset the input after adding the bet
  };

  useEffect(() => {
    handleSendData();
  }, [totalMeronBet, totalWalaBet]);

  const handleSendData = () => {
    const dataToSend = {
      plasadaRate: plasadaRate,
      totalMeronBet: totalMeronBet,
      totalWalaBet: totalWalaBet,
    };
    console.log(dataToSend);
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(dataToSend));
    }
  };

  if (!loggedIn) {
    return (
      <div className="login">
        <h2>Login</h2>
        <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  return (
    <div className="App">
      {role === 'admin' && (
        <>
          <header className="App-header">
            <h1>Texas Cockpit Arena</h1>
          </header>
          <div className="totals-section">
            <div className="total">
              <h2>Total Meron Bet: </h2>
              <span>{totalMeronBet}</span>
            </div>
            <div className="total">
              <h2>Total Wala Bet: </h2>
              <span>{totalWalaBet}</span>
            </div>
          </div>
          <div className="odds-section">
            <div className="odd">
              <h2>Meron Odds</h2>
              <span>{meronOdds}</span>
            </div>
            <div className="odd">
              <h2>Wala Odds</h2>
              <span>{walaOdds}</span>
            </div>
          </div>
          <div className="commission-section">
            <h2>Commission</h2>
            <span>{commission}</span>
          </div>
          <div class="history-section">
            <h2>History Winner</h2>
            <div class="scoreboard">
              <div class="entry player"></div>
              <div class="entry player"></div>
              <div class="entry player"></div>
              <div class="entry player"></div>
              <div class="entry player"></div>
              <div class="entry banker"></div>
              <div class="entry tie"></div>
            </div>
          </div>
          <div className="input-section">
            <div className="input-group">
              <label className="label-text">Enter Bet:</label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="Enter Bet Amount..."
              />
              <div className="button-group">
                <button className="meron-btn" onClick={() => handleAddBet('Meron')}>
                  Meron
                </button>
                <button className="wala-btn" onClick={() => handleAddBet('Wala')}>
                  Wala
                </button>
              </div>
            </div>
          </div>

          <ul className="messages">
            {messages.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        </>
      )}
      {role === 'teller' && (
        <>
          <header className="App-header">
            <h1>Texas Cockpit Arena</h1>
          </header>
          <div className="totals-section">
            <div className="total">
              <h2>Total Meron Bet: </h2>
              <span>{totalMeronBet}</span>
            </div>
            <div className="total">
              <h2>Total Wala Bet: </h2>
              <span>{totalWalaBet}</span>
            </div>
          </div>
          <div className="odds-section">
            <div className="odd">
              <h2>Meron Odds</h2>
              <span>{meronOdds}</span>
            </div>
            <div className="odd">
              <h2>Wala Odds</h2>
              <span>{walaOdds}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
