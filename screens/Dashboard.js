import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const InfoCard = ({ label, value }) => (
  <View style={styles.infoCard}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const Dashboard = ({ route, navigation }) => {
  const passedUser = route.params?.user || null;
  const { refresh, timestamp } = route.params || {};

  const [userData, setUserData] = useState(passedUser);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState(userData?.balance || 0);

  // Memoize fetchUserData using useCallback to avoid recreating the function on every render
  const fetchUserData = useCallback(async () => {
    try {
      const storedData = await AsyncStorage.getItem(userData?.email || '');
      if (storedData) {
        const parsedUser = JSON.parse(storedData);
        setUserData(parsedUser);
        setBalance(parsedUser.balance); // Update the balance
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, [userData?.email]);

  useEffect(() => {
    if (route.params?.user) {
      setUserData(route.params.user); // Update user data when receiving new data
    }
  }, [route.params?.user]);

  // Refresh function
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserData(); // Fetch latest user data
    setRefreshing(false);
  }, [fetchUserData]);

  // Update user data on refresh or when passedUser is updated
  useEffect(() => {
    if (refresh && route.params?.user) {
      setUserData(route.params.user);
    }
  }, [refresh, timestamp]);

  // Listen for updates when returning from the DepositMoney screen
  useEffect(() => {
    if (route.params?.updated) {
      fetchUserData(); // Fetch updated user data after deposit
    }
  }, [route.params?.updated, fetchUserData]);

  if (!userData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: User data not found!</Text>
      </View>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Not provided';
    return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user'); // Remove user data from AsyncStorage
      navigation.replace('SignIn'); // Redirect to the SignIn screen
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.nameText}>
                {userData.name || userData.email}
              </Text>
            </View>
            {/* Logout Button */}
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(userData.balance)}
          </Text>
          <TouchableOpacity
            style={styles.depositButton}
            onPress={() =>
              navigation.navigate('DepositMoney', { user: userData })
            }>
            <Text style={styles.depositButtonText}>Deposit Money</Text>
          </TouchableOpacity>
        </View>

        {/* User Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoGrid}>
            <InfoCard
              label="Full Name"
              value={userData.name || 'Not provided'}
            />
            <InfoCard label="Email" value={userData.email} />
            <InfoCard label="Phone" value={formatPhoneNumber(userData.phone)} />
            <InfoCard label="PAN" value={userData.pan || 'Not provided'} />
            <InfoCard
              label="Aadhar"
              value={
                userData.aadhar
                  ? `XXXX-XXXX-${userData.aadhar.slice(-4)}`
                  : 'Not provided'
              }
            />
            <InfoCard
              label="Account Created"
              value={new Date().toLocaleDateString()}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
 header: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  balanceCard: {
    margin: 16,
    padding: 24,
    backgroundColor: '#6366f1',
    borderRadius: 16,
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#c7d2fe',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginVertical: 8,
  },
  depositButton: {
    marginTop: 16,
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    borderRadius: 8,
  },
  depositButtonText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#94a3b8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  headerContent: {
    flexDirection: 'row',      // Align items horizontally
    justifyContent: 'space-between', // Spread the text and button across the available space
    alignItems: 'center',      // Center vertically
  },
  welcomeText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#ef4444',
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
export default Dashboard;
