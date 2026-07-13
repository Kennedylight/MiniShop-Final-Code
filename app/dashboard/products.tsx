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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { auth } from "@/services/firebase";
import { getCurrentOwner } from "@/services/authService";
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
import { fontFamily } from "@/constants/typography";
import { getErrorMessage } from "@/lib/errors";

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
  const [ownerCurrency, setOwnerCurrency] = useState<string | undefined>(undefined);
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [plan, setPlan] = useState<PlanId>("starter");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

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
    setOwnerCurrency(owner?.currency);
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

  const takePhoto = async () => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert("Permission refusée", "Autorisez l'accès à la caméra.");
        return;
      }
    }
    setCameraVisible(true);
  };

  const capturePhoto = async () => {
    if (!cameraRef.current || capturing) return;
    try {
      setCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.75 });
      if (photo?.uri) {
        const manipulated = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 1080 } }], // redimensionne, garde le ratio
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
        );
        setImage(manipulated.uri);
      }
      setCameraVisible(false);
    } finally {
      setCapturing(false);
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
    if (!ownerCurrency) {
      Alert.alert(
        t("products.currencyRequiredTitle"),
        t("products.currencyRequiredMessage"),
        [
          { text: t("products.cancel"), style: "cancel" },
          { text: t("products.setCurrency"), onPress: () => router.push("/dashboard/profile") },
        ],
      );
      return;
    }
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
      clearForm();
      setFormVisible(false);
      await load();
    } catch (e) {
      Alert.alert(t("products.productError"), getErrorMessage(e));
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
            Alert.alert(t("products.productError"), getErrorMessage(e)),
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
      <Screen topInset={false}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Currency required banner */}
          {!initialLoading && !ownerCurrency && (
            <Pressable
              onPress={() => router.push("/dashboard/profile")}
              style={[styles.currencyBanner, { backgroundColor: colors.card || "#f5f5f7", borderColor: colors.orange }]}
            >
              <Ionicons name="alert-circle-outline" size={20} color={colors.orange} />
              <Text style={[styles.currencyBannerText, { color: colors.text }]}>
                {t("products.currencyRequiredMessage")}
              </Text>
            </Pressable>
          )}

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
          { backgroundColor: colors.orange, shadowColor: colors.orange },
          !ownerCurrency && { opacity: 0.5 },
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
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalSheet,
              { backgroundColor: colors.background || "#fff" },
              { transform: [{ translateY: sheetTranslateY }] },
            ]}
          >
            <View {...panResponder.panHandlers}>
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
                  onPress={closeModal}
                  hitSlop={10}
                  style={[
                    styles.modalClose,
                    { backgroundColor: colors.card || "#f5f5f7" },
                  ]}
                >
                  <Ionicons name="close" size={22} color={colors.text} />
                </Pressable>
              </View>
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
                <Input
                  label={t("products.productName")}
                  placeholder={t("products.productName")}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.fieldWrap}>
                <Input
                  label={t("products.price")}
                  placeholder={`${t("products.price")} (${currency})`}
                  keyboardType="decimal-pad"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>

              <View style={styles.fieldWrap}>
                <Input
                  label={t("products.description")}
                  placeholder={t("products.description")}
                  value={desc}
                  onChangeText={setDesc}
                  multiline
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
          </Animated.View>
        </View>
      </Modal>

      {/* Camera modal */}
      <Modal
        visible={cameraVisible}
        animationType="slide"
        onRequestClose={() => setCameraVisible(false)}
      >
        <View style={styles.cameraRoot}>
          {cameraVisible && (
            <CameraView ref={cameraRef} style={styles.cameraView} facing="back" />
          )}

          <Pressable
            onPress={() => setCameraVisible(false)}
            hitSlop={10}
            style={[styles.cameraClose, { backgroundColor: "rgba(0,0,0,0.5)" }]}
          >
            <Ionicons name="close" size={22} color="#fff" />
          </Pressable>

          <View style={styles.cameraControls}>
            <Pressable
              onPress={capturePhoto}
              disabled={capturing}
              style={[styles.captureButton, capturing && { opacity: 0.6 }]}
            >
              <View style={styles.captureButtonInner} />
            </Pressable>
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
  currencyBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: RADIUS,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  currencyBannerText: {
    flex: 1,
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 13,
  },
  usageCard: {
    borderRadius: RADIUS,
    padding: 18,
    marginBottom: 20,
  },
  usageTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  usageText: {
    fontFamily: fontFamily.sansBold,
    fontSize: 13,
  },
  usagePlan: {
    fontFamily: fontFamily.sansExtraBold,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  usageTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  usageFill: {
    height: "100%",
    borderRadius: 4,
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
    fontFamily: fontFamily.sansBold,
    fontSize: 16,
    marginBottom: 4,
  },
  emptyText: {
    fontFamily: fontFamily.sansRegular,
    fontSize: 13,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.36,
    shadowRadius: 18,
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
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 20,
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
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 13,
    marginBottom: 8,
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
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 11,
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
  cameraRoot: {
    flex: 1,
    backgroundColor: "#000",
  },
  cameraView: {
    flex: 1,
  },
  cameraClose: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraControls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  captureButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 4,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  captureButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#fff",
  },
});
