// BotBot theme colors
export const colors = {
  primary: '#FF6B00',      // Turuncu (ana renk)
  primaryLight: '#FF8C3D', // Açık turuncu
  primaryDark: '#E65100',  // Koyu turuncu
  secondary: '#FFFFFF',    // Beyaz (ikincil renk)
  secondaryLight: '#F5F5F5', // Açık gri
  secondaryDark: '#E0E0E0',  // Koyu gri
  textOnPrimary: '#FFFFFF',  // Turuncu üzerindeki metin
  textOnSecondary: '#212121', // Beyaz üzerindeki metin
  background: '#FFFFFF',    // Arka plan
  surface: '#F9F9F9',      // Yüzey
  error: '#F44336',        // Hata
  success: '#4CAF50',      // Başarı
  warning: '#FF9800',      // Uyarı
  info: '#2196F3',         // Bilgi
  border: '#EEEEEE',       // Kenarlık
  textLight: '#757575',    // Açık metin
  textDark: '#212121',     // Koyu metin
};

// Tipografi
export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    small: 10,
    medium: 14,
    large: 18,
    xlarge: 22,
  },
};

// Boşluklar
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Kenar yuvarlaklıkları
export const borderRadius = {
  small: 4,
  medium: 8,
  large: 16,
};

// Gölgeler
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
};

// BotBot tema
export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};