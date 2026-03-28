import { tool } from "ai";
import { z } from "zod";

export const formatOutput = tool({
  description:
    "Format the final output as CSV, JSON, or text. Call this when you have collected all data and are ready to present results.",
  inputSchema: z.object({
    format: z.enum(["csv", "json", "text"]).describe("Output format"),
    data: z.unknown().describe("The data to format — can be a JSON string, object, array, or plain text"),
    columns: z
      .array(z.string())
      .optional()
      .describe("Column names for CSV format"),
  }),
  execute: async ({ format, data, columns }) => {
    switch (format) {
      case "json": {
        // If data is already a JSON string, use it directly
        if (typeof data === "string") {
          try {
            JSON.parse(data); // validate it's valid JSON
            return { format: "json", content: data };
          } catch {
            return { format: "json", content: JSON.stringify(data, null, 2) };
          }
        }
        return { format: "json", content: JSON.stringify(data, null, 2) };
      }
      case "csv": {
        const Papa = await import("papaparse");
        let rows: unknown[];
        if (typeof data === "string") {
          try { rows = JSON.parse(data); if (!Array.isArray(rows)) rows = [rows]; }
          catch { return { format: "csv", content: data }; }
        } else {
          rows = Array.isArray(data) ? data : [data];
        }
        return { format: "csv", content: Papa.default.unparse(rows as Record<string, unknown>[], { columns }) };
      }
      case "text":
        return {
          format: "text",
          content: typeof data === "string" ? data : JSON.stringify(data, null, 2),
        };
    }
  },
});
