import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import FormInput from '../components/FormInput';
import AsyncStorage from '@react-native-async-storage/async-storage';

const schema = yup.object().shape({
  email: yup.string()
    .email('Invalid email format')
    .required('Email is required')
    .matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 'Invalid email format'),
  password: yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

const SignIn = ({ route, navigation }) => {
  const [validationStatus, setValidationStatus] = useState({
    email: '',
    password: ''
  });

  const { control, handleSubmit, formState: { errors }, setError, watch } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange' // Enable real-time validation
  });

  // Watch fields for real-time validation
  const watchedFields = {
    email: watch('email'),
    password: watch('password')
  };

  useEffect(() => {
    // Email validation
    if (watchedFields.email) {
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      if (!watchedFields.email.includes('@')) {
        setValidationStatus(prev => ({
          ...prev,
          email: 'Must include @ symbol'
        }));
      } else if (!emailRegex.test(watchedFields.email)) {
        setValidationStatus(prev => ({
          ...prev,
          email: 'Complete the email address'
        }));
      } else {
        setValidationStatus(prev => ({
          ...prev,
          email: 'Valid email format'
        }));
      }
    } else {
      setValidationStatus(prev => ({
        ...prev,
        email: ''
      }));
    }

    // Password validation
    if (watchedFields.password) {
      let requirements = [];
      if (watchedFields.password.length < 6) {
        requirements.push(`${6 - watchedFields.password.length} more characters needed`);
      }
      if (requirements.length > 0) {
        setValidationStatus(prev => ({
          ...prev,
          password: requirements.join(', ')
        }));
      } else {
        setValidationStatus(prev => ({
          ...prev,
          password: 'Password length OK'
        }));
      }
    } else {
      setValidationStatus(prev => ({
        ...prev,
        password: ''
      }));
    }
  }, [watchedFields]);

  const getValidationColor = (field) => {
    const status = validationStatus[field];
    if (!status) return 'gray';
    if (status.includes('Valid') || status.includes('OK')) return 'green';
    if (status.includes('Complete')) return 'orange';
    return 'red';
  };

  const onSubmit = async (data) => {
    try {
      const userJson = await AsyncStorage.getItem(data.email);
      const user = userJson ? JSON.parse(userJson) : null;

      if (!user || user.password !== data.password) {
        setError('password', {
          type: 'manual',
          message: 'Incorrect email or password'
        });
        return;
      }

      navigation.navigate('Dashboard', { user });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>Welcome Back</Text>
            <Text style={styles.subHeader}>Sign in to continue</Text>
          </View>

          <View style={styles.formContainer}>
            <FormInput
              control={control}
              name="email"
              label="Email"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              containerStyle={styles.inputContainer}
            />
            {validationStatus.email && (
              <Text style={[styles.validation, { color: getValidationColor('email') }]}>
                {validationStatus.email}
              </Text>
            )}

            <FormInput
              control={control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              secureTextEntry={true}
              containerStyle={styles.inputContainer}
            />
            {validationStatus.password && (
              <Text style={[styles.validation, { color: getValidationColor('password') }]}>
                {validationStatus.password}
              </Text>
            )}
            {errors.password?.type === 'manual' && (
              <Text style={styles.error}>{errors.password.message}</Text>
            )}

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit(onSubmit)}
            >
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('CreateAccount')}>
              <Text style={styles.linkText}>
                Don't have an account? <Text style={styles.createNewText}>Create new</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  validation: {
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 4,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#6200ee',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#6200ee',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    color: '#666',
    paddingHorizontal: 10,
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  createNewText: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
});

export default SignIn;