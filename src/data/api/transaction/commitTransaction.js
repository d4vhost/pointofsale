//src/data/api/transaction/commitTransaction.js
export const commitTransaction = async (transactionId) => {
  const res = await fetch(`https://pointofsale-backend-api-fsada3d8gwe3d8f5.canadacentral-01.azurewebsites.net/api/Transactions/${transactionId}/Commit`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Error al confirmar la transacción');
  return true;
};
