import { Image, Text, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Colors } from '@/constants/colors';

export default function Welcome() {
  return (
    <Screen style={styles.screen}>
      <View style={styles.heroCard}>
        <Image source={require('../assets/minishop-logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.kicker}>iOS & Android store platform</Text>
        <Text style={styles.title}>Your Mini Store. Big Possibilities.</Text>
        <Text style={styles.subtitle}>Create your store, upload products, share your link, receive orders, and manage everything from your phone.</Text>
        <View style={styles.actions}>
          <Button title="Get Started" onPress={() => router.push('/signup')} />
          <Button title="Login" onPress={() => router.push('/login')} variant="outline" />
        </View>
        <Text style={styles.trust}>Secure. Simple. Reliable.</Text>
      </View>

      <View style={styles.grid}>
        <Card style={styles.miniCard}>
          <Text style={styles.icon}>🛒</Text>
          <Text style={styles.cardTitle}>Create Store</Text>
          <Text style={styles.text}>Add shop info, logo, products, and prices.</Text>
        </Card>
        <Card style={styles.miniCard}>
          <Text style={styles.icon}>🔗</Text>
          <Text style={styles.cardTitle}>Share Link</Text>
          <Text style={styles.text}>Send your store link on WhatsApp and social media.</Text>
        </Card>
        <Card style={styles.miniCard}>
          <Text style={styles.icon}>📦</Text>
          <Text style={styles.cardTitle}>Receive Orders</Text>
          <Text style={styles.text}>Customers order without creating accounts.</Text>
        </Card>
      </View>

      <Card>
        <Text style={styles.cardTitle}>Plans by photo limit</Text>
        <Text style={styles.text}>Starter: 5 photos • Business: 10 photos • Premium: 15 photos maximum.</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: Colors.primaryDark },
  heroCard: { backgroundColor: Colors.navy, borderRadius: 34, padding: 24, marginVertical: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', gap: 14 },
  logo: { width: 210, height: 120, alignSelf: 'center' },
  kicker: { color: Colors.accent, fontWeight: '900', textAlign: 'center', letterSpacing: 0.4 },
  title: { color: '#fff', fontSize: 39, lineHeight: 44, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: '#D9E6FF', fontSize: 16, lineHeight: 24, textAlign: 'center' },
  actions: { gap: 12, marginTop: 8 },
  trust: { color: '#BFD4FF', textAlign: 'center', marginTop: 6 },
  grid: { gap: 12 },
  miniCard: { alignItems: 'flex-start' },
  icon: { fontSize: 28 },
  cardTitle: { fontSize: 18, fontWeight: '900', color: Colors.text },
  text: { color: Colors.muted, marginTop: 6, lineHeight: 22 }
});
