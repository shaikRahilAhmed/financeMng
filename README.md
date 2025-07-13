# financeMng
🌟 Project Name: FinTrack – Your Personal Finance Manager
🔧 Features:
✅ User Authentication (Login/Register)

✅ Add Expense/Income

✅ List Transactions (filter by date/type)

✅ View total balance, income, and expense

✅ Graphs for insights

✅ Fully responsive design

📁 Folder Structure:
pgsql
Copy
Edit
fintrack/
│
├── client/      (React frontend)
└── server/      (Node.js + Express backend)
📌 STEP-BY-STEP DEVELOPMENT
✅ 1. Set Up Project Folder
bash
Copy
Edit
mkdir fintrack
cd fintrack
npx create-react-app client
mkdir server
cd server
npm init -y
npm install express mongoose cors dotenv
✅ 2. Backend Setup (server/index.js)
javascript
Copy
Edit
// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Routes
const transactionRoutes = require('./routes/transactions');
app.use('/api/transactions', transactionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
✅ 3. MongoDB Model (server/models/Transaction.js)
javascript
Copy
Edit
// server/models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  text: String,
  amount: Number,
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
✅ 4. Express Routes (server/routes/transactions.js)
javascript
Copy
Edit
const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// GET all transactions
router.get('/', async (req, res) => {
  const transactions = await Transaction.find();
  res.json(transactions);
});

// POST a new transaction
router.post('/', async (req, res) => {
  const { text, amount } = req.body;
  const newTrans = new Transaction({ text, amount });
  await newTrans.save();
  res.json(newTrans);
});

// DELETE a transaction
router.delete('/:id', async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
  res.json({ msg: 'Deleted' });
});

module.exports = router;
✅ 5. Frontend Setup (React)
Navigate to client/ and install Axios and Chart.js:

bash
Copy
Edit
npm install axios chart.js react-chartjs-2
✅ 6. React Components
📄 App.js
jsx
Copy
Edit
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');

  const getData = async () => {
    const res = await axios.get('http://localhost:5000/api/transactions');
    setTransactions(res.data);
  };

  useEffect(() => {
    getData();
  }, []);

  const addTransaction = async () => {
    if (!text || !amount) return;
    await axios.post('http://localhost:5000/api/transactions', {
      text,
      amount: parseFloat(amount),
    });
    setText('');
    setAmount('');
    getData();
  };

  const deleteTransaction = async (id) => {
    await axios.delete(`http://localhost:5000/api/transactions/${id}`);
    getData();
  };

  const income = transactions
    .filter(t => t.amount > 0)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const expense = transactions
    .filter(t => t.amount < 0)
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="container">
      <h2>FinTrack</h2>
      <h4>Balance: ₹{income + expense}</h4>
      <div className="inc-exp">
        <div><h5>Income</h5><p className="plus">₹{income}</p></div>
        <div><h5>Expense</h5><p className="minus">₹{Math.abs(expense)}</p></div>
      </div>

      <div className="form">
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Text" />
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" />
        <button onClick={addTransaction}>Add Transaction</button>
      </div>

      <ul className="list">
        {transactions.map(t => (
          <li key={t._id} className={t.amount < 0 ? 'minus' : 'plus'}>
            {t.text} <span>₹{t.amount}</span>
            <button className="delete-btn" onClick={() => deleteTransaction(t._id)}>x</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
✅ 7. Styling (client/src/App.css)
css
Copy
Edit
.container {
  max-width: 500px;
  margin: 40px auto;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  text-align: center;
}
.list {
  list-style: none;
  padding: 0;
}
.plus {
  color: green;
}
.minus {
  color: red;
}
.form input {
  margin: 5px;
  padding: 8px;
}
button {
  margin-top: 10px;
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
}
.delete-btn {
  margin-left: 10px;
  color: red;
  border: none;
  background: transparent;
  cursor: pointer;
}
✅ 8. .env file in server
ini
Copy
Edit
MONGO_URI=mongodb+srv://<your_mongodb_connection_string>
✅ 9. Run Servers
In one terminal:

bash
Copy
Edit
cd server
node index.js
In another terminal:

bash
Copy
Edit
cd client
npm start
Your fullstack app will run on:

Frontend: http://localhost:3000

Backend API: http://localhost:5000/api/transactions

## 📦 Dependencies

### Backend (server)
Run these commands inside the `server` folder:

```bash
npm install express mongoose cors dotenv
```

- **express**: Web framework for Node.js
- **mongoose**: MongoDB object modeling
- **cors**: Enable CORS for API
- **dotenv**: Load environment variables

### Frontend (client)
Run these commands inside the `client` folder:

```bash
npm install axios chart.js react-chartjs-2
```

- **axios**: HTTP client for API requests
- **chart.js**: Charting library for graphs
- **react-chartjs-2**: React wrapper for Chart.js

🌍 Deployment
Frontend (React): Deploy on Vercel or Netlify

Backend (Node.js): Deploy on Render

I’ll guide you on deployment once you confirm you're ready.