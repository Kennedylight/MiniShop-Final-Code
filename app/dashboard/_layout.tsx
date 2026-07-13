import { Tabs, router, usePathname } from "expo-router";
import { Pressable, View, Alert, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { auth } from "@/services/firebase";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import { fontFamily } from "@/constants/typography";

function HeaderRight() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const pathname = usePathname();
  const isOnProfile = pathname === "/dashboard/profile";
  const isOnDashboard = pathname === "/dashboard/dashboard";

  const handleLogout = () => {
    Alert.alert(t("dashboard.logOut"), t("dashboard.logOutConfirm"), [
      { text: t("dashboard.cancel"), style: "cancel" },
      {
        text: t("dashboard.logOutAction"),
        style: "destructive",
        onPress: () => signOut(auth),
      },
    ]);
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginRight: 12 }}>
      {/* Icône dashboard */}
      <Pressable
        onPress={() => router.push("/dashboard/dashboard")}
        hitSlop={10}
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: isOnDashboard ? colors.orange : colors.card,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: isOnDashboard ? 0 : 1,
            borderColor: colors.border,
          }}
        >
          <Ionicons
            name="speedometer-outline"
            size={16}
            color={isOnDashboard ? "#fff" : colors.muted}
          />
        </View>
      </Pressable>

      {/* Icône profil */}
      <Pressable
        onPress={() => router.push("/dashboard/profile")}
        hitSlop={10}
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: isOnProfile ? colors.orange : colors.card,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: isOnProfile ? 0 : 1,
            borderColor: colors.border,
          }}
        >
          <Ionicons
            name="settings-outline"
            size={16}
            color={isOnProfile ? "#fff" : colors.muted}
          />
        </View>
      </Pressable>

      <Pressable onPress={handleLogout} hitSlop={10} style={{ padding: 4 }}>
        <Ionicons name="log-out-outline" size={22} color={colors.muted} />
      </Pressable>
    </View>
  );
}

export default function DashboardLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const tabIcon = (outline: keyof typeof Ionicons.glyphMap, filled: keyof typeof Ionicons.glyphMap) =>
    function TabIcon({ color, size, focused }: { color: string; size: number; focused: boolean }) {
      return <Ionicons name={focused ? filled : outline} size={size} color={color} />;
    };

  return (
    <Tabs
      initialRouteName="products"
      screenOptions={{
        headerShown: true,
        title: t("dashboard.miniShop"),
        headerTitleAlign: "left",
        headerRight: () => <HeaderRight />,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { fontFamily: fontFamily.displaySemiBold, fontSize: 20, color: colors.text },
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          shadowColor: colors.shadow,
          shadowOpacity: 0.08,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: -4 },
          elevation: 12,
          height: Platform.OS === "ios" ? 62 + insets.bottom : 66,
          paddingBottom: Platform.OS === "ios" ? insets.bottom : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: { fontFamily: fontFamily.sansSemiBold, fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="products"
        options={{
          title: t("products.title"),
          tabBarIcon: tabIcon("cube-outline", "cube"),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t("orders.title"),
          tabBarIcon: tabIcon("receipt-outline", "receipt"),
        }}
      />
      <Tabs.Screen
        name="share"
        options={{
          title: t("share.title"),
          tabBarIcon: tabIcon("share-social-outline", "share-social"),
        }}
      />
      <Tabs.Screen
        name="billing"
        options={{
          title: t("billing.title"),
          tabBarIcon: tabIcon("card-outline", "card"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          title: t("dashboard.profile"),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          href: null,
          title: t("dashboard.greetingEyebrow"),
        }}
      />
    </Tabs>
  );
}
