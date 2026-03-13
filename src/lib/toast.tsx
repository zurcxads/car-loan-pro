import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 4000,
      icon: '✓',
      style: {
        background: '#f0fdf4',
        color: '#166534',
        border: '1px solid #86efac',
      },
    });
  },

  error: (message: string) => {
    toast.error(message, {
      duration: 5000,
      icon: '✕',
      style: {
        background: '#fef2f2',
        color: '#991b1b',
        border: '1px solid #fca5a5',
      },
    });
  },

  info: (message: string) => {
    toast(message, {
      duration: 4000,
      icon: 'ℹ',
      style: {
        background: '#eff6ff',
        color: '#1e40af',
        border: '1px solid #93c5fd',
      },
    });
  },

  warning: (message: string) => {
    toast(message, {
      duration: 4500,
      icon: '⚠',
      style: {
        background: '#fffbeb',
        color: '#92400e',
        border: '1px solid #fde68a',
      },
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: '#eff6ff',
        color: '#1e40af',
        border: '1px solid #93c5fd',
      },
    });
  },

  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: Error) => string);
    }
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        success: {
          duration: 4000,
          style: {
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #86efac',
          },
        },
        error: {
          duration: 5000,
          style: {
            background: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fca5a5',
          },
        },
      }
    );
  },
};
