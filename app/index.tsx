import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/Button";
import { Colors } from "@/constants/colors";

const { width } = Dimensions.get("window");

type Slide = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
  bullets: { icon: keyof typeof Ionicons.glyphMap; label: string }[];
};

const SLIDES: Slide[] = [
  {
    key: "create",
    icon: "storefront-outline",
    title: "Build your store in minutes",
    text: "No coding, no design skills needed. Just add your info and go live.",
    bullets: [
      { icon: "image-outline", label: "Upload your logo & product photos" },
      { icon: "pricetag-outline", label: "Set prices in your currency" },
      { icon: "color-palette-outline", label: "Pick a style that fits your brand" },
    ],
  },
  {
    key: "share",
    icon: "share-social-outline",
    title: "Share your link everywhere",
    text: "One link for WhatsApp, Instagram, Facebook — wherever your customers are.",
    bullets: [
      { icon: "logo-whatsapp", label: "Perfect for WhatsApp catalogs" },
      { icon: "qr-code-outline", label: "Shareable QR code included" },
      { icon: "infinite-outline", label: "No limit on how many times you share" },
    ],
  },
  {
    key: "orders",
    icon: "receipt-outline",
    title: "Get orders, hassle-free",
    text: "Customers browse and order directly — no account needed on their side.",
    bullets: [
      { icon: "notifications-outline", label: "Instant order notifications" },
      { icon: "card-outline", label: "Track payments & status" },
      { icon: "people-outline", label: "Build your customer list automatically" },
    ],
  },
];

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowSplash(false));
    }, 1300);
    return () => clearTimeout(timer);
  }, []);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(idx);
  };

  const goTo = (index: number) => {
    listRef.current?.scrollToIndex({ index });
  };

  const goNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      goTo(activeIndex + 1);
    } else {
      router.replace("/signup");
    }
  };

  const goBack = () => {
    if (activeIndex > 0) goTo(activeIndex - 1);
  };

  const skip = () => router.replace("/login");
  const isLast = activeIndex === SLIDES.length - 1;
  const isFirst = activeIndex === 0;

  return (
    <View style={styles.root}>
      {/* Onboarding */}
      <Animated.View style={[styles.flex, { opacity: contentOpacity }]}>
        <SafeAreaView style={styles.flex} edges={["top", "bottom"]}>
          <View style={styles.topBar}>
            <View style={styles.dotsRow}>
              {SLIDES.map((_, i) => (
                <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
              ))}
            </View>
            <Pressable onPress={skip} hitSlop={10}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          </View>

          <FlatList
            ref={listRef}
            data={SLIDES}
            keyExtractor={(item) => item.key}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <View style={[styles.slide, { width }]}>
                <View style={styles.iconStage}>
                 
                  <View style={styles.iconCircle}>
                    <Ionicons name={item.icon} size={44} color="#fff" />
                  </View>
                </View>


                <Text style={styles.slideTitle}>{item.title}</Text>
                <Text style={styles.slideText}>{item.text}</Text>

                <View style={styles.bulletList}>
                  {item.bullets.map((b) => (
                    <View key={b.label} style={styles.bulletRow}>
                      <View style={styles.bulletIconWrap}>
                        <Ionicons name={b.icon} size={16} color={Colors.primary ?? "#22c55e"} />
                      </View>
                      <Text style={styles.bulletText}>{b.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          />

          <View style={styles.footer}>
            <View style={styles.footerRow}>
              {!isFirst && (
                <Pressable onPress={goBack} style={styles.backButton} hitSlop={8}>
                  <Ionicons name="arrow-back" size={20} color={Colors.text} />
                </Pressable>
              )}
              <View style={styles.nextButtonWrap}>
                <Button title={isLast ? "Get Started" : "Next"} onPress={goNext} />
              </View>
            </View>

            {isLast && (
              <Pressable
                onPress={() => router.replace("/login")}
                style={styles.loginLinkWrap}
                hitSlop={8}
              >
                <Text style={styles.loginLinkText}>
                  Already have an account?{" "}
                  <Text style={styles.loginLinkBold}>Log in</Text>
                </Text>
              </Pressable>
            )}
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* Splash overlay */}
      {showSplash && (
        <Animated.View style={[styles.splash, { opacity: splashOpacity }]} pointerEvents="none">
          <Image
            source={require("../assets/minishop-logo.png")}
            style={styles.splashLogo}
            resizeMode="contain"
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background ?? "#fff" },
  flex: { flex: 1 },
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background ?? "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  splashLogo: { width: 160, height: 160 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  dotsRow: { flexDirection: "row", gap: 6 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border ?? "rgba(0,0,0,0.1)",
  },
  dotActive: {
    width: 20,
    backgroundColor: Colors.primary ?? "#22c55e",
  },
  skipText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.muted,
  },
  slide: {
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 8,
  },
  iconStage: {
    width: 130,
    height: 130,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  iconRingOuter: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: Colors.card ?? "#f5f5f7",
  },
 
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: Colors.primary ?? "#22c55e",
    alignItems: "center",
    justifyContent: "center",
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  slideText: {
    fontSize: 14,
    color: Colors.muted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  bulletList: {
    width: "100%",
    gap: 10,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.card ?? "#f5f5f7",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  bulletIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  bulletText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    gap: 12,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.card ?? "#f5f5f7",
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonWrap: {
    flex: 1,
  },
  loginLinkWrap: {
    alignSelf: "center",
  },
  loginLinkText: {
    fontSize: 14,
    color: Colors.muted,
  },
  loginLinkBold: {
    fontWeight: "700",
    color: Colors.primary ?? "#22c55e",
  },
});