import { Tabs, router, usePathname } from "expo-router";
import { Pressable, View, Alert, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { auth } from "@/services/firebase";
import { Colors } from "@/constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function HeaderRight() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const isOnProfile = pathname === "/dashboard/profile";

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
          borderColor: Colors.primary ?? "#22c55e",
        }}
      >
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: isOnProfile
              ? Colors.primary ?? "#22c55e"
              : Colors.card ?? "#e5e7eb",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="person"
            size={16}
            color={isOnProfile ? "#fff" : Colors.text}
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
              backgroundColor: Colors.primary ?? "#22c55e",
              borderWidth: 2,
              borderColor: Colors.background ?? "#fff",
            }}
          />
        )}
      </Pressable>

      <Pressable onPress={handleLogout} hitSlop={10} style={{ padding: 4 }}>
        <Ionicons name="log-out-outline" size={22} color={Colors.text} />
      </Pressable>
    </View>
  );
}

export default function DashboardLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
      <Tabs
      initialRouteName="products"
      screenOptions={{
        headerShown: true,
        title: t("dashboard.miniShop"),
        headerRight: () => <HeaderRight />,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: Colors.background ?? "#fff" },
        headerTitleStyle: { fontWeight: "800", color: Colors.text },
        tabBarActiveTintColor: Colors.primary ?? "#22c55e",
        tabBarInactiveTintColor: Colors.muted,
        tabBarStyle: {
          backgroundColor: Colors.background ?? "#fff",
          borderTopColor: Colors.border ?? "rgba(0,0,0,0.06)",
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
          title: t("dashboard.products"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t("dashboard.orders"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="share"
        options={{
          title: t("dashboard.share"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="share-social-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="billing"
        options={{
          title: t("dashboard.billing"),
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
    </Tabs>
  );
}