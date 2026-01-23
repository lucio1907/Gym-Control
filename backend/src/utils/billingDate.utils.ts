const calculateBillingDate = (paymentDate: Date) => {
  const date = new Date(paymentDate);

  const actualMonth = date.getMonth();

  date.setMonth(actualMonth + 1);

  // Manejo de "Desbordamiento" (Edge Case):
  if (date.getMonth() > (actualMonth + 1) % 12) date.setDate(0);

  return date;
};

export default calculateBillingDate;