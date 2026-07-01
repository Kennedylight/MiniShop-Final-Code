import { useLocalSearchParams, router } from 'expo-router';
import { Text, StyleSheet } from 'react-native';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/colors';
export default function Confirmation(){ const {orderId,shopName}=useLocalSearchParams<{orderId:string;shopName:string}>(); return <Screen><Text style={styles.title}>Order submitted</Text><Text style={styles.text}>Thank you. Your order from {shopName} has been submitted successfully.</Text><Text style={styles.order}>Order #{orderId?.slice(0,8)}</Text><Text style={styles.text}>The business owner will contact you for payment and delivery confirmation.</Text><Button title="Done" onPress={()=>router.replace('/')}/></Screen> }
const styles=StyleSheet.create({title:{fontSize:34,fontWeight:'900',color:Colors.text},order:{fontSize:20,fontWeight:'900',color:Colors.primary},text:{fontSize:16,color:Colors.muted,lineHeight:24}});
