import { Alert, Linking, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { createCustomerPortal } from '@/services/subscriptionService';
import { Colors } from '@/constants/colors';
export default function Billing(){ const portal=async()=>{try{const url=await createCustomerPortal(); await Linking.openURL(url);}catch(e:any){Alert.alert('Billing',e.message)}}; return <Screen><Text style={styles.title}>Billing</Text><Text style={styles.text}>Your subscription controls your product photo limit and dashboard access.</Text><Button title="Choose / Upgrade Plan" onPress={()=>router.push('/pricing')}/><Button title="Manage Billing" onPress={portal} variant="outline"/></Screen> }
const styles=StyleSheet.create({title:{fontSize:32,fontWeight:'900',color:Colors.text},text:{color:Colors.muted,fontSize:16,lineHeight:24}});
