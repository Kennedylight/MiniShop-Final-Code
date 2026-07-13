import { Image, Text, View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Product } from '@/types/Product';
import { Card } from './Card';
import { useTheme } from '@/context/ThemeContext';
import { formatPrice } from '@/constants/currency';
import { fontFamily } from '@/constants/typography';

export function ProductCard({
  product,
  onEdit,
  onDelete,
  onAdd,
}: {
  product: Product;
  onEdit?: () => void;
  onDelete?: () => void;
  onAdd?: () => void;
}) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Card style={[styles.card, { backgroundColor: 'transparent' }]}>
      {/* Image avec coins arrondis */}
      <View style={styles.imageContainer}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder, { backgroundColor: colors.border || '#e5e7eb' }]}>
            <Ionicons name="image-outline" size={32} color={colors.muted} />
          </View>
        )}
      </View>

      {/* Contenu textuel */}
      <View style={styles.content}>
        <View style={styles.titre}>
          <View >
   {/* Ligne principale : Titre */}
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {product.name}
        </Text>

        
         {/* Description secondaire */}
        {product.description && (
          <Text style={[styles.desc, { color: colors.muted || '#717171' }]} numberOfLines={2}>
            {product.description}
          </Text>
        )}
          </View>
        

        {/* Prix mis en avant */}
        <Text style={[styles.price, { color: colors.text }]}>
          {formatPrice(product.price, product.currency)}
        </Text>

        </View>
       

       

        

        {/* Ligne d'actions */}
        {(onEdit || onDelete) && (
          <View style={styles.actionsRow}>
            <View style={styles.iconGroup}>
              {onEdit && (
                <Pressable
                  onPress={onEdit}
                  style={({ pressed }) => [
                    styles.iconButton,
                    { backgroundColor: colors.card || '#f3f4f6' },
                    pressed && styles.buttonPressed
                  ]}
                >
                  <Ionicons name="create-outline" size={16} color={colors.text || '#374151'} />
                  <Text style={[styles.iconButtonText, { color: colors.text || '#374151' }]}>Edit</Text>
                </Pressable>
              )}

              {onDelete && (
                <Pressable
                  onPress={onDelete}
                  style={({ pressed }) => [
                    styles.iconButton,
                    styles.deleteButton,
                    pressed && styles.buttonPressed
                  ]}
                >
                  <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

        {onAdd && (
          <Pressable
            onPress={onAdd}
            style={({ pressed }) => [
              styles.addButton,
              { backgroundColor: colors.orange },
              pressed && styles.buttonPressed,
            ]}
          >
            <Ionicons name="bag-add-outline" size={16} color="#fff" />
            <Text style={styles.addButtonText}>{t('shop.orderNow')}</Text>
          </Pressable>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 0,
    overflow: 'hidden',
    shadowColor: 'transparent',
    elevation: 0,
    marginBottom: 24,
    width: '100%',
  },
  imageContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titre:{
      flexDirection: 'row',
      justifyContent:'space-between',
  },
  content: {
    paddingVertical: 10,
    paddingHorizontal: 4,
   
    
    gap: 4,
  },
  name: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 15,
  },
  desc: {
    fontFamily: fontFamily.sansRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  price: {
    fontFamily: fontFamily.sansExtraBold,
    fontSize: 16,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 6,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 14,
  },
  addButtonText: {
    color: '#fff',
    fontFamily: fontFamily.sansBold,
    fontSize: 14,
  },
  iconGroup: {
    flexDirection: 'row',
    width:"100%",
    justifyContent:"space-between",
    gap: 6,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width:"50%",
    textAlign:"center",
    justifyContent:"center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
  },
  iconButtonText: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 13,
  },
  deleteButton: {
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  deleteButtonText: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 13,
    color: '#ef4444',
  },
  buttonPressed: {
    opacity: 0.7,
  },
});