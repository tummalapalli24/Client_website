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
