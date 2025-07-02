//src/data/api/transaction/rollbackTransaction.js
export const rollbackTransaction = async (transactionId) => {
  const res = await fetch(`https://pointofsale-backend-api-fsada3d8gwe3d8f5.canadacentral-01.azurewebsites.net/api/Transactions/${transactionId}/Rollback`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Error al revertir la transacción');
  return true;
};
