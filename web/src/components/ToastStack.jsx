import { useEffect } from 'react'

export function ToastStack({ toasts, onDismiss }) {
  useEffect(() => {
    if (!toasts.length) {
      return undefined
    }

    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        onDismiss(toast.id)
      }, 2800)
    )

    return () => {
      timers.forEach((timerId) => {
        window.clearTimeout(timerId)
      })
    }
  }, [onDismiss, toasts])

  if (!toasts.length) {
    return null
  }

  return (
    <div id="rv-cart-toast-stack" className="rv-toast-stack" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div key={toast.id} className={`rv-toast rv-toast--${toast.type} is-visible`}>
          {toast.message}
        </div>
      ))}
    </div>
  )
}
