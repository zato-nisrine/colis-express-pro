// app/screens/Home/DeliveryHomeScreen/CurrentCourses.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { API_URL } from "@/app/api";

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
  userId: string | null;
  deliverId: string | null;
  pickupLatitude: string;
  pickupLongitude: string;
  deliveryLatitude: string;
  deliveryLongitude: string;
  type: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  expeditions: Expedition[];
};

const ENDPOINT_MY_COURSES = `${API_URL}courses/my-courses`; // Endpoint pour récupérer les courses du livreur

// Calcul de distance
const calculateDistance = (lat1: string, lon1: string, lat2: string, lon2: string): string => {
  const R = 6371;
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

// Formatage date relatif
const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days === 1) return "Hier";
  return `Il y a ${days}j`;
};

// Status badge
const getStatusInfo = (status: string) => {
  switch (status) {
    case "accepted":
      return { 
        label: "Acceptée", 
        color: "#66BB6A", 
        bgColor: "#E8F5E9",
        icon: "checkmark-circle" 
      };
    case "in_progress":
      return { 
        label: "En cours", 
        color: "#42A5F5", 
        bgColor: "#E3F2FD",
        icon: "bicycle" 
      };
    case "picked_up":
      return { 
        label: "Récupérée", 
        color: "#FFA726", 
        bgColor: "#FFF3E0",
        icon: "cube" 
      };
    case "completed":
      return { 
        label: "Terminée", 
        color: "#66BB6A", 
        bgColor: "#E8F5E9",
        icon: "checkmark-done-circle" 
      };
    case "cancelled":
      return { 
        label: "Annulée", 
        color: "#EF5350", 
        bgColor: "#FFEBEE",
        icon: "close-circle" 
      };
    default:
      return { 
        label: status, 
        color: "#999", 
        bgColor: "#f5f5f5",
        icon: "help-circle" 
      };
  }
};

export default function CurrentCourses() {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.authReducer.token);
  const user = useSelector((state: RootState) => state.authReducer.user);

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("active");

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(ENDPOINT_MY_COURSES, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Erreur lors de la récupération des courses");
      }

      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("fetchMyCourses error:", err);
      setError(err.message || "Impossible de charger les courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyCourses();
    setRefreshing(false);
  };

  // Filtrage des courses
  const getFilteredCourses = () => {
    switch (filter) {
      case "active":
        return courses.filter(c => 
          ["accepted", "in_progress", "picked_up"].includes(c.status)
        );
      case "completed":
        return courses.filter(c => 
          ["completed", "cancelled"].includes(c.status)
        );
      default:
        return courses;
    }
  };

  const filteredCourses = getFilteredCourses();

  // Stats
  const stats = {
    total: courses.length,
    active: courses.filter(c => ["accepted", "in_progress", "picked_up"].includes(c.status)).length,
    completed: courses.filter(c => c.status === "completed").length,
    earnings: courses
      .filter(c => c.status === "completed")
      .reduce((sum, c) => sum + c.totalPrice, 0),
  };

  const renderCourse = ({ item }: { item: Course }) => {
    const statusInfo = getStatusInfo(item.status);
    const distance = calculateDistance(
      item.pickupLatitude,
      item.pickupLongitude,
      item.deliveryLatitude,
      item.deliveryLongitude
    );
    const expedition = item.expeditions[0];

    return (
      <TouchableOpacity
        style={styles.courseCard}
        onPress={() => router.push(`/screens/Home/DeliveryHomeScreen/CourseDetail?id=${item.id}`)}
        activeOpacity={0.7}
      >
        {/* Header avec status et date */}
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
            <Ionicons name={statusInfo.icon as any} size={14} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
          <Text style={styles.dateText}>{formatRelativeDate(item.updatedAt)}</Text>
        </View>

        {/* Corps */}
        <View style={styles.cardBody}>
          {/* Image */}
          {expedition?.image && !expedition.image.startsWith("file://") && (
            <Image source={{ uri: expedition.image }} style={styles.courseImage} />
          )}

          <View style={{ flex: 1 }}>
            {/* Nom du colis */}
            <Text style={styles.courseName} numberOfLines={1}>
              {expedition?.name || "Colis"}
            </Text>

            {/* Type de véhicule */}
            <View style={styles.vehicleBadge}>
              <Ionicons name="bicycle" size={12} color="#666" />
              <Text style={styles.vehicleText}>{item.type}</Text>
            </View>

            {/* Trajet simplifié */}
            <View style={styles.routeMini}>
              <View style={styles.miniDot} />
              <View style={styles.miniLine} />
              <View style={[styles.miniDot, { backgroundColor: "#D51B20" }]} />
              <Text style={styles.distanceText}>{distance}</Text>
            </View>

            {/* Prix et bouton */}
            <View style={styles.cardFooter}>
              <Text style={styles.priceText}>{item.totalPrice.toFixed(0)} FCFA</Text>
              
              <TouchableOpacity style={styles.viewBtn}>
                <Text style={styles.viewBtnText}>Voir</Text>
                <Ionicons name="chevron-forward" size={16} color="#D51B20" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name={filter === "completed" ? "checkmark-done-circle-outline" : "bicycle-outline"} 
        size={80} 
        color="#ddd" 
      />
      <Text style={styles.emptyTitle}>
        {filter === "completed" ? "Aucune course terminée" : "Aucune course active"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {filter === "completed" 
          ? "Les courses terminées apparaîtront ici"
          : "Acceptez des courses pour les voir ici"
        }
      </Text>
      <TouchableOpacity onPress={fetchMyCourses} style={styles.refreshBtn}>
        <Ionicons name="refresh" size={18} color="#fff" />
        <Text style={styles.refreshBtnText}>Rafraîchir</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes courses</Text>
        <TouchableOpacity onPress={fetchMyCourses} style={styles.refreshIconBtn}>
          <Ionicons name="refresh" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.active}</Text>
          <Text style={styles.statLabel}>En cours</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Terminées</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: "#F57C00" }]}>
            {stats.earnings.toFixed(0)}
          </Text>
          <Text style={styles.statLabel}>FCFA gagnés</Text>
        </View>
      </View>

      {/* Filtres */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === "active" && styles.filterBtnActive]}
          onPress={() => setFilter("active")}
        >
          <Text style={[styles.filterText, filter === "active" && styles.filterTextActive]}>
            Actives ({stats.active})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filter === "completed" && styles.filterBtnActive]}
          onPress={() => setFilter("completed")}
        >
          <Text style={[styles.filterText, filter === "completed" && styles.filterTextActive]}>
            Terminées ({stats.completed})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filter === "all" && styles.filterBtnActive]}
          onPress={() => setFilter("all")}
        >
          <Text style={[styles.filterText, filter === "all" && styles.filterTextActive]}>
            Toutes ({stats.total})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Liste */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#D51B20" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#D51B20" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchMyCourses} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : filteredCourses.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredCourses}
          keyExtractor={(item) => item.id}
          renderItem={renderCourse}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#D51B20"]} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  refreshIconBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  // Stats
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 1,
  },
  statBox: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 28, fontWeight: "bold", color: "#D51B20" },
  statLabel: { fontSize: 12, color: "#666", marginTop: 4 },
  statDivider: { width: 1, backgroundColor: "#e0e0e0" },

  // Filtres
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    marginTop: 1,
    gap: 10,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  filterBtnActive: {
    backgroundColor: "#D51B20",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  filterTextActive: {
    color: "#fff",
  },

  // Liste
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  // Card
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
    paddingVertical: 12,
    backgroundColor: "#fafafa",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 5,
  },
  dateText: {
    fontSize: 11,
    color: "#999",
  },

  cardBody: {
    flexDirection: "row",
    padding: 15,
  },
  courseImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#f0f0f0",
  },
  courseName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  vehicleBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  vehicleText: {
    fontSize: 11,
    color: "#666",
    marginLeft: 4,
    fontWeight: "500",
  },
  routeMini: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  miniDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
  },
  miniLine: {
    width: 20,
    height: 2,
    backgroundColor: "#ddd",
    marginHorizontal: 4,
  },
  distanceText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
    fontWeight: "500",
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F57C00",
  },
  viewBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  viewBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#D51B20",
    marginRight: 4,
  },

  // États
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 15,
    color: "#666",
  },
  errorText: {
    marginTop: 15,
    color: "#D51B20",
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 20,
    backgroundColor: "#D51B20",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  refreshBtn: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D51B20",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  refreshBtnText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
});