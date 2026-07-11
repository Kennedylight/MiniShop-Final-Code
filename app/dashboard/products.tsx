import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Text,
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Modal,
  Image,
  Animated,
  PanResponder,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { auth } from "@/services/firebase";
import { getCurrentOwner, updateOwnerCurrency } from "@/services/authService";
import {
  addProduct,
  deleteProduct,
  listOwnerProducts,
  updateProduct,
  uploadProductImage,
} from "@/services/productService";
import * as ImageManipulator from 'expo-image-manipulator';
import { Product } from "@/types/Product";
import { PlanId, getPhotoLimit } from "@/constants/plans";
import { DEFAULT_CURRENCY } from "@/constants/currency";
import { Screen } from "@/components/Screen";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { ProductCard } from "@/components/ProductCard";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";

function SkeletonCard() {
  const { colors } = useTheme();
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={styles.gridItem}>
      <Animated.View
        style={[
          styles.skeletonImage,
          {
            opacity: pulse,
            backgroundColor: colors.border || "rgba(0,0,0,0.1)",
          },
        ]}
      />
      <Animated.View
        style={[
          styles.skeletonLine,
          styles.skeletonLineWide,
          {
            opacity: pulse,
            backgroundColor: colors.border || "rgba(0,0,0,0.1)",
          },
        ]}
      />
      <Animated.View
        style={[
          styles.skeletonLine,
          styles.skeletonLineNarrow,
          {
            opacity: pulse,
            backgroundColor: colors.border || "rgba(0,0,0,0.1)",
          },
        ]}
      />
      <View style={styles.cardActions}>
        <Animated.View
          style={[
            styles.skeletonButton,
            {
              opacity: pulse,
              backgroundColor: colors.border || "rgba(0,0,0,0.1)",
            },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonButton,
            {
              opacity: pulse,
              backgroundColor: colors.border || "rgba(0,0,0,0.1)",
            },
          ]}
        />
      </View>
    </View>
  );
}

export default function Products() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [plan, setPlan] = useState<PlanId>("starter");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const sheetTranslateY = useRef(new Animated.Value(0)).current;
  const closeModal = () => {
    Animated.timing(sheetTranslateY, {
      toValue: 600,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      sheetTranslateY.setValue(0);
      setFormVisible(false);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 6 && Math.abs(gestureState.dx) < 20;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          sheetTranslateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.8) {
          closeModal();
        } else {
          Animated.spring(sheetTranslateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const uid = auth.currentUser?.uid;

  const load = async () => {
    if (!uid) return;
    const owner = await getCurrentOwner(uid);
    setPlan((owner?.plan as PlanId) || "starter");
    setCurrency(owner?.currency || DEFAULT_CURRENCY);
    setProducts(await listOwnerProducts(uid));
  };

  useEffect(() => {
    (async () => {
      setInitialLoading(true);
      await load();
      setInitialLoading(false);
    })();
  }, []);

  const pick = () => {
    Alert.alert("Ajouter une photo", "Choisissez une option", [
      {
        text: "Prendre une photo",
        onPress: takePhoto,
      },
      {
        text: "Choisir depuis la galerie",
        onPress: pickFromGallery,
      },
      {
        text: "Annuler",
        style: "cancel",
      },
    ]);
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.75,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // const takePhoto = async () => {
  //   const permission = await ImagePicker.requestCameraPermissionsAsync();

  //   if (!permission.granted) {
  //     Alert.alert("Permission refusée", "Autorisez l'accès à la caméra.");
  //     return;
  //   }

  //   const result = await ImagePicker.launchCameraAsync({
  //     mediaTypes: ["images"],
  //     quality: Platform.OS === "android" ? 0.5 : 0.75,
  //     allowsEditing: true,
  //   });

  //   if (!result.canceled) {
  //     setImage(result.assets[0].uri);
  //   }
  // };

const takePhoto = async () => {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert("Permission refusée", "Autorisez l'accès à la caméra.");
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.75,
  });

  if (!result.canceled) {
    const manipulated = await ImageManipulator.manipulateAsync(
      result.assets[0].uri,
      [{ resize: { width: 1080 } }], // redimensionne, garde le ratio
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    setImage(manipulated.uri);
  }
};
  const clearForm = () => {
    setName("");
    setPrice("");
    setDesc("");
    setImage(undefined);
    setEditingId(null);
  };

  const openAddForm = () => {
    clearForm();
    setFormVisible(true);
  };

  const startEdit = (p: Product) => {
    setEditingId(p.productId);
    setName(p.name);
    setPrice(String(p.price));
    if (p.currency) setCurrency(p.currency);
    setDesc(p.description ?? "");
    setImage(p.imageUrl);
    setFormVisible(true);
  };

  const submit = async () => {
    try {
      if (!uid) throw new Error(t("products.loginRequired"));
      setLoading(true);
      let imageUrl = image;
      if (image && !image.startsWith("http")) {
        imageUrl = await uploadProductImage(uid, image);
      }

      if (editingId) {
        await updateProduct(editingId, {
          name,
          price: Number(price),
          currency,
          description: desc,
          imageUrl,
        });
      } else {
        await addProduct(uid, plan, {
          name,
          price: Number(price),
          currency,
          description: desc,
          imageUrl,
          isAvailable: true,
        });
      }
      await updateOwnerCurrency(uid, currency).catch(() => undefined);
      clearForm();
      setFormVisible(false);
      await load();
    } catch (e: any) {
      Alert.alert(t("products.productError"), e.message);
    } finally {
      setLoading(false);
    }
  };

  const remove = (productId: string) => {
    Alert.alert(t("products.deleteTitle"), t("products.deleteMessage"), [
      { text: t("products.cancel"), style: "cancel" },
      {
        text: t("products.delete"),
        style: "destructive",
        onPress: async () => {
          await deleteProduct(productId).catch((e) =>
            Alert.alert(t("products.productError"), e.message),
          );
          await load();
        },
      },
    ]);
  };

  const limit = getPhotoLimit(plan) || 1;
  const usagePct = Math.min(products.length / limit, 1);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Screen>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Usage indicator */}
          <View
            style={[
              styles.usageCard,
              { backgroundColor: colors.card || "#f5f5f7" },
            ]}
          >
            <View style={styles.usageTop}>
              <Text style={[styles.usageText, { color: colors.text }]}>
                {t("products.usageText", { count: products.length, limit })}
              </Text>
              <Text style={[styles.usagePlan, { color: colors.orange }]}>
                {t("products.usagePlan", { plan: plan.toUpperCase() })}
              </Text>
            </View>
            <View
              style={[
                styles.usageTrack,
                { backgroundColor: colors.border || "rgba(0,0,0,0.08)" },
              ]}
            >
              <View
                style={[
                  styles.usageFill,
                  {
                    width: `${usagePct * 100}%`,
                    backgroundColor: colors.orange,
                  },
                ]}
              />
            </View>
          </View>

          {/* Products grid / skeleton / empty state */}
          {initialLoading ? (
            <View style={styles.grid}>
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </View>
          ) : products.length === 0 ? (
            <View style={styles.emptyState}>
              <View
                style={[
                  styles.emptyIconWrap,
                  { backgroundColor: colors.card || "#f5f5f7" },
                ]}
              >
                <Ionicons name="cube-outline" size={32} color={colors.muted} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {t("products.noProducts")}
              </Text>
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                {t("products.noProductsText")}
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {products.map((p) => (
                <View key={p.productId} style={styles.gridItem}>
                  <ProductCard
                    product={p}
                    onEdit={() => startEdit(p)}
                    onDelete={() => remove(p.productId)}
                    // onAdd={() => addToCart(p)} // Optionnel : si tu as une fonction d'ajout
                  />
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </Screen>

      {/* FAB */}
      <Pressable
        onPress={openAddForm}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.orange },
          pressed && { opacity: 0.85 },
        ]}
      >
        <Ionicons name="add" size={26} color="#fff" />
      </Pressable>

      {/* Add/Edit modal */}
      <Modal
        visible={formVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFormVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: colors.background || "#fff" },
            ]}
          >
            <View
              style={[
                styles.modalHandle,
                { backgroundColor: colors.border || "rgba(0,0,0,0.15)" },
              ]}
            />

            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingId
                  ? t("products.editProduct")
                  : t("products.addProduct")}
              </Text>
              <Pressable
                onPress={() => setFormVisible(false)}
                hitSlop={10}
                style={[
                  styles.modalClose,
                  { backgroundColor: colors.card || "#f5f5f7" },
                ]}
              >
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>

            <KeyboardAwareScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bottomOffset={40}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  {t("products.photo")}
                </Text>
                <Pressable onPress={pick} style={styles.photoPicker}>
                  {image ? (
                    <View style={styles.photoPreviewWrap}>
                      <Image
                        source={{ uri: image }}
                        style={[
                          styles.photoPreview,
                          { backgroundColor: colors.card || "#f5f5f7" },
                        ]}
                      />
                      <View
                        style={[
                          styles.photoEditBadge,
                          {
                            backgroundColor: colors.primary,
                            borderColor: colors.background || "#fff",
                          },
                        ]}
                      >
                        <Ionicons name="camera" size={14} color="#fff" />
                      </View>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.photoPlaceholder,
                        {
                          backgroundColor: colors.card || "#f5f5f7",
                          borderColor: colors.border || "rgba(0,0,0,0.08)",
                        },
                      ]}
                    >
                      <Ionicons
                        name="camera-outline"
                        size={26}
                        color={colors.muted}
                      />
                      <Text
                        style={[
                          styles.photoPlaceholderText,
                          { color: colors.muted },
                        ]}
                      >
                        {t("products.addPhoto")}
                      </Text>
                    </View>
                  )}
                </Pressable>
              </View>

              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  {t("products.productName")}
                </Text>
                <Input
                  placeholder={t("products.productName")}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  {t("products.price")}
                </Text>
                <Input
                  placeholder={`${t("products.price")} (${currency})`}
                  keyboardType="decimal-pad"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>

              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  {t("products.description")}
                </Text>
                <Input
                  placeholder={t("products.description")}
                  value={desc}
                  onChangeText={setDesc}
                />
              </View>

              <Button
                title={
                  editingId
                    ? t("products.saveChanges")
                    : t("products.addProductButton")
                }
                onPress={submit}
                loading={loading}
              />
            </KeyboardAwareScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const RADIUS = 18;

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  usageCard: {
    borderRadius: RADIUS,
    padding: 14,
    marginBottom: 20,
  },
  usageTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  usageText: {
    fontSize: 13,
    fontWeight: "700",
  },
  usagePlan: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  usageTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  usageFill: {
    height: "100%",
    borderRadius: 3,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridItem: {
    width: "100%",
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  iconButton: {
    flex: 1,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonDanger: {
    backgroundColor: "rgba(239,68,68,0.1)",
  },
  pressed: {
    opacity: 0.7,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 12,
    maxHeight: "88%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldWrap: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  photoPicker: {
    alignSelf: "flex-start",
  },
  photoPreviewWrap: {
    position: "relative",
  },
  photoPreview: {
    width: 96,
    height: 96,
    borderRadius: 16,
  },
  photoEditBadge: {
    position: "absolute",
    bottom: -6,
    right: -6,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  photoPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  photoPlaceholderText: {
    fontSize: 11,
    fontWeight: "600",
  },
  skeletonImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: RADIUS - 4,
    marginBottom: 10,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    marginBottom: 6,
  },
  skeletonLineWide: {
    width: "80%",
  },
  skeletonLineNarrow: {
    width: "45%",
  },
  skeletonButton: {
    flex: 1,
    height: 34,
    borderRadius: 10,
  },
});
