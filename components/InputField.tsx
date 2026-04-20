import {
  TextInput,
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";

import { InputFieldProps } from "types/type";

const InputField = ({
  label,
  icon,
  secureTextEntry = false,
  labelStyle,
  containerStyle,
  inputStyle,
  iconStyle,
  className,
  ...props
}: InputFieldProps) => {
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
              secureTextEntry={secureTextEntry}
              placeholderTextColor="hsla(var(--primary), 0.5)"
              {...props}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default InputField;