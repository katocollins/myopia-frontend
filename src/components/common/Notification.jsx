// src/components/common/Notification.jsx
import React, { useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { useUiStore } from "../../stores/uiStore";

const Notification = () => {
  const { toast, clearToast } = useUiStore();

  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => {
        clearToast();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [toast, clearToast]);

  if (!toast.message) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div
        className={`flex items-center p-4 rounded-lg shadow-lg ${
          toast.type === "success"
            ? "bg-green-400 text-white"
            : "bg-red-600 text-white"
        }`}
      >
        {toast.type === "success" ? (
          <CheckCircle className="mr-2" size={20} />
        ) : (
          <XCircle className="mr-2" size={20} />
        )}
        <span className="text-sm">{toast.message}</span>
      </div>
    </div>
  );
};

export default Notification;
