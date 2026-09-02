const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const XLSX = require('xlsx');
const Participant = require('./models/Participant');
const Material    = require('./models/Material');

const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../dist')));

// Multer setup (memory storage for Excel parsing)
const upload = multer({ storage: multer.memoryStorage() });

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vector_event';
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// ─── Helper: generate Participant ID ────────────────────────────────────────
// Format: V26G<groupNum><sequentialNum padded to 3 digits>
// e.g. V26G1001, V26G4002
async function generateParticipantId(groupNum) {
  const prefix = `V26G${groupNum}`;
  // Find all existing IDs for this group and get the highest sequential number
  const existing = await Participant.find({
    participantId: { $regex: `^${prefix}` }
  }).select('participantId');

  let maxNum = 0;
  existing.forEach(p => {
    const numStr = p.participantId.replace(prefix, '');
    const num = parseInt(numStr, 10);
    if (!isNaN(num) && num > maxNum) maxNum = num;
  });

  const nextNum = String(maxNum + 1).padStart(3, '0');
  return `${prefix}${nextNum}`;
}

// ─── Helper: parse group number from group string ────────────────────────────
function parseGroupNum(groupStr) {
  if (!groupStr) return 1;
  const match = String(groupStr).match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
}

// ─── API Routes ──────────────────────────────────────────────────────────────

// GET all participants
app.get('/api/participants', async (req, res) => {
  try {
    const participants = await Participant.find().sort({ participantId: 1 });
    res.json(participants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
});

// GET participant by participantId (for QR scan lookup)
app.get('/api/participants/by-pid/:participantId', async (req, res) => {
  try {
    const participant = await Participant.findOne({ participantId: req.params.participantId });
    if (!participant) return res.status(404).json({ error: 'Participant not found' });
    res.json(participant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch participant' });
  }
});

// GET dashboard stats
app.get('/api/participants/stats', async (req, res) => {
  try {
    const all = await Participant.find();
    const total = all.length;

    const countIf = (field) => all.filter(p => p[field]).length;

    const groupStats = ['Group 1', 'Group 2', 'Group 3', 'Group 4'].map(g => {
      const group = all.filter(p => p.group === g);
      return {
        group: g,
        total: group.length,
        morningAttendance: group.filter(p => p.morningAttendance).length,
        afternoonAttendance: group.filter(p => p.afternoonAttendance).length,
        morningRefreshments: group.filter(p => p.morningRefreshments).length,
        eveningRefreshments: group.filter(p => p.eveningRefreshments).length,
        lunch: group.filter(p => p.lunch).length,
        kitReceived: group.filter(p => p.kitReceived).length,
      };
    });

    res.json({
      total,
      morningAttendance: countIf('morningAttendance'),
      afternoonAttendance: countIf('afternoonAttendance'),
      morningRefreshments: countIf('morningRefreshments'),
      eveningRefreshments: countIf('eveningRefreshments'),
      lunch: countIf('lunch'),
      kitReceived: countIf('kitReceived'),
      groupStats,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// POST upload Excel
app.post('/api/participants/upload-excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    let added = 0;
    let skipped = 0;
    const errors = [];

    for (const row of rows) {
      const getVal = (keywords) => {
        const keys = Object.keys(row);
        
        // 1. Exact match (ignoring spaces/special chars)
        for (const kw of keywords) {
          const target = kw.toLowerCase().replace(/[^a-z0-9]/g, '');
          const match = keys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === target);
          if (match) return row[match];
        }
        
        // 2. Exact word match
        for (const kw of keywords) {
          const cleanKwSpace = kw.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
          if (!cleanKwSpace) continue;
          const match = keys.find(k => {
            const cleanKeySpace = k.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
            return ` ${cleanKeySpace} `.includes(` ${cleanKwSpace} `);
          });
          if (match) return row[match];
        }
        
        // 3. Partial substring match
        for (const kw of keywords) {
          const target = kw.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (!target) continue;
          const match = keys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '').includes(target));
          if (match) return row[match];
        }
        
        return '';
      };

      const name = (getVal(['name', 'participant']) ?? '').toString().trim();
      const clubName = (getVal(['club', 'institution', 'college', 'school', 'organization']) ?? '').toString().trim();
      const groupRaw = (getVal(['group', 'team']) ?? '').toString().trim();
      const portfolio = (getVal(['portfolio', 'designation', 'role', 'position']) ?? '').toString().trim();
      const riIdRaw = getVal(['riid', 'ri id', 'ri-id', 'sno', 's.no', 'sl no', 'serial', 'id']);
      const riId = parseInt(riIdRaw, 10) || undefined;

      if (!name) continue;

      // Skip if already exists
      const existing = await Participant.findOne({ name });
      if (existing) {
        skipped++;
        continue;
      }

      // Normalise group string
      const groupNum = parseGroupNum(groupRaw);
      const groupLabel = `Group ${groupNum}`;

      // Generate unique participant ID
      const participantId = await generateParticipantId(groupNum);

      try {
        await Participant.create({
          riId,
          name,
          clubName,
          group: groupLabel,
          portfolio,
          participantId,
          email: `${participantId}@vector2026.com`,
          role: 'student',
          institution: clubName,
        });
        added++;
      } catch (e) {
        errors.push(`${name}: ${e.message}`);
      }
    }

    res.json({ added, skipped, errors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process Excel file' });
  }
});

// POST create participant manually
app.post('/api/participants', async (req, res) => {
  try {
    const { riId, name, clubName, group, portfolio } = req.body;
    
    // Parse group number to generate proper ID
    const groupNum = parseGroupNum(group);
    const groupLabel = `Group ${groupNum}`;
    const participantId = await generateParticipantId(groupNum);

    const participant = new Participant({
      riId: riId || undefined,
      name,
      clubName,
      group: groupLabel,
      portfolio,
      participantId,
      email: `${participantId}@vector2026.com`,
      role: 'student',
      institution: clubName,
    });
    
    await participant.save();
    res.status(201).json(participant);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Participant already exists or ID conflict' });
    } else {
      res.status(400).json({ error: 'Invalid data' });
    }
  }
});

// DELETE participant by mongo _id
app.delete('/api/participants/:id', async (req, res) => {
  try {
    const deleted = await Participant.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Participant not found' });
    res.json({ message: 'Deleted successfully', participant: deleted });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete participant' });
  }
});

// PUT update check-in fields
app.put('/api/participants/:id/checkin', async (req, res) => {
  try {
    const allowed = ['morningAttendance', 'afternoonAttendance', 'morningRefreshments',
      'eveningRefreshments', 'lunch', 'kitReceived', 'attended'];
    const update = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    });

    const participant = await Participant.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );
    if (!participant) return res.status(404).json({ error: 'Participant not found' });
    res.json(participant);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update check-in' });
  }
});

// PUT legacy attendance toggle
app.put('/api/participants/:id/attendance', async (req, res) => {
  try {
    const { attended } = req.body;
    const participant = await Participant.findByIdAndUpdate(
      req.params.id,
      { attended },
      { new: true }
    );
    if (!participant) return res.status(404).json({ error: 'Participant not found' });
    res.json(participant);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update attendance' });
  }
});

// 8 Admin Accounts for multi-device login (without 'admin' in ID)
const ADMIN_ACCOUNTS = {
  vector1: 'vector2026_one',
  vector2: 'vector2026_two',
  vector3: 'vector2026_three',
  vector4: 'vector2026_four',
  vector5: 'vector2026_five',
  vector6: 'vector2026_six',
  vector7: 'vector2026_seven',
  vector8: 'vector2026_eight'
};

// POST login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (ADMIN_ACCOUNTS[username] && ADMIN_ACCOUNTS[username] === password) {
    res.json({ token: `admin-auth-token-${username}` });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// ─── Learning Materials ──────────────────────────────────────────────────────

// Seed default items if collection is empty
const MATERIAL_SEED = [
  {
    key: 'software',
    num: '01',
    title: 'Software for Participants',
    group: '',
    tagline: 'Your creative toolkit for the day.',
    desc: 'The software package provided for all participants. Download and install before you arrive to hit the ground running.',
  },
  {
    key: 'editorial-kit',
    num: '02',
    title: 'Editorial Kit',
    group: '',
    tagline: 'Brand assets and design essentials.',
    desc: 'The official VECTOR editorial kit — typefaces, colour palettes, logo files, and brand guidelines to use across all your workshop outputs.',
  },
  {
    key: 'editorial-manual',
    num: '03',
    title: 'Editorial Manual',
    group: '',
    tagline: 'The complete style and process guide.',
    desc: 'A comprehensive reference manual covering editorial standards, content workflow, layout principles, and visual storytelling guidelines.',
  },
  {
    key: 'trainer-slides-1',
    num: '04',
    title: "Trainer's Slides — Session 1",
    group: "Trainer's Slides",
    tagline: 'Session 1 presentation deck.',
    desc: 'Slides from the first training session. Released after the session concludes so you can revisit and reinforce what you learned.',
  },
  {
    key: 'trainer-slides-2',
    num: '05',
    title: "Trainer's Slides — Session 2",
    group: "Trainer's Slides",
    tagline: 'Session 2 presentation deck.',
    desc: 'Slides from the second training session. A deep dive into the session topics — yours to keep and reference long after the event.',
  },
  {
    key: 'trainer-slides-3',
    num: '06',
    title: "Trainer's Slides — Session 3",
    group: "Trainer's Slides",
    tagline: 'Session 3 presentation deck.',
    desc: 'Slides from the third and final training session. Everything you need to carry the learning forward into your own creative work.',
  },
];

async function seedMaterials() {
  const count = await Material.countDocuments();
  if (count === 0) {
    await Material.insertMany(MATERIAL_SEED);
    console.log('Learning Materials seeded (6 items).');
  }
}

// GET all materials (public — returns accessGranted + url per item)
// Also seeds on first request if collection is empty (belt + suspenders)
app.get('/api/materials', async (req, res) => {
  try {
    await seedMaterials();           // no-op if already seeded
    const materials = await Material.find().sort({ num: 1 });
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

// PATCH toggle accessGranted
app.patch('/api/materials/:id/access', async (req, res) => {
  try {
    const { accessGranted } = req.body;
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      { accessGranted },
      { new: true }
    );
    if (!material) return res.status(404).json({ error: 'Material not found' });
    res.json(material);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update access' });
  }
});

// PATCH update URL
app.patch('/api/materials/:id/url', async (req, res) => {
  try {
    const { url } = req.body;
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      { url },
      { new: true }
    );
    if (!material) return res.status(404).json({ error: 'Material not found' });
    res.json(material);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update URL' });
  }
});
// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await seedMaterials();
});
