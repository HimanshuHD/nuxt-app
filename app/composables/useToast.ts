export type ToastType = 'success' | 'error'

export type Toast = {
  id: number
  type: ToastType
  message: string
  timeout: number
}

let nextToastId = 0

export function useToast() {
  const toasts = useState<Toast[]>('app-toasts', () => [])

  function remove(id: number) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function show(message: string, type: ToastType, timeout = 4000) {
    const id = ++nextToastId
    toasts.value = [...toasts.value, { id, type, message, timeout }]

    if (timeout > 0 && import.meta.client) {
      window.setTimeout(() => remove(id), timeout)
    }
  }

  return {
    toasts: readonly(toasts),
    remove,
    success: (message: string, timeout?: number) => show(message, 'success', timeout),
    error: (message: string, timeout?: number) => show(message, 'error', timeout),
  }
}
