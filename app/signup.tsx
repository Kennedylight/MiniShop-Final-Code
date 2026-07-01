import { useState } from 'react';
import { Alert, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { registerOwner } from '@/services/authService';
import { Colors } from '@/constants/colors';

export default function Signup() {
  const [fullName,setFullName]=useState(''); const [shopName,setShopName]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [whatsapp,setWhatsapp]=useState(''); const [loading,setLoading]=useState(false);
  const submit=async()=>{ try{ setLoading(true); await registerOwner({fullName,shopName,email,password,whatsapp}); router.replace('/pricing'); } catch(e:any){ Alert.alert('Signup failed', e.message); } finally{ setLoading(false); } };
  return <Screen><Text style={styles.title}>Create your MiniShop</Text><Input placeholder="Owner full name" value={fullName} onChangeText={setFullName}/><Input placeholder="Shop name" value={shopName} onChangeText={setShopName}/><Input placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail}/><Input placeholder="WhatsApp number" value={whatsapp} onChangeText={setWhatsapp}/><Input placeholder="Password" secureTextEntry value={password} onChangeText={setPassword}/><Button title="Create Account" onPress={submit} loading={loading}/></Screen>;
}
const styles = StyleSheet.create({ title:{ fontSize:34, fontWeight:'900', color:Colors.text } });
