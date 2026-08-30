const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const XLSX = require('xlsx');
const Participant = require('./models/Participant');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Multer setup (memory storage for Excel parsing)
const upload = multer({ storage: multer.memoryStorage() });

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/vector_event')
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
    const participants = await Participant.find().sort({ registrationDate: -1 });
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
        afternoonRefreshments: group.filter(p => p.afternoonRefreshments).length,
        lunch: group.filter(p => p.lunch).length,
        kitReceived: group.filter(p => p.kitReceived).length,
      };
    });

    res.json({
      total,
      morningAttendance: countIf('morningAttendance'),
      afternoonAttendance: countIf('afternoonAttendance'),
      morningRefreshments: countIf('morningRefreshments'),
      afternoonRefreshments: countIf('afternoonRefreshments'),
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
      // Map columns (case-insensitive key match)
      const name = (row['Name'] || row['NAME'] || row['name'] || '').toString().trim();
      const clubName = (row['Club Name'] || row['CLUB NAME'] || row['club name'] || row['ClubName'] || '').toString().trim();
      const groupRaw = (row['Group'] || row['GROUP'] || row['group'] || '').toString().trim();
      const portfolio = (row['Portfolio'] || row['PORTFOLIO'] || row['portfolio'] || '').toString().trim();
      const sNo = parseInt(row['S.No'] || row['SNo'] || row['s.no'] || row['Sno'] || 0, 10) || undefined;

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
          sNo,
          name,
          clubName,
          group: groupLabel,
          portfolio,
          participantId,
          email: '',
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
    const participant = new Participant(req.body);
    await participant.save();
    res.status(201).json(participant);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Email already registered' });
    } else {
      res.status(400).json({ error: 'Invalid data' });
    }
  }
});

// PUT update check-in fields
app.put('/api/participants/:id/checkin', async (req, res) => {
  try {
    const allowed = ['morningAttendance', 'afternoonAttendance', 'morningRefreshments',
      'afternoonRefreshments', 'lunch', 'kitReceived', 'attended'];
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

// POST login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'vector2026') {
    res.json({ token: 'admin-auth-token-xyz' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
