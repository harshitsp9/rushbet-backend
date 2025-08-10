import dotenv from 'dotenv';

import env from '@/config/environment';

export default dotenv.config({ path: env() });
