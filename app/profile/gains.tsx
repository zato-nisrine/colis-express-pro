// import React, { useState } from "react";
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { LineChart } from "react-native-chart-kit";
// import { Dimensions } from "react-native";

// const { width } = Dimensions.get("window");

// export function EarningsScreen() {
//   const router = useRouter();
//   const [period, setPeriod] = useState<"week" | "month" | "year">("week");

//   const earnings = {
//     today: 8500,
//     week: 45200,
//     month: 185000,
//     pending: 12000,
//   };

//   const chartData = {
//     labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
//     datasets: [{ data: [3200, 5400, 4800, 7200, 6500, 8900, 9200] }],
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
//           <Ionicons name="arrow-back" size={24} color="#333" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Mes gains</Text>
//         <View style={{ width: 40 }} />
//       </View>

//       <ScrollView showsVerticalScrollIndicator={false}>
//         <View style={styles.earningsCard}>
//           <Text style={styles.earningsLabel}>Gains de la semaine</Text>
//           <Text style={styles.earningsAmount}>{earnings.week.toLocaleString()} FCFA</Text>
//           <View style={styles.earningsRow}>
//             <View style={styles.earningsItem}>
//               <Text style={styles.earningsItemLabel}>Aujourd'hui</Text>
//               <Text style={styles.earningsItemValue}>{earnings.today.toLocaleString()}</Text>
//             </View>
//             <View style={styles.earningsItem}>
//               <Text style={styles.earningsItemLabel}>En attente</Text>
//               <Text style={[styles.earningsItemValue, { color: "#FF9800" }]}>
//                 {earnings.pending.toLocaleString()}
//               </Text>
//             </View>
//           </View>
//         </View>

//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Évolution</Text>
//           <View style={styles.periodButtons}>
//             {(["week", "month", "year"] as const).map((p) => (
//               <TouchableOpacity
//                 key={p}
//                 style={[styles.periodBtn, period === p && styles.periodBtnActive]}
//                 onPress={() => setPeriod(p)}
//               >
//                 <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
//                   {p === "week" ? "Semaine" : p === "month" ? "Mois" : "Année"}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//           <LineChart
//             data={chartData}
//             width={width - 60}
//             height={200}
//             chartConfig={{
//               backgroundColor: "#fff",
//               backgroundGradientFrom: "#fff",
//               backgroundGradientTo: "#fff",
//               decimalPlaces: 0,
//               color: (opacity = 1) => `rgba(213, 27, 32, ${opacity})`,
//               style: { borderRadius: 16 },
//             }}
//             bezier
//             style={styles.chart}
//           />
//         </View>

//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Transactions récentes</Text>
//           {[
//             { date: "04 Nov 2025", amount: 8500, status: "paid" },
//             { date: "03 Nov 2025", amount: 12000, status: "pending" },
//             { date: "02 Nov 2025", amount: 15800, status: "paid" },
//           ].map((t, i) => (
//             <View key={i} style={styles.transactionCard}>
//               <View>
//                 <Text style={styles.transactionDate}>{t.date}</Text>
//                 <Text style={styles.transactionAmount}>{t.amount.toLocaleString()} FCFA</Text>
//               </View>
//               <View
//                 style={[
//                   styles.transactionStatus,
//                   t.status === "paid" ? styles.statusPaid : styles.statusPending,
//                 ]}
//               >
//                 <Text
//                   style={[
//                     styles.transactionStatusText,
//                     t.status === "paid" ? styles.statusTextPaid : styles.statusTextPending,
//                   ]}
//                 >
//                   {t.status === "paid" ? "Payé" : "En attente"}
//                 </Text>
//               </View>
//             </View>
//           ))}
//         </View>
//       </ScrollView>
//     </View>
//   );
// }
