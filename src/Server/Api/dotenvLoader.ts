//This is required becaise there is an issue with dotenv and ESM!
//see https://github.com/motdotla/dotenv/issues/133#issuecomment-255298822
import * as dotenv from 'dotenv';
dotenv.config({ path: './config/.env' });

export default {};