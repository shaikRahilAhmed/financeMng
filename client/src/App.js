import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import './App.css';

const API = 'http://localhost:5000/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [transactions, setTransactions] = useState([]);
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');
  const [filterType, setFilterType] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const getData = async () => {
    if (!token) return;
    let url = `${API}/transactions?`;
    if (filterType) url += `type=${filterType}&`;
    if (dateRange.start) url += `start=${dateRange.start}&`;
    if (dateRange.end) url += `end=${dateRange.end}&`;
    const res = await axios.get(url, { headers: { Authorization: token } });
    setTransactions(res.data);
  };

  useEffect(() => { getData(); }, [token, filterType, dateRange]);

  const addTransaction = async () => {
    if (!text || !amount) return;
    await axios.post(`${API}/transactions`, { text, amount: parseFloat(amount), type }, { headers: { Authorization: token } });
    setText(''); setAmount('');
    getData();
  };

  const deleteTransaction = async (id) => {
    await axios.delete(`${API}/transactions/${id}`, { headers: { Authorization: token } });
    getData();
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/users/${authMode}`, authForm);
      if (authMode === 'login') {
        setToken(res.data.token);
        setUsername(res.data.username);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('username', res.data.username);
      } else {
        setAuthMode('login');
        setError('Registered! Please login.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    }
  };

  const logout = () => {
    setToken(''); setUsername('');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  };

  const income = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);

  // Chart data
  const chartData = {
    labels: transactions.map(t => t.text),
    datasets: [
      {
        label: 'Amount',
        data: transactions.map(t => t.amount),
        backgroundColor: transactions.map(t => t.type === 'income' ? 'green' : 'red'),
      }
    ]
  };

  if (!token) {
    return (
      <div className="container">
        <h2>FinTrack</h2>
        <form onSubmit={handleAuth}>
          <input placeholder="Username" value={authForm.username} onChange={e => setAuthForm({ ...authForm, username: e.target.value })} />
          <input type="password" placeholder="Password" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} />
          <button type="submit">{authMode === 'login' ? 'Login' : 'Register'}</button>
        </form>
        <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
          {authMode === 'login' ? 'Switch to Register' : 'Switch to Login'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    );
  }

  return (
    <div className="container">
      <h2>FinTrack</h2>
      <div>
        <span>Welcome, {username}!</span>
        <button onClick={logout} style={{ marginLeft: 10 }}>Logout</button>
      </div>
      <h4>Balance: ₹{income - expense}</h4>
      <div className="inc-exp">
        <div><h5>Income</h5><p className="plus">₹{income}</p></div>
        <div><h5>Expense</h5><p className="minus">₹{expense}</p></div>
      </div>
      <div className="form">
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Text" />
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" />
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <button onClick={addTransaction}>Add Transaction</button>
      </div>
      <div className="filters">
        <select value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} />
        <input type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} />
        <button onClick={getData}>Filter</button>
      </div>
      <ul className="list">
        {transactions.map(t => (
          <li key={t._id} className={t.type === 'expense' ? 'minus' : 'plus'}>
            {t.text} <span>₹{t.amount}</span>
            <button className="delete-btn" onClick={() => deleteTransaction(t._id)}>x</button>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 30 }}>
        <Bar data={chartData} />
      </div>
    </div>
  );
}

export default App;
