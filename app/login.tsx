import { useState } from 'react';
import { Alert, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { loginOwner } from '@/services/authService';
import { Colors } from '@/constants/colors';

export default function Login() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [loading, setLoading] = useState(false);
  const submit = async () => { try { setLoading(true); await loginOwner(email, password); router.replace('/dashboard'); } catch(e:any){ Alert.alert('Login failed', e.message); } finally { setLoading(false); } };
  return <Screen><Text style={styles.title}>Welcome back</Text><Input placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail}/><Input placeholder="Password" secureTextEntry value={password} onChangeText={setPassword}/><Button title="Login" onPress={submit} loading={loading}/><Button title="Forgot password?" onPress={() => router.push('/reset-password')} variant="outline"/></Screen>;
}
const styles = StyleSheet.create({ title: { fontSize: 34, fontWeight: '900', color: Colors.text } });
