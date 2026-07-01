import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, StyleSheet } from 'react-native';
import { Screen } from '@/components/Screen';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { createOrder } from '@/services/orderService';
import { OrderItem } from '@/types/Order';
import { Colors } from '@/constants/colors';
export default function Checkout(){ const params=useLocalSearchParams<{ownerId:string;shopName:string;item:string}>(); const item:OrderItem=params.item?JSON.parse(params.item):null; const [customerName,setCustomerName]=useState(''); const [customerPhone,setCustomerPhone]=useState(''); const [customerWhatsapp,setCustomerWhatsapp]=useState(''); const [deliveryAddress,setDeliveryAddress]=useState(''); const [notes,setNotes]=useState(''); const submit=async()=>{ try{ if(!item)throw new Error('Cart empty'); const orderId=await createOrder({ownerId:params.ownerId,shopName:params.shopName,customerName,customerPhone,customerWhatsapp,deliveryAddress,notes,items:[item],estimatedTotal:item.price*item.quantity}); router.replace({pathname:'/shop/confirmation',params:{orderId,shopName:params.shopName}}); }catch(e:any){Alert.alert('Order error',e.message)} }; return <Screen><Text style={styles.title}>Checkout</Text><Text style={styles.notice}>MiniShop does not collect product payments. Payment will be handled directly with the business owner.</Text><Input placeholder="Full name" value={customerName} onChangeText={setCustomerName}/><Input placeholder="Phone number" value={customerPhone} onChangeText={setCustomerPhone}/><Input placeholder="WhatsApp number" value={customerWhatsapp} onChangeText={setCustomerWhatsapp}/><Input placeholder="Delivery location" value={deliveryAddress} onChangeText={setDeliveryAddress}/><Input placeholder="Special notes" value={notes} onChangeText={setNotes}/><Button title="Submit Order" onPress={submit}/></Screen> }
const styles=StyleSheet.create({title:{fontSize:34,fontWeight:'900',color:Colors.text},notice:{backgroundColor:'#ECFDF5',padding:12,borderRadius:12,color:'#065F46',fontWeight:'700'}});
