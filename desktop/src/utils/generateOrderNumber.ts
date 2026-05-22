export function generateOrderNumber(lastOrderNumber?: string): string {
  if (!lastOrderNumber) return 'PC-001';
  const num = parseInt(lastOrderNumber.split('-')[1], 10);
  return `PC-${String(num + 1).padStart(3, '0')}`;
}
