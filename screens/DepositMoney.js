import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DepositMoney = ({ route, navigation }) => {
  const { user } = route.params;
  const [depositAmount, setDepositAmount] = useState('');
  const [depositHistory, setDepositHistory] = useState([]);

  // Function to load the deposit history from AsyncStorage
  const loadDepositHistory = async () => {
    try {
      const history = await AsyncStorage.getItem(
        `${user.email}_deposit_history`
      );
      if (history) {
        setDepositHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading deposit history:', error);
    }
  };

  useEffect(() => {
    loadDepositHistory(); // Load deposit history when the component mounts
  }, []);

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount to deposit.');
      return;
    }

    try {
      const newBalance = (user.balance || 0) + amount;
      const updatedUser = { ...user, balance: newBalance };

      // Update deposit history
      const timestamp = new Date().toLocaleString();
      const newDepositEntry = { amount, timestamp };

      const updatedHistory = [...depositHistory, newDepositEntry];
      await AsyncStorage.setItem(user.email, JSON.stringify(updatedUser));
      await AsyncStorage.setItem(
        `${user.email}_deposit_history`,
        JSON.stringify(updatedHistory)
      );

      // Update state and navigate
      setDepositHistory(updatedHistory);
      navigation.navigate('Dashboard', {
        user: updatedUser,
        updated: true,
      });
    } catch (error) {
      console.error('Error updating balance:', error);
      Alert.alert('Error', 'Could not update balance. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Deposit Funds</Text>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>
            {new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
            }).format(user.balance)}
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Amount to Deposit</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="numeric"
              value={depositAmount}
              onChangeText={setDepositAmount}
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.depositButton}
          onPress={handleDeposit}
          activeOpacity={0.8}>
          <Text style={styles.depositButtonText}>Confirm Deposit</Text>
        </TouchableOpacity>

        {/* Deposit History Section */}
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Deposit History</Text>
          <FlatList
            data={depositHistory.slice().reverse()} // Reverse the order of the history
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.historyItem}>
                <Text style={styles.historyAmount}>
                  ₹{item.amount.toFixed(2)}
                </Text>
                <Text style={styles.historyTimestamp}>{item.timestamp}</Text>
              </View>
            )}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 32,
  },
  balanceCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#0f172a',
  },
  inputContainer: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  currencySymbol: {
    fontSize: 24,
    color: '#64748b',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 24,
    color: '#0f172a',
    height: '100%',
  },
  depositButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  depositButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  historyContainer: {
    marginTop: 32,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  historyItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyAmount: {
    fontSize: 16,
    color: '#1e293b',
  },
  historyTimestamp: {
    fontSize: 14,
    color: '#64748b',
  },
});

export default DepositMoney;
