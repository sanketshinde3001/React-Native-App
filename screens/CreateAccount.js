import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import FormInput from '../components/FormInput';
import AsyncStorage from '@react-native-async-storage/async-storage';

const schema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),

  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required')
    .matches(
      /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      'Invalid email format'
    ),

  phone: yup
    .string()
    .matches(/^[0-9]*$/, 'Only numbers are allowed')
    .min(10, 'Phone number must be exactly 10 digits')
    .max(10, 'Phone number must be exactly 10 digits')
    .required('Phone number is required'),

  aadhar: yup
    .string()
    .matches(/^[0-9]*$/, 'Only numbers are allowed')
    .min(12, 'Aadhar number must be exactly 12 digits')
    .max(12, 'Aadhar number must be exactly 12 digits')
    .required('Aadhar number is required'),

  pan: yup
    .string()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (ABCDE1234F)')
    .required('PAN number is required'),

  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Must contain uppercase letter')
    .matches(/[a-z]/, 'Must contain lowercase letter')
    .matches(/[0-9]/, 'Must contain number')
    .matches(/[^A-Za-z0-9]/, 'Must contain special character'),
});

const CreateAccount = ({ navigation }) => {
  const [validationStatus, setValidationStatus] = useState({
    email: '',
    phone: '',
    aadhar: '',
    pan: '',
    password: '',
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  // Watch all fields for real-time validation
  const watchedFields = {
    email: watch('email'),
    phone: watch('phone'),
    aadhar: watch('aadhar'),
    pan: watch('pan'),
    password: watch('password'),
  };

  useEffect(() => {
    // Email validation
    if (watchedFields.email) {
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      if (!watchedFields.email.includes('@')) {
        setValidationStatus((prev) => ({
          ...prev,
          email: 'Must include @ symbol',
        }));
      } else if (!emailRegex.test(watchedFields.email)) {
        setValidationStatus((prev) => ({
          ...prev,
          email: 'Invalid email format',
        }));
      } else {
        setValidationStatus((prev) => ({ ...prev, email: 'Valid email' }));
      }
    }

    // Phone validation
    if (watchedFields.phone) {
      const phoneRegex = /^[0-9]*$/;
      if (!phoneRegex.test(watchedFields.phone)) {
        setValidationStatus((prev) => ({
          ...prev,
          phone: 'Only numbers allowed',
        }));
      } else if (watchedFields.phone.length < 10) {
        setValidationStatus((prev) => ({
          ...prev,
          phone: `${10 - watchedFields.phone.length} digits remaining`,
        }));
      } else if (watchedFields.phone.length > 10) {
        setValidationStatus((prev) => ({
          ...prev,
          phone: 'Must be exactly 10 digits',
        }));
      } else {
        setValidationStatus((prev) => ({
          ...prev,
          phone: 'Valid phone number',
        }));
      }
    }

    // Aadhar validation
    if (watchedFields.aadhar) {
      const aadharRegex = /^[0-9]*$/;
      if (!aadharRegex.test(watchedFields.aadhar)) {
        setValidationStatus((prev) => ({
          ...prev,
          aadhar: 'Only numbers allowed',
        }));
      } else if (watchedFields.aadhar.length < 12) {
        setValidationStatus((prev) => ({
          ...prev,
          aadhar: `${12 - watchedFields.aadhar.length} digits remaining`,
        }));
      } else if (watchedFields.aadhar.length > 12) {
        setValidationStatus((prev) => ({
          ...prev,
          aadhar: 'Must be exactly 12 digits',
        }));
      } else {
        setValidationStatus((prev) => ({
          ...prev,
          aadhar: 'Valid Aadhar number',
        }));
      }
    }

    // PAN validation
    if (watchedFields.pan) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (watchedFields.pan.length < 10) {
        setValidationStatus((prev) => ({
          ...prev,
          pan: `${10 - watchedFields.pan.length} characters remaining`,
        }));
      } else if (!panRegex.test(watchedFields.pan)) {
        setValidationStatus((prev) => ({
          ...prev,
          pan: 'Must match format: ABCDE1234F',
        }));
      } else {
        setValidationStatus((prev) => ({ ...prev, pan: 'Valid PAN number' }));
      }
    }

    // Password validation
    if (watchedFields.password) {
      let strength = 0;
      let message = [];

      if (watchedFields.password.length >= 8) strength++;
      else message.push('8+ characters');

      if (/[A-Z]/.test(watchedFields.password)) strength++;
      else message.push('uppercase');

      if (/[a-z]/.test(watchedFields.password)) strength++;
      else message.push('lowercase');

      if (/[0-9]/.test(watchedFields.password)) strength++;
      else message.push('number');

      if (/[^A-Za-z0-9]/.test(watchedFields.password)) strength++;
      else message.push('special char');

      let status = '';
      if (strength < 2) status = 'Weak: need ' + message.join(', ');
      else if (strength < 4) status = 'Medium: need ' + message.join(', ');
      else if (strength < 5) status = 'Strong: need ' + message.join(', ');
      else status = 'Very strong';

      setValidationStatus((prev) => ({ ...prev, password: status }));
    }
  }, [watchedFields]);

  const getValidationColor = (field) => {
    const status = validationStatus[field];
    if (!status) return 'gray';
    if (status.includes('Valid') || status.includes('Very strong'))
      return 'green';
    if (status.includes('Medium') || status.includes('remaining'))
      return 'orange';
    return 'red';
  };

  const onSubmit = async (data) => {
    try {
      await AsyncStorage.setItem(data.email, JSON.stringify(data));
      navigation.navigate('SignIn', { newUser: data });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Create Account</Text>

        <FormInput
          control={control}
          name="name"
          label="Full Name"
          placeholder="Enter your full name"
        />
        {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

        <FormInput
          control={control}
          name="email"
          label="Email"
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {validationStatus.email && (
          <Text
            style={[styles.validation, { color: getValidationColor('email') }]}>
            {validationStatus.email}
          </Text>
        )}

        <FormInput
          control={control}
          name="phone"
          label="Phone Number"
          placeholder="Enter 10-digit phone number"
          keyboardType="numeric"
          maxLength={10}
        />
        {validationStatus.phone && (
          <Text
            style={[styles.validation, { color: getValidationColor('phone') }]}>
            {validationStatus.phone}
          </Text>
        )}

        <FormInput
          control={control}
          name="aadhar"
          label="Aadhar Number"
          placeholder="Enter 12-digit Aadhar number"
          keyboardType="numeric"
          maxLength={12}
        />
        {validationStatus.aadhar && (
          <Text
            style={[
              styles.validation,
              { color: getValidationColor('aadhar') },
            ]}>
            {validationStatus.aadhar}
          </Text>
        )}

        <FormInput
          control={control}
          name="pan"
          label="PAN Number"
          placeholder="ABCDE1234F"
          autoCapitalize="characters"
          keyboardType="numeric"
          maxLength={10}
        />
        {validationStatus.pan && (
          <Text
            style={[styles.validation, { color: getValidationColor('pan') }]}>
            {validationStatus.pan}
          </Text>
        )}

        <FormInput
          control={control}
          name="password"
          label="Password"
          placeholder="Enter your password"
          secureTextEntry={true}
        />
        {validationStatus.password && (
          <Text
            style={[
              styles.validation,
              { color: getValidationColor('password') },
            ]}>
            {validationStatus.password}
          </Text>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(onSubmit)}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.linkText}>
            Already have an account?{' '}
            <Text style={styles.createNewText}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    marginTop: -5,
  },
  validation: {
    fontSize: 12,
    marginBottom: 10,
    marginTop: -5,
  },
  button: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    paddingVertical: 12,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    fontSize: 14,
    color: '#6200ee',
    textAlign: 'center',
    marginTop: 15,
  },
  createNewText: {
    fontWeight: 'bold',
  },
});

export default CreateAccount;
