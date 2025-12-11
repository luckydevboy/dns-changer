import { assertEquals } from "@std/assert";

// Basic test to ensure the module loads correctly
Deno.test("Module loads successfully", () => {
  // Just verify we can import the module
  const module = await import("./main.ts");
  assertEquals(typeof module, "object");
});