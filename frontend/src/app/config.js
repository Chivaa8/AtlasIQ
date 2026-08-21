export const apiBaseUrl = ["localhost", "127.0.0.1", undefined].includes(globalThis.window?.location.hostname)
  ? "http://127.0.0.1:8023/api"
  : "/api";
export const backendUnavailableMessage = "Backend no disponible. Arranca AtlasIQ API en el puerto 8023.";
