import { Image, Text, View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@/types/Product';
import { Card } from './Card';
import { useTheme } from '@/context/ThemeContext';
import { formatPrice } from '@/constants/currency';

export function ProductCard({ 
  product, 
  onEdit, 
  onDelete 
}: { 
  product: Product; 
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const { colors } = useTheme();

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
        {( onEdit || onDelete) && (
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
    marginBottom: 20,
    width: '100%',
  },
  imageContainer: {
    borderRadius: 12,
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
    fontSize: 15,
    fontWeight: '600',
  },
  desc: {
    fontSize: 14,
    lineHeight: 18,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 6,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
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
    paddingVertical: 8,
    borderRadius: 10,
  },
  iconButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#ef4444',
  },
  buttonPressed: {
    opacity: 0.7,
  },
});