export function isValidPhoneNumber(phone: string): boolean {
  // Basic phone validation: 10–15 digits
  const cleaned = phone.replace(/[^0-9]/g, "");
  return cleaned.length >= 10 && cleaned.length <= 15;
}
