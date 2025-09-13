/**
 * Starts the application on the port specified.
 */
import 'dotenv/config';

import api from './api';

const PORT = process.env.PORT || 9080;

api.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
