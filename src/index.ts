import express from 'express';
import volunteersRouter from './volunteers/volunteer.router';

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static('dist'));

app.use("/api/volunteers", volunteersRouter);

app.get('/api', (_req, res) => {
  res.json({ message: 'Goodbye Wold!' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});