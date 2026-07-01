import { Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/colors';
export default function Dashboard(){ return <Screen><Text style={styles.title}>Owner Dashboard</Text><Card><Text style={styles.big}>Your MiniShop is ready</Text><Text style={styles.text}>Manage profile, products, orders, link sharing, and billing.</Text></Card><Button title="Shop Profile" onPress={()=>router.push('/dashboard/profile')}/><Button title="Products" onPress={()=>router.push('/dashboard/products')} variant="secondary"/><Button title="Orders" onPress={()=>router.push('/dashboard/orders')}/><Button title="Share Store Link" onPress={()=>router.push('/dashboard/share')} variant="outline"/><Button title="Billing" onPress={()=>router.push('/dashboard/billing')} variant="outline"/></Screen> }
const styles=StyleSheet.create({title:{fontSize:34,fontWeight:'900',color:Colors.text},big:{fontSize:22,fontWeight:'900'},text:{color:Colors.muted,marginTop:6}});
