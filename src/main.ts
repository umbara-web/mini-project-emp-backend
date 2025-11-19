import { PORT } from './config/env.config';
import app from './app';

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
