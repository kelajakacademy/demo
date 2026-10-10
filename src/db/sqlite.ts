import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'pos.db');
export const db = new Database(dbPath);

// Initialize tables if needed
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    image TEXT,
    stock INTEGER DEFAULT 0,
    categoryId TEXT,
    FOREIGN KEY (categoryId) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS waiters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    pin TEXT NOT NULL,
    role TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    waiterId TEXT,
    waiterName TEXT,
    tableNumber TEXT,
    subtotal REAL DEFAULT 0,
    tax REAL DEFAULT 0,
    total REAL NOT NULL,
    status TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    items TEXT NOT NULL,
    FOREIGN KEY (waiterId) REFERENCES waiters(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tables (
    id TEXT PRIMARY KEY,
    number TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    status TEXT NOT NULL,
    activeWaiterId TEXT,
    activeWaiterName TEXT,
    activeOrderId TEXT,
    FOREIGN KEY (activeWaiterId) REFERENCES waiters(id)
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    fullName TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'owner',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS telegram_verifications (
    phone TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    expiresAt INTEGER NOT NULL,
    telegramUsername TEXT,
    createdAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS telegram_user_chats (
    phone TEXT PRIMARY KEY,
    chatId TEXT NOT NULL,
    username TEXT,
    updatedAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cafes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    businessType TEXT,
    ownerId TEXT,
    phone TEXT,
    address TEXT,
    logoUrl TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS fiscal_records (
    id TEXT PRIMARY KEY,
    orderId TEXT NOT NULL,
    receiptNumber TEXT NOT NULL,
    fiscalSign TEXT NOT NULL,
    fiscalModuleNumber TEXT,
    terminalNumber TEXT,
    fiscalUrl TEXT,
    totalAmount REAL DEFAULT 0,
    vatAmount REAL DEFAULT 0,
    cashAmount REAL DEFAULT 0,
    cardAmount REAL DEFAULT 0,
    status TEXT DEFAULT 'success',
    errorMessage TEXT,
    cafeId TEXT DEFAULT 'default',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS z_reports (
    id TEXT PRIMARY KEY,
    reportNumber INTEGER NOT NULL,
    fiscalModuleNumber TEXT,
    terminalNumber TEXT,
    shiftOpenTime DATETIME,
    shiftCloseTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    totalSales REAL DEFAULT 0,
    cashSales REAL DEFAULT 0,
    cardSales REAL DEFAULT 0,
    totalVat REAL DEFAULT 0,
    ordersCount INTEGER DEFAULT 0,
    firstReceiptNumber TEXT,
    lastReceiptNumber TEXT,
    cafeId TEXT DEFAULT 'default',
    status TEXT DEFAULT 'closed'
  );

  CREATE TABLE IF NOT EXISTS delivery_orders (
    id TEXT PRIMARY KEY,
    orderNumber TEXT NOT NULL,
    aggregator TEXT NOT NULL,
    customerName TEXT NOT NULL,
    customerPhone TEXT NOT NULL,
    deliveryAddress TEXT NOT NULL,
    deliveryLocation TEXT,
    courierName TEXT,
    courierPhone TEXT,
    courierType TEXT DEFAULT 'aggregator',
    status TEXT DEFAULT 'new',
    items TEXT NOT NULL,
    subtotal REAL DEFAULT 0,
    deliveryFee REAL DEFAULT 0,
    aggregatorFee REAL DEFAULT 0,
    totalAmount REAL NOT NULL,
    paymentMethod TEXT DEFAULT 'online',
    paymentStatus TEXT DEFAULT 'paid',
    comment TEXT,
    estimatedDeliveryTime TEXT DEFAULT '25-35 min',
    etaMinutes INTEGER DEFAULT 30,
    cafeId TEXT DEFAULT 'default',
    isFiscalized INTEGER DEFAULT 0,
    fiscalSign TEXT,
    fiscalQrUrl TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    acceptedAt DATETIME,
    readyAt DATETIME,
    deliveredAt DATETIME
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Boshqa',
    unit TEXT DEFAULT 'kg',
    quantity REAL DEFAULT 0,
    minLimit REAL DEFAULT 5,
    costPrice REAL DEFAULT 0,
    supplier TEXT,
    cafeId TEXT DEFAULT 'default',
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS halls (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    cafeId TEXT DEFAULT 'default'
  );

  CREATE TABLE IF NOT EXISTS stocks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    cafeId TEXT DEFAULT 'default',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    stockId TEXT,
    printerType TEXT DEFAULT 'kitchen',
    servicePercent REAL DEFAULT 10,
    cafeId TEXT DEFAULT 'default',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ingredient_groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    cafeId TEXT DEFAULT 'default',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS semi_finished (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    unit TEXT DEFAULT 'kg',
    costPrice REAL DEFAULT 0,
    stockId TEXT,
    recipe TEXT,
    cafeId TEXT DEFAULT 'default',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS modifiers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL DEFAULT 0,
    category TEXT DEFAULT 'Qo‘shimchalar',
    dishId TEXT,
    cafeId TEXT DEFAULT 'default',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS linked_dishes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    mainDishId TEXT,
    linkedDishId TEXT,
    discountPercent REAL DEFAULT 0,
    cafeId TEXT DEFAULT 'default',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS client_groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    discountPercent REAL DEFAULT 0,
    cashbackPercent REAL DEFAULT 3,
    color TEXT DEFAULT '#3B82F6',
    minSpend REAL DEFAULT 0,
    cafeId TEXT DEFAULT 'default',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    cardNumber TEXT,
    groupId TEXT DEFAULT 'regular',
    groupName TEXT DEFAULT 'Doimiy mijoz',
    discountPercent REAL DEFAULT 0,
    cashbackPercent REAL DEFAULT 3,
    bonusBalance REAL DEFAULT 0,
    depositBalance REAL DEFAULT 0,
    debtBalance REAL DEFAULT 0,
    totalVisits INTEGER DEFAULT 0,
    totalSpent REAL DEFAULT 0,
    avgCheck REAL DEFAULT 0,
    birthday TEXT,
    gender TEXT DEFAULT 'unspecified',
    notes TEXT,
    status TEXT DEFAULT 'active',
    lastVisit DATETIME,
    cafeId TEXT DEFAULT 'default',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS client_transactions (
    id TEXT PRIMARY KEY,
    clientId TEXT NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    orderId TEXT,
    comment TEXT,
    waiterName TEXT,
    cafeId TEXT DEFAULT 'default',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS loyalty_settings (
    cafeId TEXT PRIMARY KEY,
    enabled INTEGER DEFAULT 1,
    type TEXT DEFAULT 'cashback',
    defaultCashbackPercent REAL DEFAULT 3,
    maxBonusUsagePercent REAL DEFAULT 50,
    bonusToCurrencyRate REAL DEFAULT 1,
    welcomeBonus REAL DEFAULT 15000,
    birthdayBonus REAL DEFAULT 30000,
    birthdayDiscountPercent REAL DEFAULT 15,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    contactPerson TEXT,
    address TEXT,
    inn TEXT,
    bankDetails TEXT,
    balance REAL DEFAULT 0,
    cafeId TEXT DEFAULT 'default',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    number TEXT NOT NULL,
    date TEXT NOT NULL,
    type TEXT DEFAULT 'incoming',
    stockId TEXT,
    stockName TEXT,
    targetStockId TEXT,
    targetStockName TEXT,
    supplierId TEXT,
    supplierName TEXT,
    itemsCount INTEGER DEFAULT 0,
    totalQuantity REAL DEFAULT 0,
    totalAmount REAL DEFAULT 0,
    paidAmount REAL DEFAULT 0,
    debtAmount REAL DEFAULT 0,
    paymentMethod TEXT DEFAULT 'cash',
    status TEXT DEFAULT 'conducted',
    comment TEXT,
    items TEXT NOT NULL,
    createdBy TEXT DEFAULT 'Admin',
    cafeId TEXT DEFAULT 'default',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS expense_groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    cafeId TEXT DEFAULT 'default',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cash_operations (
    id TEXT PRIMARY KEY,
    groupId TEXT,
    groupName TEXT NOT NULL,
    type TEXT NOT NULL,
    cashRegister TEXT DEFAULT 'Касса по умолчанию',
    date TEXT NOT NULL,
    description TEXT,
    cashAmount REAL DEFAULT 0,
    bankAccountAmount REAL DEFAULT 0,
    bankCardAmount REAL DEFAULT 0,
    totalAmount REAL NOT NULL,
    author TEXT DEFAULT 'Kassir',
    cafeId TEXT DEFAULT 'default',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS printers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'kitchen',
    connectionType TEXT NOT NULL DEFAULT 'lan',
    ipAddress TEXT,
    port INTEGER DEFAULT 9100,
    paperWidth TEXT DEFAULT '80mm',
    departmentId TEXT,
    departmentName TEXT,
    assignedCategories TEXT DEFAULT '[]',
    status TEXT DEFAULT 'active',
    isDefault INTEGER DEFAULT 0,
    cafeId TEXT DEFAULT 'default',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    actionType TEXT NOT NULL,
    actionTitle TEXT NOT NULL,
    userName TEXT NOT NULL,
    userRole TEXT DEFAULT 'admin',
    details TEXT,
    targetId TEXT,
    severity TEXT DEFAULT 'info',
    cafeId TEXT DEFAULT 'default',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    accessLevel TEXT NOT NULL,
    description TEXT,
    canAccessPos INTEGER DEFAULT 1,
    canTakeOrders INTEGER DEFAULT 1,
    canCloseOrders INTEGER DEFAULT 1,
    canCancelOrders INTEGER DEFAULT 0,
    canGiveDiscount INTEGER DEFAULT 0,
    canAccessReports INTEGER DEFAULT 0,
    canAccessAdmin INTEGER DEFAULT 0,
    cafeId TEXT DEFAULT 'default',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS cafe_payments (
    id TEXT PRIMARY KEY,
    cafeId TEXT NOT NULL,
    date TEXT NOT NULL,
    amount REAL NOT NULL,
    paymentMethod TEXT DEFAULT 'card',
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration Helper: Add columns if they don't exist
const addColumn = (table: string, column: string, type: string) => {
  try {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  } catch (e) {}
};

addColumn('cafes', 'status', "TEXT DEFAULT 'active'");
addColumn('cafes', 'subscriptionFee', "REAL DEFAULT 500000");
addColumn('cafes', 'totalPaid', "REAL DEFAULT 0");
addColumn('cafes', 'payments', "TEXT DEFAULT '[]'");
addColumn('cafes', 'expiresAt', "TEXT");
addColumn('cafes', 'isTrial', "INTEGER DEFAULT 0");
addColumn('cafes', 'trialDays', "INTEGER DEFAULT 14");
addColumn('admin_users', 'cafeId', "TEXT DEFAULT 'default'");
addColumn('admin_users', 'companyName', "TEXT");
addColumn('admin_users', 'businessType', "TEXT DEFAULT 'restaurant'");
addColumn('tables', 'cafeId', "TEXT DEFAULT 'default'");
addColumn('waiters', 'phone', "TEXT");
addColumn('waiters', 'status', "TEXT DEFAULT 'active'");
addColumn('waiters', 'cafeId', "TEXT DEFAULT 'default'");
addColumn('roles', 'cafeId', "TEXT DEFAULT 'default'");
addColumn('orders', 'cafeId', "TEXT DEFAULT 'default'");

// Seed default admin user if not exists
try {
  const adminCount = db.prepare('SELECT count(*) as count FROM admin_users').get() as { count: number };
  if (adminCount.count === 0) {
    const insertAdmin = db.prepare('INSERT INTO admin_users (id, username, password, fullName, phone, role) VALUES (?, ?, ?, ?, ?, ?)');
    insertAdmin.run('admin-1', 'admin', 'admin123', 'Xakimjon Xayitov', '+998339939900', 'owner');
  }
} catch (e) {}

// Seed default cafe in cafes table
try {
  const defaultCafe = db.prepare("SELECT count(*) as count FROM cafes WHERE id = 'default'").get() as { count: number };
  if (defaultCafe.count === 0) {
    db.prepare("INSERT INTO cafes (id, name, businessType, ownerId, phone) VALUES (?, ?, ?, ?, ?)").run(
      'default', 'iNPOS Restaurant', 'restaurant', 'admin-1', '+998339939900'
    );
  }
} catch (e) {}

// Seed default waiters/staff if empty
try {
  const staffCount = db.prepare("SELECT count(*) as count FROM waiters").get() as { count: number };
  if (staffCount.count === 0) {
    const insertStaff = db.prepare("INSERT INTO waiters (id, name, pin, role) VALUES (?, ?, ?, ?)");
    insertStaff.run('staff-1', 'Аида (Кассир)', '1234', 'kassir');
    insertStaff.run('staff-2', 'Алишер (Официант)', '1111', 'waiter');
    insertStaff.run('staff-3', 'Сардор (Бармен)', '2222', 'barmen');
    insertStaff.run('staff-4', 'Хакимjon (Менеджер)', '0000', 'admin');
  }
} catch (e) {}

export default db;
