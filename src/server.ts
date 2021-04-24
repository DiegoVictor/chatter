import { http } from './app';
import './websocket/client';
import './websocket/admin';

http.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
