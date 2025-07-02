//src/data/api/transaction/beginTransaction.js
export const beginTransaction = async () => {
  const response = await fetch('https://pointofsale-backend-api-fsada3d8gwe3d8f5.canadacentral-01.azurewebsites.net/api/Transactions/Begin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Error al iniciar la transacción');
  }
  
  const data = await response.json();
  return data.transactionId; // Retorna solo el ID de la transacción
};