import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const currentUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/news-mazlis';

async function backup() {
  console.log(`Connecting to: ${currentUri}`);
  const client = new MongoClient(currentUri);
  try {
    await client.connect();
    
    // Extract db name from URI or default to news-mazlis
    const dbName = currentUri.split('/').pop().split('?')[0] || 'news-mazlis';
    console.log(`Target database to backup: ${dbName}`);
    
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    console.log('Collections found:', collections.map(c => c.name));

    const backupDir = path.join(process.cwd(), `db_backup_${dbName}`);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const summary = {};

    for (const col of collections) {
      const docs = await db.collection(col.name).find({}).toArray();
      const filePath = path.join(backupDir, `${col.name}.json`);
      fs.writeFileSync(filePath, JSON.stringify(docs, null, 2));
      summary[col.name] = docs.length;
      console.log(`Exported ${docs.length} documents from collection '${col.name}' to ${filePath}`);
    }
    
    fs.writeFileSync(path.join(backupDir, 'meta.json'), JSON.stringify(summary, null, 2));
    console.log('\nBackup successfully completed!');
    console.log('Backup summary:', summary);
  } catch (err) {
    console.error('Backup failed:', err);
  } finally {
    await client.close();
  }
}

backup();
