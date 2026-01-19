import { useRouter } from "expo-router";
import { api } from "../lib/api-client";

export const usePayment = () => {
  const router = useRouter();

  const initiateEsewa = (orderId: string) => {
    const baseUrl = api.getApiBaseUrl();
    const payUrl = `${baseUrl}/api/v1/checkout/esewa/pay?orderId=${orderId}&source=app`;
    console.log("[usePayment] Initiating eSewa:", payUrl);

    router.push({
      pathname: "/(screens)/checkout/esewa-payment",
      params: { url: payUrl },
    });
  };

  const initiateKhalti = (orderId: string) => {
    const baseUrl = api.getApiBaseUrl();
    const payUrl = `${baseUrl}/api/v1/checkout/khalti/pay?orderId=${orderId}&source=app`;
    console.log("[usePayment] Initiating Khalti:", payUrl);

    router.push({
      pathname: "/(screens)/checkout/khalti-payment",
      params: { url: payUrl },
    });
  };

  return { initiateEsewa, initiateKhalti };
};
