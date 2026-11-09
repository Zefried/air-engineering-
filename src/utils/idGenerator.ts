export const generateUniqueId = (prefix = "id"): string => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};
