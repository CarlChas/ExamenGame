import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';


const router = Router();
const prisma = new PrismaClient();

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return res.status(400).json({ error: 'Username already taken' });

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { username, password: hashed },
  });

  res.json({ message: 'User registered', user: { id: user.id, username: user.username } });
});



// 🧑 Create or login user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      password: true, // 👈 this line is key
    }
  });

  if (!user) return res.status(404).json({ error: 'User not found' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid password' });

  res.json({ id: user.id, username: user.username });
});


// 💾 Save characters
router.post('/save', async (req, res) => {
  const { username, characters } = req.body;
  if (!username || !characters) return res.status(400).json({ error: 'Missing data' });

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  await prisma.character.deleteMany({ where: { userId: user.id } });

  const newChars = await prisma.character.createMany({
    data: characters.map((char: any) => ({
      ...char,
      userId: user.id,
    })),
  });

  res.json({ success: true, created: newChars.count });
});

// 📥 Load characters
router.get('/load/:username', async (req, res) => {
  const { username } = req.params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: { characters: true },
  });

  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json(user.characters);
});

export default router;
