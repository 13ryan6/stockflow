import { cn } from "@/lib/utils";

test("cn une clases y resuelve conflictos de Tailwind", () => {
  expect(cn("p-2", "p-4")).toBe("p-4");
  expect(cn("a", false && "b", "c")).toBe("a c");
});