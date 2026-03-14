const priceFormatter = new Intl.NumberFormat('en-BD', {
  style: 'currency',
  currency: 'BDT',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatPrice = (value) => {
  const amount = Number(value);
  return priceFormatter.format(Number.isFinite(amount) ? amount : 0);
};
