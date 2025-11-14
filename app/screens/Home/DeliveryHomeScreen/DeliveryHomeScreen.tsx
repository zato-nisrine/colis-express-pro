// app/screens/Home/DeliveryHomeScreen/DeliveryHomeScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { useRouter } from "expo-router";
import { API_URL } from "../../../api";

const { width } = Dimensions.get("window");

type Expedition = {
  id: string;
  name: string;
  description: string;
  image: string;
  vehicleType: string;
};

type Course = {
  id: string;
  status: string;
  pickupLatitude: string;
  pickupLongitude: string;
  deliveryLatitude: string;
  deliveryLongitude: string;
  type: string;
  totalPrice: number;
  createdAt: string;
  expeditions: Expedition[];
};

const ENDPOINT_AVAILABLE = `${API_URL}courses/available`;
const ENDPOINT_ACCEPT = (id: string) => `${API_URL}courses/accept/${id}`;
const ENDPOINT_STATUS = `${API_URL}deliver/status`;

// Fonction pour calculer la distance approximative entre deux points
const calculateDistance = (lat1: string, lon1: string, lat2: string, lon2: string): string => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (parseFloat(lat2) - parseFloat(lat1)) * Math.PI / 180;
  const dLon = (parseFloat(lon2) - parseFloat(lon1)) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(parseFloat(lat1) * Math.PI / 180) * Math.cos(parseFloat(lat2) * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance < 1 ? `${(distance * 1000).toFixed(0)} m` : `${distance.toFixed(1)} km`;
};

// Fonction pour formater la date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  return `Il y a ${days}j`;
};

export default function DeliveryHomeScreen() {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.authReducer.token);
  const user = useSelector((state: RootState) => state.authReducer.user);

  const [available, setAvailable] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatusAndOrders();
  }, []);

  const fetchStatusAndOrders = async () => {
    await Promise.all([fetchAvailability(), fetchAvailableOrders()]);
  };

  const fetchAvailability = async () => {
    return;
  };

  const fetchAvailableOrders = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(ENDPOINT_AVAILABLE, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Erreur serveur lors de la récupération des courses");
      }

      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("fetchAvailableOrders error:", err);
      setFetchError(err.message || "Impossible de charger les courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAvailableOrders();
    setRefreshing(false);
  };

  const toggleAvailability = async () => {
    const newStatus = !available;
    setAvailable(newStatus);

    try {
      const res = await fetch(ENDPOINT_STATUS, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ available: newStatus }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Erreur lors du changement de statut");
      }

      if (newStatus) await fetchAvailableOrders();
    } catch (err: any) {
      console.error("toggleAvailability error:", err);
      Alert.alert("Erreur", err.message || "Impossible de changer le statut");
      setAvailable(!newStatus);
    }
  };

  const acceptOrder = async (orderId: string) => {
    const original = [...courses];
    setCourses((prev) => prev.filter((c) => c.id !== orderId));

    try {
      const res = await fetch(ENDPOINT_ACCEPT(orderId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Erreur lors de l'acceptation de la course");
      }

      Alert.alert("Succès", "Course acceptée — va dans 'CurrentCourses' pour la suivre");
    } catch (err: any) {
      console.error("acceptOrder error:", err);
      Alert.alert("Erreur", err.message || "Impossible d'accepter la course");
      setCourses(original);
    }
  };

  const renderCourse = ({ item }: { item: Course }) => {
    const distance = calculateDistance(
      item.pickupLatitude,
      item.pickupLongitude,
      item.deliveryLatitude,
      item.deliveryLongitude
    );
    const expedition = item.expeditions[0];

    return (
      <TouchableOpacity  style={styles.courseCard} onPress={() => router.push(`/screens/Home/DeliveryHomeScreen/CourseDetail?id=${item.id}`)}>
        {/* En-tête avec badge et date */}
        <View style={styles.cardHeader}>
          <View style={styles.badgeContainer}>
            <Ionicons name="bicycle" size={14} color="#fff" />
            <Text style={styles.badgeText}>{item.type}</Text>
          </View>
          <Text style={styles.timeText}>{formatDate(item.createdAt)}</Text>
        </View>

        {/* Corps de la carte */}
        <View style={styles.cardBody}>
          {/* Image du colis si disponible */}
          {expedition?.image && !expedition.image.startsWith('file://') && (
            <Image source={{ uri: expedition.image }} style={styles.packageImage} />
          )}
          
          <View style={{ flex: 1 }}>
            {/* Nom du colis */}
            <Text style={styles.packageName} numberOfLines={1}>
              {expedition?.name || "Colis"}
            </Text>
            
            {/* Description */}
            {expedition?.description && (
              <Text style={styles.packageDesc} numberOfLines={2}>
                {expedition.description}
              </Text>
            )}

            {/* Trajet */}
            <View style={styles.routeContainer}>
              <View style={styles.routeItem}>
                <View style={styles.dotPickup} />
                <Text style={styles.routeLabel} numberOfLines={1}>
                  Départ: {item.pickupLatitude.substring(0, 8)}°, {item.pickupLongitude.substring(0, 8)}°
                </Text>
              </View>
              
              <View style={styles.routeLine} />
              
              <View style={styles.routeItem}>
                <View style={styles.dotDelivery} />
                <Text style={styles.routeLabel} numberOfLines={1}>
                  Arrivée: {item.deliveryLatitude.substring(0, 8)}°, {item.deliveryLongitude.substring(0, 8)}°
                </Text>
              </View>
            </View>

            {/* Infos distance et prix */}
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.infoText}>{distance}</Text>
              </View>
              
              <View style={styles.priceTag}>
                <Text style={styles.priceAmount}>{item.totalPrice.toFixed(0)} FCFA</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bouton d'action */}
        <TouchableOpacity
          style={styles.acceptBtn}
          onPress={() =>
            Alert.alert(
              "Confirmer",
              `Accepter cette course de ${distance} pour ${item.totalPrice.toFixed(0)} FCFA ?`,
              [
                { text: "Annuler", style: "cancel" },
                { text: "Accepter", onPress: () => acceptOrder(item.id) },
              ],
              { cancelable: true }
            )
          }
        >
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.acceptText}>Accepter la course</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: user?.profileImage || "https://randomuser.me/api/portraits/men/1.jpg" }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.userName}>{user?.firstName || "Livreur"}</Text>
            <Text style={styles.small}>{user?.phone ?? user?.email ?? "ID: " + user?.id?.substring(0, 8)}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={toggleAvailability}>
          <View style={[styles.availableBtn, available && styles.availableActive]}>
            <View style={[styles.statusDot, available && styles.statusDotActive]} />
            <Text style={styles.availableText}>{available ? "Disponible" : "Indisponible"}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* STATS BAR */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{courses.length}</Text>
          <Text style={styles.statLabel}>Courses dispo</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {courses.reduce((s, c) => s + (c.totalPrice || 0), 0).toFixed(0)}
          </Text>
          <Text style={styles.statLabel}>FCFA potentiel</Text>
        </View>
      </View>

      {/* CONTENT */}
      <Text style={styles.sectionTitle}>
        <Ionicons name="list" size={20} color="#333" /> Courses disponibles
      </Text>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#D51B20" />
          <Text style={styles.loadingText}>Chargement des courses...</Text>
        </View>
      ) : fetchError ? (
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={48} color="#D51B20" />
          <Text style={styles.errorText}>{fetchError}</Text>
          <TouchableOpacity onPress={fetchAvailableOrders} style={styles.reloadBtn}>
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.reloadText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : courses.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons name="bicycle-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Aucune course disponible</Text>
          <Text style={styles.emptySubtext}>
            Les nouvelles courses apparaîtront ici
          </Text>
          <TouchableOpacity onPress={fetchAvailableOrders} style={styles.reloadBtn}>
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.reloadText}>Rafraîchir</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(i) => i.id}
          renderItem={renderCourse}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", paddingTop: 50 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#fff",
  },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 12 },
  userName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  small: { fontSize: 12, color: "#666", marginTop: 2 },
  availableBtn: {
    backgroundColor: "#e0e0e0",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  availableActive: { backgroundColor: "#28a745" },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#999",
    marginRight: 6,
  },
  statusDotActive: { backgroundColor: "#fff" },
  availableText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  
  statsBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 1,
    justifyContent: "space-around",
  },
  statItem: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 24, fontWeight: "bold", color: "#D51B20" },
  statLabel: { fontSize: 12, color: "#666", marginTop: 4 },
  statDivider: { width: 1, backgroundColor: "#e0e0e0" },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
    color: "#333",
  },
  
  listContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  
  courseCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D51B20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600", marginLeft: 4 },
  timeText: { fontSize: 12, color: "#999" },
  
  cardBody: {
    flexDirection: "row",
    padding: 15,
  },
  packageImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#f0f0f0",
  },
  packageName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  packageDesc: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
  },
  
  routeContainer: { marginVertical: 8 },
  routeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  dotPickup: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
    marginRight: 8,
  },
  dotDelivery: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#D51B20",
    marginRight: 8,
  },
  routeLine: {
    width: 2,
    height: 15,
    backgroundColor: "#ddd",
    marginLeft: 4,
    marginVertical: 2,
  },
  routeLabel: {
    fontSize: 11,
    color: "#666",
    flex: 1,
  },
  
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 4,
    fontWeight: "500",
  },
  priceTag: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priceAmount: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#F57C00",
  },
  
  acceptBtn: {
    backgroundColor: "#D51B20",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    margin: 15,
    marginTop: 0,
    borderRadius: 8,
  },
  acceptText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 8,
  },
  
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 15,
    color: "#666",
    fontSize: 14,
  },
  errorText: {
    marginTop: 15,
    color: "#D51B20",
    textAlign: "center",
    fontSize: 14,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  reloadBtn: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D51B20",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  reloadText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
  },
});