const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3002;

app.use(express.json());
app.use(express.static(__dirname));

// Get all bills, sorted by due date
app.get('/api/bills', (req, res) => {
    const bills = db.prepare('SELECT * FROM bills ORDER BY due_date').all();
    res.json(bills);
});

// Add a new bill
app.post('/api/bills', (req, res) => {
    const { name, amount, due_date, category, recurrence } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Bill name is required.' });
    }

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'A valid amount is required.' });
    }

    if (!due_date) {
        return res.status(400).json({ error: 'Due date is required.' });
    }

    if (!category) {
        return res.status(400).json({ error: 'Category is required.' });
    }

    if (!recurrence) {
        return res.status(400).json({ error: 'Recurrence is required.' });
    }

    const insert = db.prepare(
        'INSERT INTO bills (name, amount, due_date, category, recurrence) VALUES (?, ?, ?, ?, ?)'
    );
    const result = insert.run(name.trim(), amount, due_date, category, recurrence);

    res.status(201).json({
        id: result.lastInsertRowid,
        name: name.trim(),
        amount: amount,
        due_date: due_date,
        category: category,
        recurrence: recurrence,
        paid: 0
    });
});

// Update an existing bill
app.put('/api/bills/:id', (req, res) => {
    const id = req.params.id;
    const { name, amount, due_date, category, recurrence } = req.body;

    const bill = db.prepare('SELECT * FROM bills WHERE id = ?').get(id);
    if (!bill) {
        return res.status(404).json({ error: 'Bill not found.' });
    }

    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Bill name is required.' });
    }

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'A valid amount is required.' });
    }

    if (!due_date) {
        return res.status(400).json({ error: 'Due date is required.' });
    }

    if (!category) {
        return res.status(400).json({ error: 'Category is required.' });
    }

    if (!recurrence) {
        return res.status(400).json({ error: 'Recurrence is required.' });
    }

    db.prepare(
        'UPDATE bills SET name = ?, amount = ?, due_date = ?, category = ?, recurrence = ? WHERE id = ?'
    ).run(name.trim(), amount, due_date, category, recurrence, id);

    res.json({
        id: bill.id,
        name: name.trim(),
        amount: amount,
        due_date: due_date,
        category: category,
        recurrence: recurrence,
        paid: bill.paid
    });
});

// Toggle a bill's paid/unpaid state
app.patch('/api/bills/:id/toggle-paid', (req, res) => {
    const id = req.params.id;

    const bill = db.prepare('SELECT * FROM bills WHERE id = ?').get(id);
    if (!bill) {
        return res.status(404).json({ error: 'Bill not found.' });
    }

    const newPaid = bill.paid ? 0 : 1;
    db.prepare('UPDATE bills SET paid = ? WHERE id = ?').run(newPaid, id);

    res.json({ id: bill.id, paid: newPaid });
});

// Delete a bill
app.delete('/api/bills/:id', (req, res) => {
    const id = req.params.id;
    db.prepare('DELETE FROM bills WHERE id = ?').run(id);
    res.json({ message: 'Bill deleted.' });
});

app.listen(PORT, () => {
    console.log('Server running on http://localhost:' + PORT);
});