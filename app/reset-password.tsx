import { useState } from 'react';
import { Alert, Text, StyleSheet } from 'react-native';
import { Screen } from '@/components/Screen';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { resetPassword } from '@/services/authService';
import { Colors } from '@/constants/colors';
export default function ResetPassword(){ const [email,setEmail]=useState(''); return <Screen><Text style={styles.title}>Reset password</Text><Input placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail}/><Button title="Send Reset Link" onPress={async()=>{ await resetPassword(email); Alert.alert('Sent','Check your email for the reset link.'); }}/></Screen> }
const styles=StyleSheet.create({title:{fontSize:34,fontWeight:'900',color:Colors.text}});
