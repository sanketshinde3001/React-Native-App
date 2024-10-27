import React from 'react';
import { TextInput, HelperText } from 'react-native-paper';
import { Controller } from 'react-hook-form';

const FormInput = ({ control, name, rules, label, keyboardType }) => (
  <Controller
    control={control}
    name={name}
    rules={rules}
    render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
      <>
        <TextInput
          label={label}
          onBlur={onBlur}
          onChangeText={onChange}
          value={value}
          keyboardType={keyboardType}
          mode="outlined"
          style={{ marginBottom: 10 }}
        />
        {error && <HelperText type="error">{error.message}</HelperText>}
      </>
    )}
  />
);

export default FormInput;
