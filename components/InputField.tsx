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
            className={`flex flex-row justify-start items-center relative bg-white h-[48px] rounded-brutalist border border-primary/30 focus:border-primary focus:border-2 ${containerStyle}`}
          >
            {icon && (
              <Image source={icon} className={`w-5 h-5 ml-4 opacity-50 tint-primary ${iconStyle}`} />
            )}
            <TextInput
              className={`p-4 font-JakartaMedium text-[15px] flex-1 text-primary ${inputStyle} text-left`}
              secureTextEntry={secureTextEntry}
              placeholderTextColor="#FF6A0066"
              {...props}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default InputField;