import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { Toast, ToastType } from "../components/ui/Toast";

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("info");

  const hideToast = useCallback(() => {
    setVisible(false);
  }, []);

  const showToast = useCallback(
    (msg: string, toastType: ToastType = "info") => {
      setMessage(msg);
      setType(toastType);
      setVisible(true);

      // Auto hide after 3 seconds
      setTimeout(() => {
        setVisible(false);
      }, 3000);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast
        message={message}
        type={type}
        visible={visible}
        onHide={hideToast}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
