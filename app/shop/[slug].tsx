import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Text, StyleSheet } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { findShopBySlug } from '@/services/orderService';
import { Product } from '@/types/Product';
import { Owner } from '@/types/Owner';
import { Screen } from '@/components/Screen';
import { ProductCard } from '@/components/ProductCard';
import { Colors } from '@/constants/colors';
export default function PublicShop(){ const { slug }=useLocalSearchParams<{slug:string}>(); const [owner,setOwner]=useState<Owner|null>(null); const [products,setProducts]=useState<Product[]>([]); useEffect(()=>{ (async()=>{ if(!slug)return; const shop:any=await findShopBySlug(slug); setOwner(shop as Owner); if(shop){ const q=query(collection(db,'products'),where('ownerId','==',shop.ownerId),where('isAvailable','==',true)); const snap=await getDocs(q); setProducts(snap.docs.map(d=>({productId:d.id,...d.data()} as Product))); } })(); },[slug]); const add=(p:Product)=>{ router.push({pathname:'/shop/checkout', params:{ownerId:owner?.ownerId, shopName:owner?.shopName, item:JSON.stringify({productId:p.productId,name:p.name,price:p.price,quantity:1,imageUrl:p.imageUrl})}}); }; if(!owner)return <Screen><Text>Store not found.</Text></Screen>; if(owner.subscriptionStatus!=='active')return <Screen><Text style={styles.title}>Store unavailable</Text><Text>This store is temporarily unavailable. Please contact the business owner.</Text></Screen>; return <Screen><Text style={styles.title}>{owner.shopName}</Text><Text style={styles.text}>{owner.businessDescription || 'Browse products and place your order.'}</Text><Text style={styles.notice}>Payment will be handled directly with the business owner outside MiniShop.</Text>{products.map(p=><ProductCard key={p.productId} product={p} onAdd={()=>add(p)}/>)}</Screen> }
const styles=StyleSheet.create({title:{fontSize:34,fontWeight:'900',color:Colors.text},text:{color:Colors.muted,fontSize:16},notice:{backgroundColor:'#FEF3C7',padding:12,borderRadius:12,color:'#92400E',fontWeight:'700'}});
