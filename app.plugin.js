const { withAndroidManifest, withAppBuildGradle } = require('@expo/config-plugins');

const withGoogleMapsApiKey = (config) => {
  // Configuration AndroidManifest
  config = withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    const { manifest } = androidManifest;

    // S'assurer que l'espace de noms tools est présent
    if (!manifest.$) {
      manifest.$ = {};
    }
    if (!manifest.$['xmlns:tools']) {
      manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    if (!manifest.application) {
      manifest.application = [{}];
    }

    const application = manifest.application[0];
    
    if (!application['meta-data']) {
      application['meta-data'] = [];
    }

    // Vérifier si la clé API existe déjà
    const existingApiKey = application['meta-data'].find(
      (item) => item.$ && item.$['android:name'] === 'com.google.android.geo.API_KEY'
    );

    const apiKey = config.android?.config?.googleMaps?.apiKey || 'AIzaSyAtNqQvTH1JLaH1-OKqCpzgzd-yZdv_o4o';

    console.log('🗺️ [Plugin] Configuration de la clé API Google Maps:', apiKey);

    if (existingApiKey) {
      // Mettre à jour la clé existante
      existingApiKey.$['android:value'] = apiKey;
      console.log('🗺️ [Plugin] Clé API mise à jour dans AndroidManifest');
    } else {
      // Ajouter la nouvelle clé
      application['meta-data'].push({
        $: {
          'android:name': 'com.google.android.geo.API_KEY',
          'android:value': apiKey,
        },
      });
      console.log('🗺️ [Plugin] Clé API ajoutée dans AndroidManifest');
    }

    // Résoudre le conflit avec react-native-firebase_messaging pour default_notification_color
    const existingFirebaseColor = application['meta-data'].find(
      (item) => item.$ && item.$['android:name'] === 'com.google.firebase.messaging.default_notification_color'
    );

    if (existingFirebaseColor) {
      // Ajouter l'attribut tools:replace pour résoudre le conflit
      existingFirebaseColor.$['tools:replace'] = 'android:resource';
      console.log('🔥 [Plugin] Attribut tools:replace ajouté pour Firebase notification color');
    } else {
      // Si la meta-data n'existe pas encore, l'ajouter avec tools:replace
      // (elle sera probablement ajoutée par expo-notifications ou @react-native-firebase/app)
      // Mais on l'ajoute quand même pour être sûr
      application['meta-data'].push({
        $: {
          'android:name': 'com.google.firebase.messaging.default_notification_color',
          'android:resource': '@color/notification_icon_color',
          'tools:replace': 'android:resource',
        },
      });
      console.log('🔥 [Plugin] Meta-data Firebase notification color ajoutée avec tools:replace');
    }

    return config;
  });

  return config;
};

module.exports = withGoogleMapsApiKey;

