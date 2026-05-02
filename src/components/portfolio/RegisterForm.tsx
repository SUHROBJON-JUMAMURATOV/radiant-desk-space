import { OrderForm } from "./OrderForm";

// "Hisob yaratish" bo'limi olib tashlandi.
// Foydalanuvchi #register manziliga kelganda ham zakaz formasi ko'rinadi.
export const RegisterForm = () => {
  return (
    <div id="register">
      <OrderForm />
    </div>
  );
};