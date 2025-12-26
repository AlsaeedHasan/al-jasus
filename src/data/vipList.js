/**
 * VIP Configuration File
 * ======================
 * Add or edit VIP players here!
 *
 * Each entry uses the player name (lowercase) as the key.
 * Types: "KING" (gold crown) or "QUEEN" (pink gem)
 *
 * To add a new VIP:
 * 1. Add their name in lowercase (both English and Arabic versions)
 * 2. Choose type: "KING" or "QUEEN"
 * 3. Write a custom Arabic message
 */

export const VIP_DATA = {
  // =====================================
  // 👑 THE DEVELOPER (KING STYLE)
  // =====================================
  saeed: {
    type: "KING",
    message: "نوسع لباشا البلددد  🔥👑",
  },
  alsaeed: {
    type: "KING",
    message: "نوسع لباشا البلددد  🔥👑",
  },
  سعيد: {
    type: "KING",
    message: "نوسع لباشا البلددد  🔥👑",
  },
  السعيد: {
    type: "KING",
    message: "نوسع لباشا البلددد  🔥👑",
  },

  // =====================================
  // 👸 THE QUEEN (QUEEN STYLE)
  // =====================================
  alaa: {
    type: "QUEEN",
    message: "كرسي للعيون الحلوين دول يابني 😍🫵💎",
  },
  lola: {
    type: "QUEEN",
    message: "كرسي للعيون الحلوين دول يابني 😍🫵💎",
  },
  الاء: {
    type: "QUEEN",
    message: "كرسي للعيون الحلوين دول يابني 😍🫵💎",
  },
  آلاء: {
    type: "QUEEN",
    message: "كرسي للعيون الحلوين دول يابني 😍🫵💎",
  },
  لولتي: {
    type: "QUEEN",
    message: "كرسي للعيون الحلوين دول يابني 😍🫵💎",
  },
  لولا: {
    type: "QUEEN",
    message: "كرسي للعيون الحلوين دول يابني 😍🫵💎",
  },
};

/**
 * Helper function to get VIP data for a name
 * @param {string} name - The player name to check
 * @returns {object|null} - VIP data object or null if not VIP
 */
export const getVipData = (name) => {
  if (!name) return null;
  const normalizedName = name.trim().toLowerCase();
  return VIP_DATA[normalizedName] || null;
};

/**
 * Check if a name is VIP
 * @param {string} name - The player name to check
 * @returns {boolean}
 */
export const isVip = (name) => {
  return getVipData(name) !== null;
};
