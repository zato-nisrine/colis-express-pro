// app/screens/Home/RestaurantHomeScreen/RestaurantHomeScreen.tsx
import { API_URL } from "@/app/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";

const { width } = Dimensions.get("window");

type Menu = {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
};

type OrderMenu = {
  id: string;
  menuId: string;
  quantity: number;
  price: number;
  unit: string;
  courseId: string;
  menu: Menu;
  createdAt: string;
  updatedAt: string;
};

type OrderUser = {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string | null;
};

type OrderRestaurant = {
  id: string;
  userId: string;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  phone: string;
};

type Order = {
  id: string;
  status: string;
  userId: string | null;
  deliverId: string | null;
  restaurantId: string;
  pickupLatitude: string;
  pickupLongitude: string;
  deliveryLatitude: string;
  deliveryLongitude: string;
  type: string;
  orderMenus: OrderMenu[];
  totalPrice: number;
  deliveryFee?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user?: OrderUser;
  restaurant?: OrderRestaurant;
};

const ENDPOINT_RESTAURANT_ORDERS = `${API_URL}restaurant/orders`;
const ENDPOINT_ACCEPT_ORDER = (id: string) => `${API_URL}restaurant/orders/${id}/accept`;
const ENDPOINT_REJECT_ORDER = (id: string) => `${API_URL}restaurant/orders/${id}/reject`;
const ENDPOINT_READY_ORDER = (id: string) => `${API_URL}restaurant/orders/${id}/ready`;
const ENDPOINT_RESTAURANT_STATUS = `${API_URL}restaurant/status`;

// Fonction pour formater la date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  return `Il y a ${days}j`;
};

// Status info
const getStatusInfo = (status: string) => {
  switch (status) {
    case "pending":
      return { label: "Nouvelle", color: "#FF9800", icon: "time-outline", bgColor: "#FFF3E0" };
    case "accepted":
      return { label: "Acceptée", color: "#2196F3", icon: "checkmark-circle", bgColor: "#E3F2FD" };
    case "preparing":
      return { label: "En préparation", color: "#9C27B0", icon: "restaurant", bgColor: "#F3E5F5" };
    case "ready":
      return { label: "Prête", color: "#4CAF50", icon: "checkmark-done", bgColor: "#E8F5E9" };
    case "picked_up":
      return { label: "Récupérée", color: "#00BCD4", icon: "bicycle", bgColor: "#E0F7FA" };
    case "delivered":
      return { label: "Livrée", color: "#4CAF50", icon: "checkmark-circle", bgColor: "#E8F5E9" };
    case "rejected":
      return { label: "Refusée", color: "#F44336", icon: "close-circle", bgColor: "#FFEBEE" };
    default:
      return { label: status, color: "#999", icon: "help-circle", bgColor: "#F5F5F5" };
  }
};

export default function RestaurantHomeScreen() {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.authReducer.token);
  const user = useSelector((state: RootState) => state.authReducer.user);
  console.log("token:", token);

  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "active">("pending");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(ENDPOINT_RESTAURANT_ORDERS, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Erreur serveur lors de la récupération des commandes");
      }

      const data = await res.json();
      const ordersData = Array.isArray(data) ? data : [];
      setOrders(ordersData);
    } catch (err: any) {
      console.error("fetchOrders error:", err);
      setFetchError(err.message || "Impossible de charger les commandes");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const toggleRestaurantStatus = async () => {
    const newStatus = !isOpen;
    setIsOpen(newStatus);

    try {
      const res = await fetch(ENDPOINT_RESTAURANT_STATUS, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ isOpen: newStatus }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Erreur lors du changement de statut");
      }
    } catch (err: any) {
      console.error("toggleRestaurantStatus error:", err);
      Alert.alert("Erreur", err.message || "Impossible de changer le statut");
      setIsOpen(!newStatus);
    }
  };

  const acceptOrder = async (orderId: string) => {
    try {
      const res = await fetch(ENDPOINT_ACCEPT_ORDER(orderId), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Erreur lors de l'acceptation");
      }

      Alert.alert("Succès", "Commande acceptée. Commencez la préparation !");
      await fetchOrders();
    } catch (err: any) {
      console.error("acceptOrder error:", err);
      Alert.alert("Erreur", err.message || "Impossible d'accepter la commande");
    }
  };

  const rejectOrder = async (orderId: string) => {
    Alert.alert(
      "Refuser la commande",
      "Voulez-vous vraiment refuser cette commande ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Refuser",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(ENDPOINT_REJECT_ORDER(orderId), {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: token ? `Bearer ${token}` : "",
                },
              });

              if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || "Erreur lors du refus");
              }

              Alert.alert("Commande refusée", "Le client a été notifié");
              await fetchOrders();
            } catch (err: any) {
              console.error("rejectOrder error:", err);
              Alert.alert("Erreur", err.message || "Impossible de refuser la commande");
            }
          },
        },
      ]
    );
  };

  const markAsReady = async (orderId: string) => {
    try {
      const res = await fetch(ENDPOINT_READY_ORDER(orderId), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Erreur lors de la mise à jour");
      }

      Alert.alert("Succès", "Commande prête pour la livraison !");
      await fetchOrders();
    } catch (err: any) {
      console.error("markAsReady error:", err);
      Alert.alert("Erreur", err.message || "Impossible de marquer comme prête");
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "pending") return order.status === "pending";
    if (filter === "active")
      return ["accepted", "preparing", "ready", "picked_up"].includes(order.status);
    return true;
  });

  const renderOrder = ({ item }: { item: Order }) => {
    const statusInfo = getStatusInfo(item.status);

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => router.push(`/screens/Home/RestaurantHomeScreen/OrderDetails?id=${item.id}`)}
        activeOpacity={0.7}
      >
        {/* En-tête */}
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
            <Ionicons name={statusInfo.icon as any} size={14} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
          <Text style={styles.timeText}>{formatDate(item.createdAt)}</Text>
        </View>

        {/* Infos commande */}
        <View style={styles.cardBody}>
          <View style={styles.orderInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={16} color="#666" />
              <Text style={styles.infoText}>
                {item.user
                  ? `${item.user.firstName} ${item.user.lastName}`
                  : "Client"}{" "}
                {item.user?.phone && `• ${item.user.phone}`}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.infoText} numberOfLines={1}>
                {item.restaurant?.address || 
                 (item.deliveryLatitude && item.deliveryLongitude
                   ? `Lat: ${item.deliveryLatitude}, Lng: ${item.deliveryLongitude}`
                   : "Adresse de livraison")}
              </Text>
            </View>

            {item.notes && (
              <View style={styles.infoRow}>
                <Ionicons name="chatbox-outline" size={16} color="#666" />
                <Text style={styles.infoText} numberOfLines={2}>
                  {item.notes}
                </Text>
              </View>
            )}
          </View>

          {/* Articles */}
          <View style={styles.itemsContainer}>
            <Text style={styles.itemsTitle}>Articles ({item.orderMenus?.length || 0})</Text>
            {item.orderMenus?.slice(0, 3).map((orderMenu) => (
              <View key={orderMenu.id} style={styles.itemRow}>
                <Text style={styles.itemQuantity}>{orderMenu.quantity}x</Text>
                <Text style={styles.itemName}>{orderMenu.menu?.name || "Article"}</Text>
                <Text style={styles.itemPrice}>{orderMenu.price.toFixed(0)} FCFA</Text>
              </View>
            ))}
            {(item.orderMenus?.length || 0) > 3 && (
              <Text style={styles.moreItems}>+ {(item.orderMenus?.length || 0) - 3} autre(s)</Text>
            )}
          </View>

          {/* Total */}
          <View style={styles.totalContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Sous-total</Text>
              <Text style={styles.totalValue}>{item.totalPrice.toFixed(0)} FCFA</Text>
            </View>
            {item.deliveryFee !== undefined && item.deliveryFee > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Livraison</Text>
                <Text style={styles.totalValue}>{item.deliveryFee.toFixed(0)} FCFA</Text>
              </View>
            )}
            <View style={[styles.totalRow, styles.totalRowFinal]}>
              <Text style={styles.totalLabelFinal}>Total</Text>
              <Text style={styles.totalValueFinal}>
                {(item.totalPrice + (item.deliveryFee || 0)).toFixed(0)} FCFA
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        {item.status === "pending" && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={(e) => {
                e.stopPropagation();
                rejectOrder(item.id);
              }}
            >
              <Ionicons name="close-circle" size={20} color="#F44336" />
              <Text style={styles.rejectBtnText}>Refuser</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.acceptBtn]}
              onPress={(e) => {
                e.stopPropagation();
                acceptOrder(item.id);
              }}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.acceptBtnText}>Accepter</Text>
            </TouchableOpacity>
          </View>
        )}

        {(item.status === "accepted" || item.status === "preparing") && (
          <TouchableOpacity
            style={styles.readyBtn}
            onPress={(e) => {
              e.stopPropagation();
              markAsReady(item.id);
            }}
          >
            <Ionicons name="checkmark-done-circle" size={20} color="#fff" />
            <Text style={styles.readyBtnText}>Marquer comme prête</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const activeCount = orders.filter((o) =>
    ["accepted", "preparing", "ready", "picked_up"].includes(o.status)
  ).length;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={{
              uri: user?.profileImage || "https://randomuser.me/api/portraits/lego/1.jpg",
            }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.userName}>{user?.restaurantName || "Restaurant"}</Text>
            <Text style={styles.small}>
              {user?.phone ?? user?.email ?? "ID: " + user?.id?.substring(0, 8)}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={toggleRestaurantStatus}>
          <View style={[styles.statusBtn, isOpen && styles.statusBtnOpen]}>
            <View style={[styles.statusDot, isOpen && styles.statusDotOpen]} />
            <Text style={styles.statusText}>{isOpen ? "Ouvert" : "Fermé"}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* STATS BAR */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Nouvelles</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{activeCount}</Text>
          <Text style={styles.statLabel}>En cours</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{orders.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* FILTERS */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === "pending" && styles.filterBtnActive]}
          onPress={() => setFilter("pending")}
        >
          <Text style={[styles.filterText, filter === "pending" && styles.filterTextActive]}>
            Nouvelles ({pendingCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filter === "active" && styles.filterBtnActive]}
          onPress={() => setFilter("active")}
        >
          <Text style={[styles.filterText, filter === "active" && styles.filterTextActive]}>
            En cours ({activeCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filter === "all" && styles.filterBtnActive]}
          onPress={() => setFilter("all")}
        >
          <Text style={[styles.filterText, filter === "all" && styles.filterTextActive]}>
            Toutes ({orders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#D51B20" />
          <Text style={styles.loadingText}>Chargement des commandes...</Text>
        </View>
      ) : fetchError ? (
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={48} color="#D51B20" />
          <Text style={styles.errorText}>{fetchError}</Text>
          <TouchableOpacity onPress={fetchOrders} style={styles.reloadBtn}>
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.reloadText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : filteredOrders.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons name="restaurant-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Aucune commande</Text>
          <Text style={styles.emptySubtext}>
            {filter === "pending"
              ? "Les nouvelles commandes apparaîtront ici"
              : "Aucune commande en cours"}
          </Text>
          <TouchableOpacity onPress={fetchOrders} style={styles.reloadBtn}>
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.reloadText}>Rafraîchir</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(i) => i.id}
          renderItem={renderOrder}
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
  statusBtn: {
    backgroundColor: "#F44336",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  statusBtnOpen: { backgroundColor: "#4CAF50" },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginRight: 6,
  },
  statusDotOpen: { backgroundColor: "#fff" },
  statusText: { color: "#fff", fontWeight: "700", fontSize: 13 },

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

  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
    backgroundColor: "#fff",
    marginTop: 1,
    marginBottom: 10,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  filterBtnActive: { backgroundColor: "#D51B20" },
  filterText: { fontSize: 13, fontWeight: "600", color: "#666" },
  filterTextActive: { color: "#fff" },

  listContainer: { paddingHorizontal: 20, paddingBottom: 20 },

  orderCard: {
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
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeText: { fontSize: 12, color: "#999" },

  cardBody: { padding: 15 },
  orderInfo: { marginBottom: 15 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: { fontSize: 14, color: "#666", marginLeft: 8, flex: 1 },

  itemsContainer: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  itemsTitle: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  itemQuantity: {
    fontSize: 13,
    fontWeight: "600",
    color: "#D51B20",
    width: 30,
  },
  itemName: { flex: 1, fontSize: 13, color: "#333" },
  itemPrice: { fontSize: 13, fontWeight: "600", color: "#666" },
  moreItems: { fontSize: 12, color: "#999", fontStyle: "italic", marginTop: 4 },

  totalContainer: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  totalLabel: { fontSize: 13, color: "#666" },
  totalValue: { fontSize: 13, color: "#666" },
  totalRowFinal: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  totalLabelFinal: { fontSize: 16, fontWeight: "bold", color: "#333" },
  totalValueFinal: { fontSize: 16, fontWeight: "bold", color: "#4CAF50" },

  actionsContainer: {
    flexDirection: "row",
    padding: 15,
    paddingTop: 0,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  rejectBtn: {
    backgroundColor: "#FFEBEE",
  },
  rejectBtnText: {
    color: "#F44336",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 6,
  },
  acceptBtn: {
    backgroundColor: "#D51B20",
  },
  acceptBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 6,
  },

  readyBtn: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 8,
  },
  readyBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 6,
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