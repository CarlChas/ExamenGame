import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import usersRouter from './routes/userRoutes';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use('/api/users', usersRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
