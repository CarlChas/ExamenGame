import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// 🧑 Create or login user
router.post('/login', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username is required' });

  let user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    user = await prisma.user.create({
      data: { username },
    });
  }

  res.json(user);
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
