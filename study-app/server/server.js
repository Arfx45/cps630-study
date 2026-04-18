const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');
const Question = require('./models/Question');
const questionsRouter = require('./routes/questions');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use('/api', questionsRouter);

async function seed(mongoUri) {
  const count = await Question.countDocuments();
  if (count > 0) { console.log(`DB already seeded with ${count} questions.`); return; }

  const jsonPath = path.join(__dirname, '..', '..', 'questions.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('questions.json not found at', jsonPath);
    return;
  }

  const raw = fs.readFileSync(jsonPath, 'utf8');
  const sections = JSON.parse(raw);
  const docs = [];

  sections.forEach((sec, sectionIdx) => {
    const tag = sec.name.match(/S(\d+)/)?.[0] || `S${sectionIdx + 1}`;
    sec.questions.forEach(q => {
      docs.push({
        num: q.num,
        question: q.question,
        options: q.options,
        correct: q.correct,
        sectionName: sec.name,
        sectionIdx,
        sectionTag: tag,
      });
    });
  });

  await Question.insertMany(docs);
  console.log(`Seeded ${docs.length} questions across ${sections.length} sections.`);
}

async function start() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  console.log('MongoDB (in-memory) connected');
  await seed(uri);
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}

start().catch(console.error);
