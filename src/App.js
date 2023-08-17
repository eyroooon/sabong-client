import React, { useEffect, useRef, useState } from 'react';
import './App.css';

const dummyData = [
  { fightNo: 1, bet: 'Meron', betAmount: 100, win: true, time: '10:00 AM', fightId: 'A1' },
  { fightNo: 2, bet: 'Wala', betAmount: 50, win: false, time: '10:30 AM', fightId: 'A2' },
  { fightNo: 3, bet: 'Draw', betAmount: 0, win: false, time: '11:00 AM', fightId: 'A3' },
  { fightNo: 3, bet: 'Draw', betAmount: 0, win: false, time: '11:00 AM', fightId: 'A3' },
  { fightNo: 3, bet: 'Draw', betAmount: 0, win: false, time: '11:00 AM', fightId: 'A3' },
  { fightNo: 3, bet: 'Draw', betAmount: 0, win: false, time: '11:00 AM', fightId: 'A3' },
  { fightNo: 3, bet: 'Draw', betAmount: 0, win: false, time: '11:00 AM', fightId: 'A3' },
  { fightNo: 3, bet: 'Draw', betAmount: 0, win: false, time: '11:00 AM', fightId: 'A3' },
  { fightNo: 3, bet: 'Draw', betAmount: 0, win: false, time: '11:00 AM', fightId: 'A3' },
  { fightNo: 3, bet: 'Draw', betAmount: 0, win: false, time: '11:00 AM', fightId: 'A3' },
  { fightNo: 3, bet: 'Draw', betAmount: 0, win: false, time: '11:00 AM', fightId: 'A3' },
  { fightNo: 3, bet: 'Draw', betAmount: 0, win: false, time: '11:00 AM', fightId: 'A3' },
  { fightNo: 3, bet: 'Draw', betAmount: 0, win: false, time: '11:00 AM', fightId: 'A3' },
  { fightNo: 3, bet: 'Draw', betAmount: 0, win: false, time: '11:00 AM', fightId: 'A3' },
  { fightNo: 3, bet: 'Draw', betAmount: 0, win: false, time: '11:00 AM', fightId: 'A3' },
  { fightNo: 3, bet: 'Draw', betAmount: 0, win: false, time: '11:00 AM', fightId: 'A3' },

  // ... add more dummy data as needed
];

const transformToBigRoad = (outcomes) => {
  let bigRoad = [];
  let currentColumn = [];
  let lastOutcome = null;

  outcomes.forEach((outcome) => {
    if (outcome === 'tie') {
      // Handle tie, e.g., add a tie marker to the last cell in currentColumn
      // If you want to represent ties as separate cells, you can push them to currentColumn
    } else if (lastOutcome === outcome || lastOutcome === null) {
      currentColumn.push(outcome);
    } else {
      bigRoad.push(currentColumn);
      currentColumn = [outcome];
    }
    lastOutcome = outcome;
  });

  if (currentColumn.length > 0) {
    bigRoad.push(currentColumn);
  }

  return bigRoad;
};

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
  const [tableData, setTableData] = useState(dummyData);
  const [filters, setFilters] = useState({
    fightNo: '',
    bet: '',
    betAmount: '',
    win: '',
    time: '',
    fightId: '',
  });

  const [gameOutcomes, setGameOutcomes] = useState([
    'player',
    'player',
    'player',
    'banker',
    'player',
    'banker',
    'player',
    'player',
    'tie',
    'player',
    'banker',
  ]);

  const recordOutcome = (outcome) => {
    setGameOutcomes((prevOutcomes) => [...prevOutcomes, outcome]);
  };

  const handleLogin = () => {
    if (username === 'teller' && password === 'password') {
      setRole('teller');
      setLoggedIn(true);
    } else if (username === 'display' && password === 'password') {
      setRole('display');
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
  if (role === 'teller') {
    return (
      <div className="App">
        <>
          <div className="left-section">
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
              <div className="history-section">
                <h2>Fight History</h2>
                <div className="big-road">
                  {transformToBigRoad(gameOutcomes).map((column, colIndex) => (
                    <div key={colIndex} className="column">
                      {column.map((outcome, rowIndex) => (
                        <div key={rowIndex} className={`cell ${outcome}`}></div>
                      ))}
                    </div>
                  ))}
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
                    <button className="draw-btn" onClick={() => {}}>
                      Draw
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
          </div>
          <div className="right-section">
            <div className="table-filters">
              <input
                placeholder="Fight No."
                value={filters.fightNo}
                onChange={(e) => setFilters({ ...filters, fightNo: e.target.value })}
              />
              <select value={filters.bet} onChange={(e) => setFilters({ ...filters, bet: e.target.value })}>
                <option value="">All</option>
                <option value="Meron">Meron</option>
                <option value="Wala">Wala</option>
                <option value="Draw">Draw</option>
              </select>
              <input
                type="number"
                placeholder="Bet Amount"
                value={filters.betAmount}
                onChange={(e) => setFilters({ ...filters, betAmount: e.target.value })}
              />
              <select value={filters.win} onChange={(e) => setFilters({ ...filters, win: e.target.value })}>
                <option value="">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
              <input type="time" value={filters.time} onChange={(e) => setFilters({ ...filters, time: e.target.value })} />
              <input
                placeholder="Fight ID"
                value={filters.fightId}
                onChange={(e) => setFilters({ ...filters, fightId: e.target.value })}
              />
            </div>

            <table>
              <thead>
                <tr>
                  <th>Fight No.</th>
                  <th>Bet</th>
                  <th>Bet Amount</th>
                  <th>Win</th>
                  <th>Time</th>
                  <th>Fight ID</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((item) => (
                  <tr key={item.fightId}>
                    <td>{item.fightNo}</td>
                    <td>{item.bet}</td>
                    <td>{item.betAmount}</td>
                    <td>{item.win ? 'Yes' : 'No'}</td>
                    <td>{item.time}</td>
                    <td>{item.fightId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      </div>
    );
  }
  if (role === 'display') {
    return (
      <div className="display">
        {role === 'display' && (
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
            <div className="history-section">
              <h2>Big Road Scoreboard</h2>
              <div className="big-road">
                {transformToBigRoad(gameOutcomes).map((column, colIndex) => (
                  <div key={colIndex} className="column">
                    {column.map((outcome, rowIndex) => (
                      <div key={rowIndex} className={`cell ${outcome}`}></div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
}

export default App;
