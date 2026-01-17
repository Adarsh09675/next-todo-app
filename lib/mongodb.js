// Stubbed dbConnect for migration
// Mongoose has been uninstalled.
// This file is kept to prevent import errors in unmigrated files, but it does nothing.

async function dbConnect() {
  console.warn('dbConnect called but Mongoose is uninstalled. This is a no-op.');
  return null;
}

export default dbConnect;
