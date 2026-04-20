import { TouchableOpacity, Text } from "react-native";

import { ButtonProps } from "types/type";

const getBgVariantStyle = (variant: ButtonProps["bgVariant"]) => {
  switch (variant) {
    case "outline":
      return "bg-flesh border-primary border-[2px]";
    default:
      return "bg-primary";
  }
};

const getTextVariantStyle = (variant: ButtonProps["textVariant"]) => {
  switch (variant) {
    case "primary":
      return "text-secondary";
    case "secondary":
      return "text-secondary";
    case "danger":
      return "text-red-500";
    case "success":
      return "text-green-500";
    default:
      return "text-flesh";
  }
};

const CustomButton = ({
  onPress,
  title,
  bgVariant = "primary",
  textVariant = "default",
  IconLeft,
  IconRight,
  className,
  ...props
}: ButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`w-full h-[54px] rounded-pill flex flex-row justify-center items-center shadow-pulseMedium ${getBgVariantStyle(bgVariant)} ${className}`}
      {...props}
    >
      {IconLeft && <IconLeft />}
      <Text className={`text-lg font-JakartaExtraBold tracking-wide ${getTextVariantStyle(textVariant)}`}>
        {title}
      </Text>
      {IconRight && <IconRight />}
    </TouchableOpacity>
  );
};

export default CustomButton;