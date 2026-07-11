import { Tabs, router, usePathname } from "expo-router";
import { Pressable, View, Alert, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { auth } from "@/services/firebase";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";

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
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginRight: 12 }}>
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
          borderWidth: isOnDashboard ? 2 : 0,
          borderColor: colors.primary,
        }}
      >
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: isOnDashboard
              ? colors.orange
              : colors.card || "#e5e7eb",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="speedometer-outline"
            size={16}
            color={isOnDashboard ? "#fff" : colors.text}
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
          borderWidth: isOnProfile ? 2 : 0,
          borderColor: colors.primary,
        }}
      >
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: isOnProfile
              ? colors.orange
              : colors.card || "#e5e7eb",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="settings-outline"
            size={16}
            color={isOnProfile ? "#fff" : colors.text}
          />
        </View>

        {isOnProfile && (
          <View
            style={{
              position: "absolute",
              bottom: -1,
              right: -1,
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: colors.primary,
              borderWidth: 2,
              borderColor: colors.background,
            }}
          />
        )}
      </Pressable>

      <Pressable onPress={handleLogout} hitSlop={10} style={{ padding: 4 }}>
        <Ionicons name="log-out-outline" size={22} color={colors.text} />
      </Pressable>
    </View>
  );
}

export default function DashboardLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
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
        headerTitleStyle: { fontWeight: "800", color: colors.text },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border || '#e5e7eb',
          height: Platform.OS === "ios" ? 60 + insets.bottom : 60,
          paddingBottom: Platform.OS === "ios" ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="products"
        options={{
          title: t("products.title"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t("orders.title"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="share"
        options={{
          title: t("share.title"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="share-social-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="billing"
        options={{
          title: t("billing.title"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="card-outline" size={size} color={color} />
          ),
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