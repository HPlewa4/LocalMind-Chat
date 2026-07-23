export type ToastFunction = (message: string) => void;

export interface ToastFunctions {
  showSuccess: ToastFunction;
  showError: ToastFunction;
  showWarning: ToastFunction;
  showInfo: ToastFunction;
}