export function normalizeEmail(email: string) {
  const [firstPart, domain] = email.toLowerCase().split("@");

  //   replacing all dots with ""
  const normalizedEmail = firstPart?.replaceAll(".", "") + "@" + domain;

  return normalizedEmail;
}

export function normalizePhone(phone: string) {
  // removing all the non digit characters
  let normalizedPhone = phone.replace(/\D/g, "");

  // taking last 10 digits

  normalizedPhone = phone.slice(-10);

  return normalizedPhone;
}

export function normalizeName(name: string) {
  let normalizedName = name.trim();
  normalizedName = normalizedName.toLowerCase();

  // replacing any inbetween spaces with single space
  normalizedName = normalizedName.replace(/\s+/g, " ");

  return normalizedName;
}

export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  return /^\d{10}$/.test(phone);
};
