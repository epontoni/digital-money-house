import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "lib/db.json");

export interface LandingData {
  heroTitle: string;
  heroDescription: string;
  heroImage: string;
}

export interface Card {
  id: string;
  userId: string;
  cardNumber: string;
  lastFour: string;
  cardholderName: string;
  expiryDate: string;
  brand: "Visa" | "Mastercard" | "AMEX" | "Otra";
  created_at: string;
}

export interface Activity {
  id: string;
  userId: string;
  type: "deposit" | "transfer_out" | "transfer_in" | "service_payment";
  description: string;
  amount: number;
  date: string;
  dayName: string;
}

export interface User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  cuit: string;
  alias: string;
  accountNumber: string;
  cvu: string;
  balance: number;
  verified: boolean;
  verificationCode: string | null;
  recoveryToken: string | null;
  pendingEmail?: string | null;
  emailConfirmationToken?: string | null;
  created_at: string;
}

export interface DBStructure {
  landing: LandingData;
  users: User[];
  cards: Card[];
  activities: Activity[];
}

function readDB(): DBStructure {
  try {
    const data = fs.readFileSync(dbPath, "utf-8");
    const parsed = JSON.parse(data);
    if (!parsed.cards) parsed.cards = [];
    if (!parsed.activities) parsed.activities = [];
    return parsed as DBStructure;
  } catch {
    return {
      landing: {
        heroTitle: "Dejá atrás la culebrilla de las tarjetas. Usá Digital Money House.",
        heroDescription: "La billetera virtual más segura y fácil de usar. Transferencias al instante, pago de servicios sin demoras y control total de tus finanzas.",
        heroImage: "/hero-image.png",
      },
      users: [],
      cards: [],
      activities: [],
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

// Generate standard 3-word alias "word.word.word"
function generateDefaultAlias(name: string, lastName: string) {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "") || "cuenta";
  const cleanLast = lastName.toLowerCase().replace(/[^a-z0-9]/g, "") || "usuario";
  return `${cleanName}.${cleanLast}.dmh`;
}

export function detectCardBrand(cardNumber: string): "Visa" | "Mastercard" | "AMEX" | "Otra" {
  const cleaned = cardNumber.replace(/\D/g, "");
  if (cleaned.startsWith("4")) {
    return "Visa";
  }
  const firstTwo = parseInt(cleaned.slice(0, 2), 10);
  const firstFour = parseInt(cleaned.slice(0, 4), 10);
  if ((firstTwo >= 51 && firstTwo <= 55) || (firstFour >= 2221 && firstFour <= 2720)) {
    return "Mastercard";
  }
  if (firstTwo === 34 || firstTwo === 37) {
    return "AMEX";
  }
  return "Otra";
}

export function validateAlias(alias: string): boolean {
  if (!alias) return false;
  const parts = alias.trim().split(".");
  return (
    parts.length === 3 &&
    parts.every((part) => part.length >= 2 && /^[a-zA-Z0-9]+$/.test(part))
  );
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

  const existingUser = db.users.find(
    (u: User) => u.email.toLowerCase() === userData.email.toLowerCase()
  );
  if (existingUser) {
    throw new Error("El correo ya está registrado");
  }

  const { accountNumber, cvu } = generateFinancialDetails();
  const alias = generateDefaultAlias(userData.name, userData.lastName);

  const newUser: User = {
    id: (db.users.length + 1).toString(),
    name: userData.name,
    lastName: userData.lastName,
    email: userData.email,
    password: userData.password || "",
    phone: userData.phone || "1146730989",
    cuit: "20" + Math.floor(10000000 + Math.random() * 90000000).toString() + "8",
    alias,
    accountNumber,
    cvu,
    balance: 0.0,
    verified: false,
    verificationCode: null,
    recoveryToken: null,
    pendingEmail: null,
    emailConfirmationToken: null,
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

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  user.verificationCode = code;
  writeDB(db);

  console.log(`[DMH Mock Auth] Verification code for ${email}: ${code}`);
  return { email, code };
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

  user.verified = true;
  user.verificationCode = null;
  writeDB(db);

  const tokenPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    lastName: user.lastName,
    exp: Date.now() + 24 * 60 * 60 * 1000,
  };
  const token = Buffer.from(JSON.stringify(tokenPayload)).toString("base64");

  return {
    token,
    user: getSafeUser(user),
  };
}

export function getSafeUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || "1146730989",
    cuit: user.cuit || "20350269798",
    alias: user.alias || generateDefaultAlias(user.name, user.lastName),
    accountNumber: user.accountNumber,
    cvu: user.cvu,
    balance: user.balance,
  };
}

export function getUserById(id: string) {
  const db = readDB();
  const user = db.users.find((u: User) => u.id === id);
  if (!user) return null;
  return getSafeUser(user);
}

export function updateUserProfile(
  id: string,
  data: {
    name?: string;
    lastName?: string;
    phone?: string;
    cuit?: string;
    alias?: string;
    email?: string;
  }
) {
  const db = readDB();
  const user = db.users.find((u: User) => u.id === id);
  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  if (data.name !== undefined && data.name.trim()) user.name = data.name.trim();
  if (data.lastName !== undefined && data.lastName.trim()) user.lastName = data.lastName.trim();
  if (data.phone !== undefined) user.phone = data.phone.trim();
  if (data.cuit !== undefined) user.cuit = data.cuit.trim();

  if (data.alias !== undefined) {
    const trimmedAlias = data.alias.trim().toLowerCase();
    if (!validateAlias(trimmedAlias)) {
      throw new Error("El alias debe estar conformado por 3 palabras separadas por puntos (ejemplo: palabra.palabra.palabra)");
    }
    user.alias = trimmedAlias;
  }

  let emailConfirmationSent = false;
  let confirmationLink = "";

  if (data.email !== undefined && data.email.toLowerCase() !== user.email.toLowerCase()) {
    const existingEmail = db.users.find(
      (u: User) => u.id !== id && u.email.toLowerCase() === data.email!.toLowerCase()
    );
    if (existingEmail) {
      throw new Error("El nuevo correo ya está en uso por otra cuenta");
    }

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    user.pendingEmail = data.email.trim().toLowerCase();
    user.emailConfirmationToken = token;
    emailConfirmationSent = true;
    confirmationLink = `/confirm-email?token=${token}`;
    console.log(`[DMH Mock Auth] Confirmation email link for new email ${user.pendingEmail}: ${confirmationLink}`);
  }

  writeDB(db);

  return {
    user: getSafeUser(user),
    emailConfirmationSent,
    confirmationLink,
  };
}

export function confirmNewEmail(token: string) {
  const db = readDB();
  const user = db.users.find((u: User) => u.emailConfirmationToken === token);
  if (!user || !user.pendingEmail) {
    throw new Error("El enlace de confirmación es inválido o ha expirado");
  }

  user.email = user.pendingEmail;
  user.pendingEmail = null;
  user.emailConfirmationToken = null;
  writeDB(db);

  return { email: user.email };
}

// Cards Management
export function getCardsByUserId(userId: string): Omit<Card, "cardNumber">[] {
  const db = readDB();
  const cards = db.cards.filter((c: Card) => c.userId === userId);
  return cards.map((c) => ({
    id: c.id,
    userId: c.userId,
    lastFour: c.lastFour,
    cardholderName: c.cardholderName,
    expiryDate: c.expiryDate,
    brand: c.brand,
    created_at: c.created_at,
  }));
}

export function addCard(
  userId: string,
  cardData: {
    cardNumber: string;
    cardholderName: string;
    expiryDate: string;
    securityCode?: string;
  }
) {
  const db = readDB();
  const userCards = db.cards.filter((c: Card) => c.userId === userId);

  if (userCards.length >= 10) {
    throw new Error("Has alcanzado el límite máximo de 10 tarjetas");
  }

  const rawDigits = cardData.cardNumber.replace(/\D/g, "");
  if (rawDigits.length < 13 || rawDigits.length > 19) {
    throw new Error("El número de tarjeta debe tener entre 13 y 19 dígitos");
  }

  if (!cardData.cardholderName || !cardData.cardholderName.trim()) {
    throw new Error("El nombre y apellido del titular es requerido");
  }

  if (!cardData.expiryDate || !/^\d{2}\/\d{2}$/.test(cardData.expiryDate.trim())) {
    throw new Error("La fecha de vencimiento debe tener formato MM/AA");
  }

  const brand = detectCardBrand(rawDigits);
  const lastFour = rawDigits.slice(-4);

  const newCard: Card = {
    id: "card_" + Date.now().toString(),
    userId,
    cardNumber: rawDigits,
    lastFour,
    cardholderName: cardData.cardholderName.trim().toUpperCase(),
    expiryDate: cardData.expiryDate.trim(),
    brand,
    created_at: new Date().toISOString(),
  };

  db.cards.push(newCard);
  writeDB(db);

  return {
    id: newCard.id,
    userId: newCard.userId,
    lastFour: newCard.lastFour,
    cardholderName: newCard.cardholderName,
    expiryDate: newCard.expiryDate,
    brand: newCard.brand,
    created_at: newCard.created_at,
  };
}

export function deleteCard(userId: string, cardId: string) {
  const db = readDB();
  const initialLength = db.cards.length;
  db.cards = db.cards.filter((c: Card) => !(c.userId === userId && c.id === cardId));

  if (db.cards.length === initialLength) {
    throw new Error("Tarjeta no encontrada");
  }

  writeDB(db);
  const remainingCards = db.cards.filter((c: Card) => c.userId === userId);
  return { success: true, count: remainingCards.length };
}

// Activity Management
export function getActivitiesByUserId(userId: string, limit: number = 10, query?: string) {
  const db = readDB();
  let activities = db.activities.filter((a: Activity) => a.userId === userId);

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    activities = activities.filter((a) =>
      a.description.toLowerCase().includes(q) ||
      a.dayName.toLowerCase().includes(q) ||
      a.amount.toString().includes(q)
    );
  }

  // Sort by date descending by default
  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (limit > 0) {
    return activities.slice(0, limit);
  }

  return activities;
}

export function createPasswordRecoveryToken(email: string) {
  const db = readDB();
  const user = db.users.find(
    (u: User) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    throw new Error("El correo ingresado no pertenece a un usuario registrado");
  }

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
  user.recoveryToken = null;
  writeDB(db);

  return { email: user.email };
}
