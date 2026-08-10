import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data_store');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure multer storage for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '';
    cb(null, `${uniqueSuffix}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 300 * 1024 * 1024 }, // 300MB file limit
});

const GALLERY_FILE = path.join(DATA_DIR, 'gallery.json');
const QUOTES_FILE = path.join(DATA_DIR, 'quotes.json');
const TRANSFORMATIONS_FILE = path.join(DATA_DIR, 'transformations.json');
const PROFILES_FILE = path.join(DATA_DIR, 'profiles.json');

const INITIAL_GALLERY = [
  {
    id: 'gal_win_1',
    title: 'WDS 8S Antraciet Ramen Villa',
    category: 'windows',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    location: 'Antwerpen, België',
    year: '2025',
    description: 'Plaatsing van WDS 8S ramen in RAL 7016 Antraciet met driedubbel A+++ glas.',
    tags: ['WDS 8S', 'Antraciet', 'Driedubbel Glas'],
  },
  {
    id: 'gal_int_1',
    title: 'Totaalrenovatie Herenhuis & Keuken',
    category: 'interior',
    imageUrl: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80',
    location: 'Gent, België',
    year: '2025',
    description: 'Volledige interieurrenovatie met kookeiland, visgraat parket en strak stucwerk.',
    tags: ['Interieurrenovatie', 'Keuken', 'Visgraat Vloer'],
  },
  {
    id: 'gal_hsb_1',
    title: 'Prefab HSB-Aanbouw Woning met WDS Kozijnen',
    category: 'hsb',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    location: 'Breda, Nederland',
    year: '2025',
    description: 'Duurzame houtskeletbouw uitbreiding inclusief geïntegreerde WDS kozijnen.',
    tags: ['HSB-panelen', 'Aanbouw', 'Passiefhuis'],
  },
  {
    id: 'gal_win_2',
    title: 'WDS 7S Panoramische Glasgevel',
    category: 'windows',
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    location: 'Brussel, België',
    year: '2024',
    description: 'Strakke zwarte WDS 7S gevelramen voor maximale lichtinval.',
    tags: ['WDS 7S', 'Zwart Mat', 'Panoramaglas'],
  },
  {
    id: 'gal_int_2',
    title: 'Luxe Badkamer Renovatie Inloopdouche',
    category: 'interior',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    location: 'Hasselt, België',
    year: '2025',
    description: 'Moderne badkamer met grootformaat tegels en maatwerk eiken wastafelmeubel.',
    tags: ['Badkamer', 'Inloopdouche', 'Tegelwerk'],
  },
  {
    id: 'gal_hsb_2',
    title: 'HSB Dakelementen & Gevelbekleding',
    category: 'hsb',
    imageUrl: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80',
    location: 'Eindhoven, Nederland',
    year: '2024',
    description: 'Geprefabriceerde geïsoleerde dakelementen en verticale gevelafwerking.',
    tags: ['HSB', 'Dakelementen', 'Gevelbekleding'],
  },
  {
    id: 'gal_win_3',
    title: 'WDS 6S Light & Energy Renovatie',
    category: 'windows',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    location: 'Brugge, België',
    year: '2024',
    description: 'Veel lichtinval en uitstekende isolatietechniek met WDS 6S slanke profielen.',
    tags: ['WDS 6S', 'Lichtinval', 'Klassiek'],
  },
  {
    id: 'gal_int_3',
    title: 'Woonkamer & Maatwerk Timmerwerk Interieur',
    category: 'interior',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    location: 'Leuven, België',
    year: '2025',
    description: 'Maatwerk wandkasten, sfeerverlichting en akoestische houten lattenwand.',
    tags: ['Interieur', 'Timmerwerk', 'Wandpanelen'],
  },
];

const INITIAL_TRANSFORMATIONS = [
  {
    id: 'trans_1',
    title: 'Vervanging Oude Kozijnen door WDS 8S Antraciet',
    category: 'windows',
    beforeImageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=85',
    afterImageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    beforeLabel: 'Oude Houten Kozijnen',
    afterLabel: 'WDS 8S Triple Glas',
    description: 'Tochtige houten ramen vervangen door hoogisolerende WDS 8S profielen met driedubbele beglazing.',
    location: 'Antwerpen, België',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'trans_2',
    title: 'Luxe Interieur & Keuken Transformatie',
    category: 'interior',
    beforeImageUrl: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1600&q=85',
    afterImageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1600&q=85',
    beforeLabel: 'Gedateerde Ruimte',
    afterLabel: 'Luxe Maatwerk Keuken',
    description: 'Totaalrenovatie met eilandkeuken, strakke leidingen en inbouw verlichting.',
    location: 'Gent, België',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'trans_3',
    title: 'HSB Gevelrenovatie met WDS 7S Ramen',
    category: 'hsb',
    beforeImageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85',
    afterImageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85',
    beforeLabel: 'Oude Gevel',
    afterLabel: 'HSB Panelen + WDS 7S',
    description: 'Ecologische HSB-panelen met geïntegreerde WDS 7S PVC ramen.',
    location: 'Rotterdam, Nederland',
    createdAt: new Date().toISOString(),
  },
];

// Helper to read JSON
function readJsonFile(filePath: string, fallback: any) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed) return parsed;
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

// Helper to write JSON
function writeJsonFile(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// API Routes

// POST /api/upload - Handle file uploads (images & videos)
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, filename: req.file.filename });
});

// GET /api/gallery
app.get('/api/gallery', (req, res) => {
  let gallery = readJsonFile(GALLERY_FILE, null);
  if (gallery === null || !Array.isArray(gallery)) {
    gallery = INITIAL_GALLERY;
    writeJsonFile(GALLERY_FILE, gallery);
  }
  res.json(gallery);
});

// POST /api/gallery
app.post('/api/gallery', (req, res) => {
  const { title, category, imageUrl, additionalImages, videoUrl, location, year, description, tags } = req.body;
  if (!title || !imageUrl || !category) {
    return res.status(400).json({ error: 'Title, category, and imageUrl are required' });
  }

  let gallery = readJsonFile(GALLERY_FILE, null);
  if (!gallery || !Array.isArray(gallery)) {
    gallery = [];
  }

  const newItem = {
    id: 'gal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    title,
    category,
    imageUrl,
    additionalImages: Array.isArray(additionalImages) ? additionalImages : [],
    videoUrl: videoUrl || '',
    location: location || 'Benelux',
    year: year || new Date().getFullYear().toString(),
    description: description || '',
    tags: tags || [],
    createdAt: new Date().toISOString(),
  };

  gallery.unshift(newItem);
  writeJsonFile(GALLERY_FILE, gallery);
  res.status(201).json(newItem);
});

// GET /api/profiles - Returns profile image overrides
app.get('/api/profiles', (req, res) => {
  const overrides = readJsonFile(PROFILES_FILE, {});
  res.json(overrides);
});

// POST /api/profiles - Save profile image overrides
app.post('/api/profiles', (req, res) => {
  const { profileId, imageUrl } = req.body;
  if (!profileId || !imageUrl) {
    return res.status(400).json({ error: 'profileId and imageUrl are required' });
  }

  const overrides = readJsonFile(PROFILES_FILE, {});
  overrides[profileId] = imageUrl;
  writeJsonFile(PROFILES_FILE, overrides);
  res.json({ success: true, overrides });
});

// DELETE /api/gallery/:id
app.delete('/api/gallery/:id', (req, res) => {
  const { id } = req.params;
  let gallery = readJsonFile(GALLERY_FILE, []);
  gallery = gallery.filter((item: any) => item.id !== id);
  writeJsonFile(GALLERY_FILE, gallery);
  res.json({ success: true, id });
});

// PUT /api/gallery/:id - Update existing gallery project
app.put('/api/gallery/:id', (req, res) => {
  const { id } = req.params;
  const { title, category, imageUrl, additionalImages, videoUrl, location, description } = req.body;

  let gallery = readJsonFile(GALLERY_FILE, []);
  const index = gallery.findIndex((item: any) => item.id === id);

  if (index !== -1) {
    gallery[index] = {
      ...gallery[index],
      title: title || gallery[index].title,
      category: category || gallery[index].category,
      imageUrl: imageUrl || gallery[index].imageUrl,
      additionalImages: Array.isArray(additionalImages) ? additionalImages : gallery[index].additionalImages || [],
      videoUrl: videoUrl !== undefined ? videoUrl : gallery[index].videoUrl || '',
      location: location !== undefined ? location : gallery[index].location || '',
      description: description !== undefined ? description : gallery[index].description || '',
    };
    writeJsonFile(GALLERY_FILE, gallery);
    res.json(gallery[index]);
  } else {
    res.status(404).json({ error: 'Gallery item not found' });
  }
});

// GET /api/quotes
app.get('/api/quotes', (req, res) => {
  const quotes = readJsonFile(QUOTES_FILE, []);
  res.json(quotes);
});

// POST /api/quotes
app.post('/api/quotes', (req, res) => {
  const { clientName, email, phone, city, serviceCategory, details, preferredDate } = req.body;
  if (!clientName || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }

  const quotes = readJsonFile(QUOTES_FILE, []);
  const newQuote = {
    id: 'quote_' + Date.now(),
    clientName,
    email: email || '',
    phone,
    city: city || '',
    serviceCategory: serviceCategory || 'combined',
    details: details || {},
    preferredDate: preferredDate || '',
    status: 'new',
    createdAt: new Date().toISOString(),
  };

  quotes.unshift(newQuote);
  writeJsonFile(QUOTES_FILE, quotes);
  res.status(201).json(newQuote);
});

// PATCH /api/quotes/:id
app.patch('/api/quotes/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const quotes = readJsonFile(QUOTES_FILE, []);
  const quote = quotes.find((q: any) => q.id === id);
  if (quote) {
    if (status) quote.status = status;
    writeJsonFile(QUOTES_FILE, quotes);
    res.json(quote);
  } else {
    res.status(404).json({ error: 'Quote not found' });
  }
});

// GET /api/transformations
app.get('/api/transformations', (req, res) => {
  let transformations = readJsonFile(TRANSFORMATIONS_FILE, null);
  if (transformations === null || !Array.isArray(transformations)) {
    transformations = INITIAL_TRANSFORMATIONS;
    writeJsonFile(TRANSFORMATIONS_FILE, transformations);
  }
  res.json(transformations);
});

// POST /api/transformations
app.post('/api/transformations', (req, res) => {
  const { title, category, beforeImageUrl, afterImageUrl, beforeLabel, afterLabel, description, location } = req.body;
  if (!title || !beforeImageUrl || !afterImageUrl) {
    return res.status(400).json({ error: 'Title, beforeImageUrl, and afterImageUrl are required' });
  }

  let transformations = readJsonFile(TRANSFORMATIONS_FILE, []);
  if (!Array.isArray(transformations)) {
    transformations = [];
  }

  const newItem = {
    id: 'trans_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    title,
    category: category || 'windows',
    beforeImageUrl,
    afterImageUrl,
    beforeLabel: beforeLabel || 'Vooraf',
    afterLabel: afterLabel || 'Na Renovatie',
    description: description || '',
    location: location || 'Benelux',
    createdAt: new Date().toISOString(),
  };

  transformations.unshift(newItem);
  writeJsonFile(TRANSFORMATIONS_FILE, transformations);
  res.status(201).json(newItem);
});

// DELETE /api/transformations/:id
app.delete('/api/transformations/:id', (req, res) => {
  const { id } = req.params;
  let transformations = readJsonFile(TRANSFORMATIONS_FILE, []);
  if (!Array.isArray(transformations)) transformations = [];
  transformations = transformations.filter((item: any) => item.id !== id);
  writeJsonFile(TRANSFORMATIONS_FILE, transformations);
  res.json({ success: true, id });
});

// Vite Middleware Integration
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VicRenovation server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
