export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerVideoEvents } = await import("@/server/video/subscriber");
    await registerVideoEvents();
  }
}
