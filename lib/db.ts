import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "lib/db.json");

export interface LandingData {
  heroTitle: string;
  heroDescription: string;
  heroImage: string;
}

export interface User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  accountNumber: string;
  cvu: string;
  balance: number;
  verified: boolean;
  verificationCode: string | null;
  recoveryToken: string | null;
  created_at: string;
}

export interface DBStructure {
  landing: LandingData;
  users: User[];
}

function readDB(): DBStructure {
  try {
    const data = fs.readFileSync(dbPath, "utf-8");
    return JSON.parse(data) as DBStructure;
  } catch {
    // If not exists, return default seed structure
    return {
      landing: {
        heroTitle: "Dejá atrás la culebrilla de las tarjetas. Usá Digital Money House.",
        heroDescription: "La billetera virtual más segura y fácil de usar. Transferencias al instante, pago de servicios sin demoras y control total de tus finanzas.",
        heroImage: "/hero-image.png",
      },
      users: [],
    };
  }
}

function writeDB(data: DBStructure) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
}

// Generate unique CVU (22 digits) and Account Number (10 digits)
function generateFinancialDetails() {
  const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
  const cvu = "00000031" + Math.floor(10000000000000 + Math.random() * 90000000000000).toString();
  return { accountNumber, cvu };
}

export function getLandingPageData(): LandingData {
  const db = readDB();
  return db.landing;
}

interface RegisterUserParams {
  name: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
}

export function registerUser(userData: RegisterUserParams) {
  const db = readDB();

  // Validate unique email
  const existingUser = db.users.find(
    (u: User) => u.email.toLowerCase() === userData.email.toLowerCase()
  );
  if (existingUser) {
    throw new Error("El correo ya está registrado");
  }

  const { accountNumber, cvu } = generateFinancialDetails();

  const newUser: User = {
    id: (db.users.length + 1).toString(),
    name: userData.name,
    lastName: userData.lastName,
    email: userData.email,
    password: userData.password || "", // In a real app we would hash this, but we'll store plaintext for this mock DB
    phone: userData.phone || "",
    accountNumber,
    cvu,
    balance: 0.0, // Starting balance is 0
    verified: false, // Must verify on first login
    verificationCode: null,
    recoveryToken: null,
    created_at: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeDB(db);
  return { id: newUser.id, email: newUser.email };
}

export function sendLoginVerificationCode(email: string) {
  const db = readDB();
  const user = db.users.find(
    (u: User) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (!user) {
    throw new Error("El correo ingresado no pertenece a un usuario registrado");
  }

  // Generate a random 6 digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  user.verificationCode = code;
  writeDB(db);

  // We log it to the console so the QA/User can inspect the console log to login
  console.log(`[DMH Mock Auth] Verification code for ${email}: ${code}`);
  return { email, code }; // In mock mode we can return it or just log it
}

export function authenticateUser(email: string, passwordSecret: string, code: string) {
  const db = readDB();
  const user = db.users.find(
    (u: User) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  if (user.password !== passwordSecret) {
    throw new Error("Contraseña incorrecta");
  }

  if (user.verificationCode !== code) {
    throw new Error("Código de verificación incorrecto");
  }

  // Success: mark user as verified (email validation on first login)
  user.verified = true;
  user.verificationCode = null; // Clear verification code
  writeDB(db);

  // Return a mock JWT token (base64 string of user metadata)
  const tokenPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    lastName: user.lastName,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours expiry
  };
  const token = Buffer.from(JSON.stringify(tokenPayload)).toString("base64");

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      accountNumber: user.accountNumber,
      cvu: user.cvu,
      balance: user.balance,
    },
  };
}

export function createPasswordRecoveryToken(email: string) {
  const db = readDB();
  const user = db.users.find(
    (u: User) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    throw new Error("El correo ingresado no pertenece a un usuario registrado");
  }

  // Generate a random recovery token
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  user.recoveryToken = token;
  writeDB(db);

  const recoveryLink = `/reset?token=${token}`;
  console.log(`[DMH Mock Auth] Password recovery link for ${email}: ${recoveryLink}`);
  return { email, token, recoveryLink };
}

export function resetPassword(token: string, newPasswordSecret: string) {
  const db = readDB();
  const user = db.users.find((u: User) => u.recoveryToken === token);

  if (!user) {
    throw new Error("El enlace de recuperación es inválido o ha expirado");
  }

  user.password = newPasswordSecret;
  user.recoveryToken = null; // Clear token
  writeDB(db);

  return { email: user.email };
}

export function getUserById(id: string) {
  const db = readDB();
  const user = db.users.find((u: User) => u.id === id);
  if (!user) return null;
  
  return {
    id: user.id,
    name: user.name,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    accountNumber: user.accountNumber,
    cvu: user.cvu,
    balance: user.balance,
  };
}
