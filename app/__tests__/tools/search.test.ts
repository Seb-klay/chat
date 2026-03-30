// @vitest-environment node

import { getSearchResults } from "@/app/service";
import { it, expect, describe } from "vitest";


describe("Tests search instance using SearxNG", () => {
    it("should return results for a query", async () => {
        const results = await getSearchResults("SpaceX latest news");
        expect(results).not.toBeNull();
        expect(results?.status).toBe(200);

        const data = await results?.json();
        expect(data.results).toBeDefined();
        expect(Array.isArray(data.results)).toBe(true);
    });
});