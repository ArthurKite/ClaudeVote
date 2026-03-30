/**
 * Run with: npx tsx scripts/seed-firestore.ts
 * Seeds Firestore with config docs for players list and admin password hash.
 */
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function seed() {
  // Seed players list
  await setDoc(doc(db, 'config', 'players'), {
    names: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'],
  })
  console.log('✓ Seeded config/players')

  // Seed admin password hash (sha256 of "claude")
  const hash = await hashPassword('claude')
  await setDoc(doc(db, 'config', 'adminPassword'), { hash })
  console.log(`✓ Seeded config/adminPassword (hash: ${hash})`)

  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
