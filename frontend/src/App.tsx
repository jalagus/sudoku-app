import React, { useState } from 'react';
import './App.css';

const initialBoard = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

const App: React.FC = () => {
  const [board, setBoard] = useState<number[][]>(initialBoard);
  const [statusMessage, setStatus] = useState<string>("");

  const handleChange = (row: number, col: number, value: number) => {
    if (value > 9) {
      value = 9;
    }
    if (value < 0) {
      value = 0;
    }
    const newBoard = [...board];
    newBoard[row][col] = value;
    setBoard(newBoard);
  };

  const renderCell = (row: number, col: number) => {
    return (
      <input
        type="number"
        value={board[row][col] || ''}
        onChange={(e) => handleChange(row, col, parseInt(e.target.value, 10))}
      />
    );
  };

  const checkSolution = () => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: board })
    };    
    fetch('http://localhost:8000/check', requestOptions)
      .then(response => response.json())
      .then(data => {
        if (data["status"] == "success") {
          setStatus(data.solutions + " solution found.");
        }
        else {
          setStatus("No solutions.");
        }
      });
  };

  const tryToSolve = () => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: board })
    };    
    fetch('http://localhost:8000/solve', requestOptions)
      .then(response => response.json())
      .then(data => {
        if (data["status"] == "success") {
          setBoard(data.solution);
          setStatus("Solution found.");
        }
        else {
          setStatus("No solution.");
        }
      });
  };

  return (
    <div className="App">
      <h1>Sudoku App</h1>
      <p>Sudoku app with Rust backend for brute force solving.</p>
      <div className="board">
        {board.map((row, rowIndex) => (
          <div className="row" key={rowIndex}>
            {row.map((col, colIndex) => (
              <div className="cell" key={colIndex}>
                {renderCell(rowIndex, colIndex)}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div>
        <button className="guiButton" onClick={checkSolution}>Check solution</button>
        <button className="guiButton" onClick={tryToSolve}>Try to solve</button>
      </div>
      <div className="statusBox">{statusMessage}</div>
    </div>
  );
};

export default App;
