import { useEffect, useState } from 'react';
import { Alert, Text, StyleSheet } from 'react-native';
import { auth, db } from '@/services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Screen } from '@/components/Screen';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/colors';
export default function Profile(){ const [shopName,setShopName]=useState(''); const [description,setDescription]=useState(''); const [delivery,setDelivery]=useState(''); const [whatsapp,setWhatsapp]=useState(''); useEffect(()=>{ const uid=auth.currentUser?.uid; if(uid) getDoc(doc(db,'owners',uid)).then(s=>{ const d=s.data(); if(d){ setShopName(d.shopName||''); setDescription(d.businessDescription||''); setDelivery(d.deliveryInfo||''); setWhatsapp(d.whatsapp||''); }})},[]); const save=async()=>{ const uid=auth.currentUser?.uid; if(!uid)return; await setDoc(doc(db,'owners',uid),{shopName,businessDescription:description,deliveryInfo:delivery,whatsapp,updatedAt:Date.now()},{merge:true}); Alert.alert('Saved','Shop profile updated.');}; return <Screen><Text style={styles.title}>Shop Profile</Text><Input placeholder="Shop name" value={shopName} onChangeText={setShopName}/><Input placeholder="WhatsApp number" value={whatsapp} onChangeText={setWhatsapp}/><Input placeholder="Business description" value={description} onChangeText={setDescription} multiline/><Input placeholder="Delivery information" value={delivery} onChangeText={setDelivery} multiline/><Button title="Save Profile" onPress={save}/></Screen> }
const styles=StyleSheet.create({title:{fontSize:32,fontWeight:'900',color:Colors.text}});
