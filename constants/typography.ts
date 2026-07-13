import { useFonts } from 'expo-font';
import {
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
  HankenGrotesk_800ExtraBold,
} from '@expo-google-fonts/hanken-grotesk';

// Identité typographique alignée sur le web (Marine & Soleil) :
// Fraunces pour les titres (chaleur éditoriale), Hanken Grotesk pour le texte.
// Chaque style fixe une variante de police précise plutôt que fontWeight,
// car mélanger fontWeight et famille custom fait planter le rendu sur Android.
export const fontFamily = {
  displayRegular: 'Fraunces_500Medium',
  displaySemiBold: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',
  sansRegular: 'HankenGrotesk_400Regular',
  sansMedium: 'HankenGrotesk_500Medium',
  sansSemiBold: 'HankenGrotesk_600SemiBold',
  sansBold: 'HankenGrotesk_700Bold',
  sansExtraBold: 'HankenGrotesk_800ExtraBold',
};

export function useAppFonts() {
  return useFonts({
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    HankenGrotesk_800ExtraBold,
  });
}

// Échelle de type : styles complets prêts à être passés dans un tableau de style.
export const type = {
  display: { fontFamily: fontFamily.displaySemiBold, fontSize: 30, lineHeight: 36, letterSpacing: -0.4 },
  title: { fontFamily: fontFamily.displaySemiBold, fontSize: 20, lineHeight: 26, letterSpacing: -0.2 },
  subtitle: { fontFamily: fontFamily.sansMedium, fontSize: 15, lineHeight: 21 },
  body: { fontFamily: fontFamily.sansRegular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fontFamily.sansSemiBold, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: fontFamily.sansSemiBold, fontSize: 13, lineHeight: 18 },
  eyebrow: {
    fontFamily: fontFamily.sansBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  caption: { fontFamily: fontFamily.sansMedium, fontSize: 12, lineHeight: 16 },
  numeric: {
    fontFamily: fontFamily.sansExtraBold,
    fontSize: 26,
    lineHeight: 30,
    fontVariant: ['tabular-nums'] as const,
  },
};
