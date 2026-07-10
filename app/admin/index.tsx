import { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '@/services/firebase';
import { Owner } from '@/types/Owner';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { useTheme } from '@/context/ThemeContext';

export default function Admin() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [owners, setOwners] = useState<Owner[]>([]);
  const { colors } = useTheme();

  useEffect(() => {
    return onAuthStateChanged(auth, async user => {
      if (!user) { setAuthorized(false); return; }
      const result = await user.getIdTokenResult();
      if (result.claims.admin === true) {
        setAuthorized(true);
        const snap = await getDocs(collection(db, 'owners'));
        setOwners(snap.docs.map(d => d.data() as Owner));
      } else {
        setAuthorized(false);
      }
    });
  }, []);

  if (authorized === null) return <Screen><Text style={[styles.text, { color: colors.text }]}>Checking access…</Text></Screen>;
  if (!authorized) return <Screen><Text style={[styles.text, { color: colors.text }]}>Unauthorized. Admin access required.</Text></Screen>;

  return (
    <Screen>
      <Text style={[styles.title, { color: colors.text }]}>Super Admin</Text>
      {owners.map(o => (
        <Card key={o.ownerId}>
          <Text style={[styles.name, { color: colors.text }]}>{o.shopName}</Text>
          <Text style={[styles.text, { color: colors.text }]}>{o.email}</Text>
          <Text style={[styles.text, { color: colors.text }]}>{o.subscriptionStatus} • {o.plan || 'no plan'}</Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 34, fontWeight: '900' },
  text: {  fontWeight: '700' },
  name: { fontWeight: '900', fontSize: 18 },
});
