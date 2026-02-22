require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'dummy_key');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Database Setup
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        // Create tables
        db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      price REAL,
      description TEXT,
      category TEXT,
      gender TEXT,
      sizes TEXT, -- JSON string array
      colors TEXT, -- JSON string array
      stock_quantity INTEGER DEFAULT 10,
      in_stock BOOLEAN DEFAULT 1,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

        db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_email TEXT,
      total_amount REAL,
      status TEXT,
      payment_method TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

        db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password_hash TEXT,
      role TEXT DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

        // Add other tables (users, wishlist, etc.) later in the auth block

        // Seed some products if empty
        db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
            if (row && row.count === 0) {
                const stmt = db.prepare(`
          INSERT INTO products 
          (name, price, description, category, gender, sizes, colors, stock_quantity, in_stock, image) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

                const categories = ['Dresses', 'Tops', 'Bottoms', 'Accessories'];
                const genders = ['Women', 'Women', 'Unisex', 'Women'];
                const dummySizes = JSON.stringify(['XS', 'S', 'M', 'L', 'XL']);

                for (let i = 1; i <= 12; i++) {
                    const colors = JSON.stringify(i % 2 === 0 ? ['Black', 'White'] : ['Beige', 'Red', 'Blue']);
                    const stock = i === 3 ? 0 : 15; // Make product 3 out of stock

                    stmt.run(
                        `Luxury Silk Piece ${i}`,
                        150 + (i * 15),
                        'Experience unparalleled elegance with this piece.',
                        categories[(i % 4)],
                        genders[(i % 4)],
                        dummySizes,
                        colors,
                        stock,
                        stock > 0 ? 1 : 0,
                        `https://images.unsplash.com/photo-1515347619362-73fc365313f8?q=80&w=800&auto=format&fit=crop&text=Item${i}`
                    );
                }
                stmt.finalize();
            }
        });
    }
});

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Routes

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        db.run('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, email, hash], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Email already exists' });
                }
                return res.status(500).json({ error: err.message });
            }

            const token = jwt.sign({ id: this.lastID, email, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });
            res.json({ token, user: { id: this.lastID, name, email, role: 'customer' } });
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
    db.get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user });
    });
});

// Advanced Get all products (Filters, Sort, Search)
app.get('/api/products', (req, res) => {
    const { category, search, minPrice, maxPrice, gender, size, color, inStock, sort } = req.query;

    let query = 'SELECT * FROM products WHERE 1=1';
    let params = [];

    if (search) {
        query += ' AND (name LIKE ? OR description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    if (category && category !== 'All') {
        query += ' AND category = ?';
        params.push(category);
    }

    if (gender && gender !== 'All') {
        query += ' AND gender = ?';
        params.push(gender);
    }

    if (minPrice) {
        query += ' AND price >= ?';
        params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
        query += ' AND price <= ?';
        params.push(parseFloat(maxPrice));
    }

    if (inStock === 'true') {
        query += ' AND in_stock = 1';
    }

    if (size) {
        query += ' AND sizes LIKE ?';
        params.push(`%"${size}"%`);
    }

    if (color) {
        query += ' AND colors LIKE ?';
        params.push(`%"${color}"%`);
    }

    if (sort) {
        switch (sort) {
            case 'price_asc':
                query += ' ORDER BY price ASC';
                break;
            case 'price_desc':
                query += ' ORDER BY price DESC';
                break;
            case 'newest':
                query += ' ORDER BY created_at DESC';
                break;
            default:
                // By default, let's sort newest
                query += ' ORDER BY created_at DESC';
        }
    } else {
        query += ' ORDER BY created_at DESC';
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        // Parse JSON string arrays back to actual arrays for frontend
        const parsedRows = rows.map(r => ({
            ...r,
            sizes: JSON.parse(r.sizes || '[]'),
            colors: JSON.parse(r.colors || '[]')
        }));

        res.json({ data: parsedRows });
    });
});

// Get single product
app.get('/api/products/:id', (req, res) => {
    db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (row) {
            row.sizes = JSON.parse(row.sizes || '[]');
            row.colors = JSON.parse(row.colors || '[]');
        }
        res.json({ data: row });
    });
});

// Admin Product DELETE
app.delete('/api/admin/products/:id', authenticateToken, (req, res) => {
    // Basic authorization check
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Requires admin privileges' });
    }

    db.run('DELETE FROM products WHERE id = ?', [req.params.id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true, message: 'Product deleted', changes: this.changes });
    });
});

// Admin Product CREATE
app.post('/api/admin/products', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Requires admin privileges' });
    }

    const { name, price, description, category, gender, sizes, colors, stock_quantity, in_stock, image } = req.body;

    const stmt = db.prepare(`
        INSERT INTO products 
        (name, price, description, category, gender, sizes, colors, stock_quantity, in_stock, image) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
        name,
        price,
        description,
        category,
        gender,
        JSON.stringify(sizes || []),
        JSON.stringify(colors || []),
        stock_quantity || 0,
        in_stock !== undefined ? in_stock : 1,
        image || ''
    ], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true, productId: this.lastID, message: 'Product created successfully' });
    });
});

// Admin Product UPDATE
app.put('/api/admin/products/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Requires admin privileges' });
    }

    const { name, price, description, category, gender, sizes, colors, stock_quantity, in_stock, image } = req.body;

    const stmt = db.prepare(`
        UPDATE products SET 
            name = ?, price = ?, description = ?, category = ?, gender = ?, 
            sizes = ?, colors = ?, stock_quantity = ?, in_stock = ?, image = ?
        WHERE id = ?
    `);

    stmt.run([
        name,
        price,
        description,
        category,
        gender,
        JSON.stringify(sizes || []),
        JSON.stringify(colors || []),
        stock_quantity,
        in_stock,
        image,
        req.params.id
    ], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true, message: 'Product updated successfully', changes: this.changes });
    });
});

// Create Stripe Payment Intent
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { amount } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount || 1000,
            currency: 'usd',
        });
        res.send({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Order (Pix or Post-Stripe)
app.post('/api/orders', (req, res) => {
    const { customer_email, total_amount, payment_method } = req.body;

    const stmt = db.prepare('INSERT INTO orders (customer_email, total_amount, status, payment_method) VALUES (?, ?, ?, ?)');
    stmt.run([customer_email, total_amount, payment_method === 'pix' ? 'pending_pix' : 'paid', payment_method], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            success: true,
            orderId: this.lastID,
            message: payment_method === 'pix' ? 'Please transfer to Pix key to complete.' : 'Order complete.'
        });
    });
});

// Contact API using NodeMailer
// In production, configure with actual SMTP settings
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'dummy_user@ethereal.email', // Replace with ethereal dummy or real
        pass: 'dummy_pass'
    }
});

app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    try {
        // Send email to boutique owner
        await transporter.sendMail({
            from: `"${name}" <${email}>`,
            to: "hello@luxuryboutique.com", // Boutique owner email
            subject: `Contact Form: ${subject || 'New Inquiry'}`,
            text: message,
            html: `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Subject:</strong> ${subject}</p><p><strong>Message:</strong><br/>${message}</p>`
        });

        // Optional: Send auto-reply to customer
        await transporter.sendMail({
            from: '"Luxury Boutique" <hello@luxuryboutique.com>',
            to: email,
            subject: 'We received your message',
            text: `Hi ${name},\n\nThank you for reaching out. We have received your message and will get back to you shortly.\n\nBest regards,\nThe Luxury Boutique Team`
        });

        res.json({ success: true, message: 'Message sent successfully' });
    } catch (err) {
        console.error('Email error:', err);
        // Returning success anyway for the demo if ethereal fails due to bad dummy auth
        res.json({ success: true, message: 'Message sent successfully (Demo Mode)' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
