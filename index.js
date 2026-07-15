const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for testing from browsers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ============================================================
// HARDCODED DATA
// ============================================================
const products = [
  { id: 1, name: 'Laptop', category: 'electronics', price: 999.99, inStock: true },
  { id: 2, name: 'Mouse', category: 'electronics', price: 29.99, inStock: true },
  { id: 3, name: 'Desk Chair', category: 'furniture', price: 249.99, inStock: false },
  { id: 4, name: 'Notebook', category: 'stationery', price: 4.99, inStock: true },
  { id: 5, name: 'Monitor', category: 'electronics', price: 399.99, inStock: true },
];

const users = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'user' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'user' },
];

// ============================================================
// ROOT - API Info
// ============================================================
app.get('/', (req, res) => {
  res.json({
    message: 'API Training Sandbox',
    version: '1.0.0',
    documentation: '/docs',
    endpoints: {
      GET: [
        'GET /api/products',
        'GET /api/products/:id',
        'GET /api/products/search?name=&category=&minPrice=&maxPrice=',
        'GET /api/users',
        'GET /api/users/:id',
        'GET /api/secure/profile (requires x-api-key header)',
        'GET /api/headers/echo',
      ],
      POST: [
        'POST /api/products (JSON body)',
        'POST /api/validate (plain text body)',
        'POST /api/validate-json (JSON body)',
        'POST /api/login (JSON body)',
      ],
      PUT: ['PUT /api/products/:id (JSON body)'],
      PATCH: ['PATCH /api/products/:id (JSON body)'],
      DELETE: ['DELETE /api/products/:id', 'DELETE /api/files/:id'],
      FILES: [
        'POST /api/files/upload (multipart form, field: "file")',
        'POST /api/files/upload-multiple (multipart form, field: "files", max 5)',
        'GET /api/files (list all uploaded files)',
        'GET /api/files/:id (download a file)',
        'DELETE /api/files/:id (delete a file)',
      ],
    },
  });
});


// ============================================================
// GET APIs - Various patterns
// ============================================================

// 1. Simple GET - returns all products
app.get('/api/products', (req, res) => {
  res.json({ count: products.length, data: products });
});

// 2. Query parameters - search/filter (MUST be before :id route)
app.get('/api/products/search', (req, res) => {
  const { name, category, minPrice, maxPrice, inStock } = req.query;
  let results = [...products];

  if (name) results = results.filter(p => p.name.toLowerCase().includes(name.toLowerCase()));
  if (category) results = results.filter(p => p.category === category);
  if (minPrice) results = results.filter(p => p.price >= parseFloat(minPrice));
  if (maxPrice) results = results.filter(p => p.price <= parseFloat(maxPrice));
  if (inStock !== undefined) results = results.filter(p => p.inStock === (inStock === 'true'));

  res.json({
    filters: { name, category, minPrice, maxPrice, inStock },
    count: results.length,
    data: results,
  });
});

// 3. Path parameter - GET by ID
app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found', id });
  }
  res.json(product);
});

// 4. GET all users
app.get('/api/users', (req, res) => {
  res.json({ count: users.length, data: users });
});

// 5. Path parameter - user by ID
app.get('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User not found', id });
  }
  res.json(user);
});

// 6. Header-based authentication - requires x-api-key
app.get('/api/secure/profile', (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== 'my-secret-key-123') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid x-api-key header. Use: my-secret-key-123',
    });
  }
  res.json({
    message: 'Access granted!',
    profile: { id: 1, name: 'Admin User', role: 'admin', permissions: ['read', 'write', 'delete'] },
  });
});

// 7. Echo all headers back (useful for debugging)
app.get('/api/headers/echo', (req, res) => {
  res.json({
    message: 'Your request headers are echoed below',
    headers: req.headers,
  });
});


// ============================================================
// POST APIs - Various patterns
// ============================================================

// 8. POST with JSON body - create a product
app.post('/api/products', (req, res) => {
  const { name, category, price, inStock } = req.body;

  if (!name || !category || price === undefined) {
    return res.status(400).json({
      error: 'Validation failed',
      required: ['name', 'category', 'price'],
      received: req.body,
    });
  }

  const newProduct = {
    id: products.length + 1,
    name,
    category,
    price: parseFloat(price),
    inStock: inStock !== undefined ? inStock : true,
  };

  res.status(201).json({
    message: 'Product created successfully',
    data: newProduct,
  });
});

// 9. POST with plain text body
app.post('/api/validate', (req, res) => {
  const id = req.body;

  if (typeof id !== 'string' || id.trim() === '') {
    return res.status(400).json({ error: 'Invalid input: body must be a non-empty string' });
  }

  res.status(200).json({ message: 'Valid input', id: id.trim() });
});

// 10. POST with JSON body - validate structure
app.post('/api/validate-json', (req, res) => {
  const { id, name, email } = req.body;

  const errors = [];
  if (!id || typeof id !== 'string') errors.push('id must be a non-empty string');
  if (!name || typeof name !== 'string') errors.push('name must be a non-empty string');
  if (email && !email.includes('@')) errors.push('email must be a valid email address');

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors, received: req.body });
  }

  res.status(200).json({ message: 'Validation passed', data: { id, name, email } });
});

// 11. POST login - returns a fake token
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  if (username === 'admin' && password === 'password123') {
    return res.json({
      message: 'Login successful',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake-token-for-testing',
      expiresIn: '1h',
    });
  }

  res.status(401).json({ error: 'Invalid credentials', hint: 'Try admin / password123' });
});

// 12. POST with query params + body combined
app.post('/api/orders', (req, res) => {
  const { userId } = req.query;
  const { productId, quantity } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Query parameter "userId" is required' });
  }
  if (!productId || !quantity) {
    return res.status(400).json({ error: 'Body must contain productId and quantity' });
  }

  res.status(201).json({
    message: 'Order created',
    order: {
      orderId: 'ORD-' + Date.now(),
      userId: parseInt(userId),
      productId: parseInt(productId),
      quantity: parseInt(quantity),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    },
  });
});


// ============================================================
// PUT / PATCH / DELETE APIs
// ============================================================

// 13. PUT - full update (replace entire resource)
app.put('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found', id });
  }

  const { name, category, price, inStock } = req.body;
  if (!name || !category || price === undefined) {
    return res.status(400).json({
      error: 'PUT requires all fields',
      required: ['name', 'category', 'price'],
      received: req.body,
    });
  }

  const updated = { id, name, category, price: parseFloat(price), inStock: !!inStock };
  res.json({ message: 'Product fully updated', data: updated });
});

// 14. PATCH - partial update
app.patch('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found', id });
  }

  const updated = { ...product, ...req.body };
  res.json({ message: 'Product partially updated', original: product, updated });
});

// 15. DELETE
app.delete('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found', id });
  }

  res.json({ message: 'Product deleted', deleted: product });
});

// ============================================================
// SPECIAL ENDPOINTS
// ============================================================

// 16. Pagination example
app.get('/api/paginated', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = products.slice(start, end);

  res.json({
    page,
    limit,
    totalItems: products.length,
    totalPages: Math.ceil(products.length / limit),
    data: paginatedData,
  });
});

// 17. Delay/timeout simulation
app.get('/api/slow', (req, res) => {
  const delay = parseInt(req.query.delay) || 3000;
  const actualDelay = Math.min(delay, 10000); // max 10s
  setTimeout(() => {
    res.json({ message: `Response delayed by ${actualDelay}ms`, timestamp: new Date().toISOString() });
  }, actualDelay);
});

// 18. Status code testing - returns whatever status you ask
app.get('/api/status/:code', (req, res) => {
  const code = parseInt(req.params.code);
  if (code < 100 || code > 599) {
    return res.status(400).json({ error: 'Status code must be between 100-599' });
  }
  res.status(code).json({ statusCode: code, message: `You requested status ${code}` });
});

// ============================================================
// FILE TRANSFER APIs (SFTP-like over HTTP)
// ============================================================
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB max

// 19. Upload a file
app.post('/api/files/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded. Use form field name: "file"' });
  }
  res.status(201).json({
    message: 'File uploaded successfully',
    file: {
      id: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date().toISOString(),
    },
  });
});

// 20. List all uploaded files
app.get('/api/files', (req, res) => {
  const files = fs.readdirSync(uploadDir).map(name => {
    const stats = fs.statSync(path.join(uploadDir, name));
    return { id: name, size: stats.size, uploadedAt: stats.mtime.toISOString() };
  });
  res.json({ count: files.length, files });
});

// 21. Download a file by ID
app.get('/api/files/:id', (req, res) => {
  const filePath = path.join(uploadDir, req.params.id);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found', id: req.params.id });
  }
  res.download(filePath);
});

// 22. Delete a file
app.delete('/api/files/:id', (req, res) => {
  const filePath = path.join(uploadDir, req.params.id);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found', id: req.params.id });
  }
  fs.unlinkSync(filePath);
  res.json({ message: 'File deleted', id: req.params.id });
});

// 23. Upload multiple files
app.post('/api/files/upload-multiple', upload.array('files', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded. Use form field name: "files"' });
  }
  const uploaded = req.files.map(f => ({
    id: f.filename,
    originalName: f.originalname,
    size: f.size,
    mimeType: f.mimetype,
  }));
  res.status(201).json({ message: `${uploaded.length} files uploaded`, files: uploaded });
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`API Training Sandbox running on http://localhost:${PORT}`);
  console.log(`Documentation: http://localhost:${PORT}/docs`);
});
