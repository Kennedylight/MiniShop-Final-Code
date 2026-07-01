import { Alert, Linking, Text, StyleSheet } from 'react-native';
import { Screen } from '@/components/Screen';
import { PricingCard } from '@/components/PricingCard';
import { createCheckoutSession } from '@/services/subscriptionService';
import { PlanId } from '@/constants/plans';
import { Colors } from '@/constants/colors';
export default function Pricing(){ const choose=async(plan:PlanId)=>{ try{ const url=await createCheckoutSession(plan); await Linking.openURL(url); }catch(e:any){ Alert.alert('Billing error',e.message);} }; return <Screen><Text style={styles.title}>Choose your plan</Text><Text style={styles.subtitle}>Choose based on how many product photos you want. 15 photos is the maximum.</Text><PricingCard planId="starter" onChoose={()=>choose('starter')}/><PricingCard planId="business" onChoose={()=>choose('business')}/><PricingCard planId="premium" onChoose={()=>choose('premium')}/></Screen> }
const styles=StyleSheet.create({title:{fontSize:34,fontWeight:'900',color:Colors.text},subtitle:{color:Colors.muted,fontSize:16}});
