
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

interface Creds { useremail: string; password: string }

export default async function refresh({ useremail, password }: Creds) {
  if (!useremail || !password) {
    throw new Error('useremail / password missing');
  }

  const loginUrl = 'https://training.clearsky.techeagle.org/admin/login';
  const { data } = await axios.post(loginUrl, { useremail, password });
  const token = data?.token;
  if (!token) throw new Error('token missing in response');

  // const envPath = path.resolve(process.cwd(), '.env');
  // const envText = fs.readFileSync(envPath, 'utf8');
  // const newText = envText.match(/^CLEAR_SKY_API_KEY=/m)
  //   ? envText.replace(/^CLEAR_SKY_API_KEY=.*$/m, `CLEAR_SKY_API_KEY=${token}`)
  //   : envText.concat(`\nCLEAR_SKY_API_KEY=${token}\n`);

  // fs.writeFileSync(envPath, newText);
  
  console.log('ClearSky token updated', new Date().toISOString());
  return token;
}
