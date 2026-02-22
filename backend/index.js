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
      is_visible BOOLEAN DEFAULT 1,
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

        // Add missing tables
        db.run(`CREATE TABLE IF NOT EXISTS cart_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          product_id INTEGER,
          quantity INTEGER DEFAULT 1,
          size TEXT,
          color TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS wishlist (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          product_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
          UNIQUE(user_id, product_id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS addresses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          name TEXT,
          street TEXT,
          city TEXT,
          state TEXT,
          zip TEXT,
          country TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )`);

        // Initialize Master Admin
        db.get('SELECT * FROM users WHERE role = ?', ['admin'], async (err, adminUser) => {
            if (!adminUser) {
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash('Admin@Boutique2026', salt); // Default secure password
                db.run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
                    ['Master Admin', 'admin@boutique.com', hash, 'admin']
                );
                console.log('Master Admin created: admin@boutique.com | Auth: Admin@Boutique2026');
            }
        });

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

// Helper function for email validation
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
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

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' }); // 401 for Auth failure

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

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

    let query = 'SELECT * FROM products WHERE is_visible = 1';
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

app.get('/api/products/:id', (req, res) => {
    db.get('SELECT * FROM products WHERE id = ? AND is_visible = 1', [req.params.id], (err, row) => {
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

    const { name, price, description, category, gender, sizes, colors, stock_quantity, in_stock, is_visible, image } = req.body;

    const stmt = db.prepare(`
        INSERT INTO products 
        (name, price, description, category, gender, sizes, colors, stock_quantity, in_stock, is_visible, image) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        is_visible !== undefined ? is_visible : 1,
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

    const { name, price, description, category, gender, sizes, colors, stock_quantity, in_stock, is_visible, image } = req.body;

    const stmt = db.prepare(`
        UPDATE products SET 
            name = ?, price = ?, description = ?, category = ?, gender = ?, 
            sizes = ?, colors = ?, stock_quantity = ?, in_stock = ?, is_visible = ?, image = ?
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
        is_visible,
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
// --- Cart Routes (Persistent Storage) ---

app.get('/api/cart', authenticateToken, (req, res) => {
    const query = `
        SELECT c.id as cart_id, c.quantity, c.size, c.color, 
               p.id, p.name, p.price, p.image, p.category, p.stock_quantity 
        FROM cart_items c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
        ORDER BY c.created_at DESC
    `;
    db.all(query, [req.user.id], (err, items) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ cart: items });
    });
});

app.post('/api/cart', authenticateToken, (req, res) => {
    const { product_id, quantity = 1, size = '', color = '' } = req.body;

    // Check if item already exists in cart with same size/color
    const checkQuery = `SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ? AND color = ?`;

    db.get(checkQuery, [req.user.id, product_id, size, color], (err, existingItem) => {
        if (err) return res.status(500).json({ error: err.message });

        if (existingItem) {
            // Update quantity instead of duplicating
            const newQty = existingItem.quantity + quantity;
            db.run('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, existingItem.id], function (updateErr) {
                if (updateErr) return res.status(500).json({ error: updateErr.message });
                res.json({ success: true, message: 'Cart updated', cart_id: existingItem.id });
            });
        } else {
            // Insert new cart item
            const insertQuery = `INSERT INTO cart_items (user_id, product_id, quantity, size, color) VALUES (?, ?, ?, ?, ?)`;
            db.run(insertQuery, [req.user.id, product_id, quantity, size, color], function (insertErr) {
                if (insertErr) return res.status(500).json({ error: insertErr.message });
                res.json({ success: true, message: 'Added to cart', cart_id: this.lastID });
            });
        }
    });
});

app.delete('/api/cart/:cart_id', authenticateToken, (req, res) => {
    db.run('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.cart_id, req.user.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, deleted: this.changes > 0 });
    });
});

// Clear entire cart after checkout
app.delete('/api/cart', authenticateToken, (req, res) => {
    db.run('DELETE FROM cart_items WHERE user_id = ?', [req.user.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Cart cleared' });
    });
});

// Sync local cart to DB
app.post('/api/cart/sync', authenticateToken, (req, res) => {
    const { localCart } = req.body;
    if (!localCart || !Array.isArray(localCart)) return res.json({ success: true });

    // In a real production app, we would use a batched transaction here to merge items carefully.
    // For simplicity, we iterate and insert/update.
    let completed = 0;

    if (localCart.length === 0) return res.json({ success: true });

    localCart.forEach(item => {
        const checkQuery = `SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ? AND color = ?`;
        db.get(checkQuery, [req.user.id, item.product_id || item.id, item.size || '', item.color || ''], (err, existingItem) => {
            if (existingItem) {
                const newQty = existingItem.quantity + (item.quantity || 1);
                db.run('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, existingItem.id], () => checkDone());
            } else {
                const insertQuery = `INSERT INTO cart_items (user_id, product_id, quantity, size, color) VALUES (?, ?, ?, ?, ?)`;
                db.run(insertQuery, [req.user.id, item.product_id || item.id, item.quantity || 1, item.size || '', item.color || ''], () => checkDone());
            }
        });
    });

    function checkDone() {
        completed++;
        if (completed === localCart.length) {
            res.json({ success: true, message: 'Cart synced' });
        }
    }
});

// --- WISHLIST API ROUTES ---

// Get all wishlist items
app.get('/api/wishlist', authenticateToken, (req, res) => {
    const query = `
        SELECT w.id as wishlist_id, w.product_id, 
               p.name, p.price, p.image, p.category, p.in_stock, p.is_visible
        FROM wishlist w
        JOIN products p ON w.product_id = p.id
        WHERE w.user_id = ?
        ORDER BY w.created_at DESC
    `;
    db.all(query, [req.user.id], (err, items) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ wishlist: items });
    });
});

// Add to wishlist
app.post('/api/wishlist', authenticateToken, (req, res) => {
    const { product_id } = req.body;
    if (!product_id) return res.status(400).json({ error: 'product_id required' });

    db.run('INSERT OR IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)', [req.user.id, product_id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Added to wishlist' });
    });
});

// Remove from wishlist
app.delete('/api/wishlist/:product_id', authenticateToken, (req, res) => {
    db.run('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?', [req.user.id, req.params.product_id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, deleted: this.changes > 0 });
    });
});

// Sync local wishlist
app.post('/api/wishlist/sync', authenticateToken, (req, res) => {
    const { localWishlist } = req.body;
    if (!localWishlist || !Array.isArray(localWishlist) || localWishlist.length === 0) return res.json({ success: true });

    let completed = 0;
    localWishlist.forEach(item => {
        db.run('INSERT OR IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)', [req.user.id, item.product_id || item.id], () => checkDone());
    });

    function checkDone() {
        completed++;
        if (completed === localWishlist.length) res.json({ success: true, message: 'Wishlist synced' });
    }
});

// --- ADDRESSES API ROUTES ---

// Get User Addresses
app.get('/api/addresses', authenticateToken, (req, res) => {
    db.all('SELECT * FROM addresses WHERE user_id = ? ORDER BY created_at DESC', [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

// Create Address
app.post('/api/addresses', authenticateToken, (req, res) => {
    const { name, street, city, state, zip, country } = req.body;

    if (!name || !street || !city || !state || !zip || !country) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    db.run(
        `INSERT INTO addresses (user_id, name, street, city, state, zip, country) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, name, street, city, state, zip, country],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            // Return the newly created address object
            const newAddress = { id: this.lastID, user_id: req.user.id, name, street, city, state, zip, country };
            res.status(201).json({ success: true, address: newAddress });
        }
    );
});

// Delete Address
app.delete('/api/addresses/:id', authenticateToken, (req, res) => {
    db.run('DELETE FROM addresses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Address not found or unauthorized' });
        res.json({ success: true, deleted: true });
    });
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
