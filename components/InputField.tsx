import { useState } from "react";
import {
  TextInput,
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  Platform,
} from "react-native";

import { InputFieldProps } from "types/type";
import { icons } from "constant";

const InputField = ({
  label,
  icon,
  secureTextEntry = false,
  labelStyle,
  containerStyle,
  inputStyle,
  iconStyle,
  className,
  isPassword,
  ...props
}: InputFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="my-2 w-full">
          <Text className={`text-sm font-JakartaBold tracking-wide text-primary uppercase mb-2 ${labelStyle}`}>
            {label}
          </Text>
          <View
            className={`flex flex-row justify-start items-center relative bg-surface h-[56px] rounded-organic border border-primary/20 focus:border-primary/60 focus:border-2 ${containerStyle}`}
          >
            {icon && (
              <Image source={icon} className={`w-5 h-5 ml-4 opacity-40 tint-primary ${iconStyle}`} />
            )}
            <TextInput
              className={`p-4 font-JakartaMedium text-[16px] flex-1 text-primary ${inputStyle} text-left`}
              secureTextEntry={isPassword ? !showPassword : secureTextEntry}
              placeholderTextColor="hsla(var(--primary), 0.5)"
              {...props}
            />
            {isPassword && (
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                className="pr-5"
                activeOpacity={0.7}
              >
                <Image 
                  source={showPassword ? icons.eye : icons.eyecross} 
                  style={{ tintColor: '#FFD700' }}
                  className={`w-7 h-7 ${showPassword ? 'opacity-100' : 'opacity-50'}`} 
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default InputField;