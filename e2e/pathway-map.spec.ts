import { test, expect } from "./fixtures";

test.describe("Pathway map", () => {
  test("career nodes render inside the map container, not off-screen", async ({ page }) => {
    await page.goto("/careers");

    // Wait for the pathway map container
    const mapContainer = page.getByTestId("pathway-map");
    await expect(mapContainer).toBeVisible({ timeout: 15_000 });
    const mapBox = await mapContainer.boundingBox();
    expect(mapBox).toBeTruthy();

    // Wait for ReactFlow to finish rendering nodes
    const nodes = page.locator(".react-flow__node");
    await expect(nodes.first()).toBeVisible({ timeout: 10_000 });

    const count = await nodes.count();
    expect(count).toBeGreaterThan(0);

    // Every visible node must be inside the map container's bounding box
    for (let i = 0; i < count; i++) {
      const nodeBox = await nodes.nth(i).boundingBox();
      if (!nodeBox) continue;

      expect(
        nodeBox.x >= mapBox!.x &&
          nodeBox.y >= mapBox!.y &&
          nodeBox.x + nodeBox.width <= mapBox!.x + mapBox!.width &&
          nodeBox.y + nodeBox.height <= mapBox!.y + mapBox!.height,
        `Node ${i} is outside the pathway map container (node: ${JSON.stringify(nodeBox)}, container: ${JSON.stringify(mapBox)})`,
      ).toBe(true);
    }
  });
});
