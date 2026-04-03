export function formatPhoneDisplay(digits: string) {
  if (!digits) return "";
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)} ${digits.slice(4)}`;
}

export function formatOtpDisplay(digits: string) {
  if (!digits) return "";
  if (digits.length <= 3) return digits;
  return `${digits.slice(0, 3)} ${digits.slice(3)}`;
}
