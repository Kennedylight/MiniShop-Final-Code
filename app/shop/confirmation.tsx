import { useLocalSearchParams, router } from 'expo-router';
import { Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/colors';
export default function Confirmation(){ const { t } = useTranslation(); const {orderId,shopName}=useLocalSearchParams<{orderId:string;shopName:string}>(); return <Screen><Text style={styles.title}>{t('shop.orderSubmitted')}</Text><Text style={styles.text}>{t('shop.orderThanks', { shopName })}</Text><Text style={styles.order}>Order #{orderId?.slice(0,8)}</Text><Text style={styles.text}>{t('shop.orderContact')}</Text><Button title={t('shop.trackOrder')} variant="outline" onPress={()=>router.push(`/shop/track/${orderId}`)}/><Button title={t('shop.done')} onPress={()=>router.replace('/')}/></Screen> }
const styles=StyleSheet.create({title:{fontSize:34,fontWeight:'900',color:Colors.text},order:{fontSize:20,fontWeight:'900',color:Colors.primary},text:{fontSize:16,color:Colors.muted,lineHeight:24}});