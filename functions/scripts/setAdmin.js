/**
 * Pose (ou retire) le custom claim `admin` sur un utilisateur Firebase existant.
 *
 * Les custom claims ne sont pas modifiables depuis le client : ce script doit
 * tourner côté serveur avec une clé service account.
 *
 * Prérequis :
 *   - L'utilisateur doit déjà s'être inscrit dans l'app (email/password).
 *   - Exporter le chemin de la clé service account :
 *       export GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json   (bash)
 *       $env:GOOGLE_APPLICATION_CREDENTIALS=".\serviceAccount.json"    (PowerShell)
 *
 * Usage :
 *   node scripts/setAdmin.js <email>            # accorde l'accès admin
 *   node scripts/setAdmin.js <email> --revoke   # retire l'accès admin
 *
 * Après exécution, l'utilisateur doit se reconnecter (ou rafraîchir son token)
 * pour que le claim soit pris en compte.
 */
const admin = require('firebase-admin');

async function main() {
  const email = process.argv[2];
  const revoke = process.argv.includes('--revoke');

  if (!email) {
    console.error('Usage: node scripts/setAdmin.js <email> [--revoke]');
    process.exit(1);
  }

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('GOOGLE_APPLICATION_CREDENTIALS non défini. Pointe-le vers ta clé service account.');
    process.exit(1);
  }

  admin.initializeApp({ credential: admin.credential.applicationDefault() });

  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, { admin: !revoke });

  console.log(
    `${revoke ? 'Accès admin retiré' : 'Accès admin accordé'} pour ${email} (uid: ${user.uid}).`
  );
  console.log("L'utilisateur doit se reconnecter pour appliquer le changement.");
}

main().catch(err => {
  console.error('Échec:', err.message);
  process.exit(1);
});
