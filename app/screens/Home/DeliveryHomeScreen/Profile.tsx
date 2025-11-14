import { logout } from "@/app/store/authSlice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  Image,
  Switch,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store/store";

type MenuItem = {
  label: string;
  icon: string;
  path: string;
  badge?: string;
  color?: string;
};

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.authReducer.user);

  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Voulez-vous vraiment vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Déconnexion",
          style: "destructive",
          onPress: () => {
            dispatch(logout());
            router.replace("/screens/Auth/LoginScreen");
          },
        },
      ]
    );
  };

  const accountMenu: MenuItem[] = [
    { 
      label: "Mon profil", 
      icon: "person-outline", 
      path: "../../../profile/details",
      color: "#4CAF50"
    },
    { 
      label: "Mes documents", 
      icon: "document-text-outline", 
      path: "../../../profile/documents",
      color: "#2196F3"
    },
    { 
      label: "Mode de paiement", 
      icon: "card-outline", 
      path: "../../../profile/paiement",
      color: "#FF9800"
    },
  ];

  const activityMenu: MenuItem[] = [
    { 
      label: "Historique des livraisons", 
      icon: "time-outline", 
      path: "../../../profile/history",
      color: "#9C27B0"
    },
    { 
      label: "Mes gains", 
      icon: "wallet-outline", 
      path: "../../../profile/gains",
      badge: "Nouveau",
      color: "#4CAF50"
    },
    { 
      label: "Statistiques", 
      icon: "stats-chart-outline", 
      path: "../../../profile/Stataistiques",
      color: "#FF5722"
    },
  ];

  const supportMenu: MenuItem[] = [
    { 
      label: "Nous contacter", 
      icon: "chatbubbles-outline", 
      path: "../../../profile/contacter",
      color: "#2196F3"
    },
    { 
      label: "Conditions d'utilisation", 
      icon: "document-outline", 
      path: "../../../profile/Conditions",
      color: "#9E9E9E"
    },
    { 
      label: "À propos", 
      icon: "information-circle-outline", 
      path: "../../../profile/propos",
      color: "#9E9E9E"
    },
  ];

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.label}
      style={styles.item}
      onPress={() => router.push(item.path as any)}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: item.color + "15" }]}>
          <Ionicons name={item.icon as any} size={22} color={item.color || "#D51B20"} />
        </View>
        <View>
          <Text style={styles.itemText}>{item.label}</Text>
        </View>
      </View>
      <View style={styles.itemRight}>
        {item.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color="#aaa" />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header avec profil */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <Image
            source={{ 
              uri: user?.profileImage || "https://randomuser.me/api/portraits/men/1.jpg" 
            }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>
              {user?.firstName || "Livreur"} {user?.lastName || ""}
            </Text>
            <Text style={styles.userEmail}>
              {user?.phone || user?.email || "ID: " + user?.id?.substring(0, 8)}
            </Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFB400" />
              <Text style={styles.rating}>4.8</Text>
              <Text style={styles.ratingCount}>(125 avis)</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>45</Text>
            <Text style={styles.statLabel}>Courses</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>98%</Text>
            <Text style={styles.statLabel}>Taux réussite</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: "#4CAF50" }]}>45,200</Text>
            <Text style={styles.statLabel}>FCFA gagnés</Text>
          </View>
        </View>
      </View>

      {/* Toggle Notifications */}
      <View style={styles.toggleSection}>
        <View style={styles.toggleItem}>
          <View style={styles.itemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: "#FF980015" }]}>
              <Ionicons name="notifications" size={22} color="#FF9800" />
            </View>
            <Text style={styles.itemText}>Notifications</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: "#ddd", true: "#FF9800" }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Menu Compte */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="person" size={16} /> Mon compte
        </Text>
        {accountMenu.map(renderMenuItem)}
      </View>

      {/* Menu Activité */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="bicycle" size={16} /> Mon activité
        </Text>
        {activityMenu.map(renderMenuItem)}
      </View>

      {/* Menu Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="help-circle" size={16} /> Support
        </Text>
        {supportMenu.map(renderMenuItem)}
      </View>

      {/* Bouton déconnexion */}
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Ionicons name="log-out-outline" size={22} color="#D51B20" />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingBottom: 20,
    marginBottom: 10,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#D51B20",
  },
  profileInfo: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: "#999",
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#D51B20",
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
  },
  toggleSection: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
  },
  toggleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  section: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#999",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  itemLeft: { 
    flexDirection: "row", 
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemText: { 
    fontSize: 15, 
    color: "#333", 
    fontWeight: "500",
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    backgroundColor: "#D51B20",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "bold",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 10,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#D51B20",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#D51B20",
    marginLeft: 10,
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    color: "#999",
    marginTop: 20,
  },
});