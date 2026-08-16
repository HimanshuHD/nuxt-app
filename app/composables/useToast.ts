export type ToastType = 'success' | 'error'

export type Toast = {
  id: number
  type: ToastType
  message: string
  timeout: number
}

const toasts = ref<Toast[]>([])
let nextToastId = 0

export function useToast() {
  function remove(id: number) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function show(message: string, type: ToastType, timeout = 4000) {
    const id = ++nextToastId
    toasts.value.push({ id, type, message, timeout })

    if (timeout > 0) {
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
