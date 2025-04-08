// utils/toast.ts
import { toast, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const defaultOptions: ToastOptions = {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'dark',
};

export const showSuccess = (message: string, options?: ToastOptions) =>
    toast.success(message, { ...defaultOptions, ...options });

export const showError = (message: string, options?: ToastOptions) =>
    toast.error(message, { ...defaultOptions, ...options });

export const showInfo = (message: string, options?: ToastOptions) =>
    toast.info(message, { ...defaultOptions, ...options });

export const showWarning = (message: string, options?: ToastOptions) =>
    toast.warn(message, { ...defaultOptions, ...options });
