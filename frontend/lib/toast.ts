export type ToastType = "success" | "error" | "info" | "warning";

export function showToast(
  message: string,
  type: ToastType = "info",
  duration = 4000,
) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `alert alert-${type} shadow-lg`;
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}
