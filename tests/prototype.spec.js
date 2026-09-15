import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });

async function dragPlayerTo(page, testId, x, y) {
  const box = await page.getByTestId(testId).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height - 8);
  await page.mouse.down();
  await page.mouse.move(x, y, { steps: 9 });
  await page.mouse.up();
  await page.waitForTimeout(220);
}

async function enterDay(page) {
  await page.getByRole("button", { name: "启封档案" }).click();
  await expect(page.getByText("用手指擦去玻璃上的霜")).toBeVisible();
  await expect(page.locator("#frostCanvas")).toHaveAttribute("data-ready", "true");
  await page.screenshot({ path: "test-results/prologue-mobile.png", fullPage: true });
  const frost = await page.locator("#frostCanvas").boundingBox();
  for (const ratio of [0.28, 0.5, 0.72]) {
    await page.mouse.click(frost.x + frost.width * ratio, frost.y + frost.height * 0.5);
  }
  const hold = page.getByRole("button", { name: "按住进入记忆" });
  await expect(hold).toBeVisible();
  const holdBox = await hold.boundingBox();
  await page.mouse.move(holdBox.x + holdBox.width / 2, holdBox.y + holdBox.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(1350);
  await page.mouse.up();
  await expect(page.getByText("按住雪地拖动 · 松手伏低")).toBeVisible();
  await expect(page.locator("#dayScene")).toHaveCSS("pointer-events", "auto");
}

test("completes the full six-part experience", async ({ page }) => {
  test.setTimeout(60_000);
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "雪线余火" })).toBeVisible();
  await expect(page.getByRole("button", { name: "启封档案" })).toBeEnabled();
  expect(await page.locator("img").evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0))).toBeTruthy();
  await page.screenshot({ path: "test-results/intro-mobile.png", fullPage: true });

  await enterDay(page);
  await page.screenshot({ path: "test-results/day-mobile.png", fullPage: true });
  await dragPlayerTo(page, "day-player", 66, 591);
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => window.__snowline.state.dayStep)).toBe(1);
  await dragPlayerTo(page, "day-player", 302, 523);
  expect(await page.evaluate(() => window.__snowline.state.dayStep)).toBe(2);
  await page.getByRole("button", { name: "查看倒木旁的旧药箱" }).click();
  await expect(page.getByRole("heading", { name: "雪下留下的空处" })).toBeVisible();
  await page.getByRole("button", { name: "关闭史料卡" }).click();
  await dragPlayerTo(page, "day-player", 191, 692);
  await expect(page.getByRole("heading", { name: "风把两条路都盖住了" })).toBeVisible();
  await page.getByRole("button", { name: /林下远路/ }).click();

  await expect(page.getByText("查看密营里的五件物品")).toBeVisible();
  await expect(page.locator("#campScene")).toHaveCSS("pointer-events", "auto");
  await page.waitForTimeout(1600);
  await page.screenshot({ path: "test-results/camp-mobile.png", fullPage: true });
  for (const name of ["查看火盆", "查看药箱", "查看路线图", "查看干粮", "查看棉衣"]) {
    await page.getByRole("button", { name }).click();
  }
  await expect(page.getByRole("heading", { name: "木桌旁没有多余的一份" })).toBeVisible();
  await page.getByRole("button", { name: /分给伤员老周/ }).click();
  await expect(page.getByRole("heading", { name: "门缝里的风越来越近" })).toBeVisible();
  await page.getByRole("button", { name: /交给通讯员小满/ }).click();
  await expect(page.getByText("路线只展开五秒")).toBeVisible();
  await page.waitForTimeout(400);
  await page.screenshot({ path: "test-results/map-mobile.png", fullPage: true });
  await page.evaluate(() => window.__snowline.finishMapStudy());
  await page.getByRole("button", { name: /枯松 → 河沟 → 石崖/ }).click();

  await expect(page.getByText("循掩体前进 · 灯光逼近时屏息")).toBeVisible();
  await page.waitForTimeout(1900);
  const litPixels = await page.locator(".spotlight-canvas").evaluate((canvas) => {
    const data = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
    let nonTransparent = 0;
    for (let index = 3; index < data.length; index += 4) if (data[index] > 0) nonTransparent += 1;
    return nonTransparent;
  });
  expect(litPixels).toBeGreaterThan(100);
  await page.screenshot({ path: "test-results/night-mobile.png", fullPage: true });
  await dragPlayerTo(page, "night-player", 66, 591);
  await dragPlayerTo(page, "night-player", 296, 523);
  await dragPlayerTo(page, "night-player", 203, 692);

  await expect(page.getByText("用手挡住火苗 · 持续六秒")).toBeVisible();
  await expect(page.locator("#fireScene")).toHaveCSS("pointer-events", "auto");
  await page.screenshot({ path: "test-results/fire-mobile.png", fullPage: true });
  const lamp = await page.getByRole("button", { name: "按住护住油灯火苗" }).boundingBox();
  await page.mouse.move(lamp.x + lamp.width / 2, lamp.y + lamp.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(6200);
  await page.mouse.up();
  await expect(page.getByRole("heading", { name: "光照出了最后一段路线" })).toBeVisible();
  await page.getByRole("button", { name: /交给同伴带走/ }).click();
  await expect(page.getByRole("heading", { name: "把黑夜交还给山河" })).toBeVisible();
  await expect(page.locator("#echoScene")).toHaveCSS("pointer-events", "auto");
  await page.locator("#echoRange").fill("95");
  await page.getByRole("button", { name: "接过这份记忆" }).click();

  await expect(page.getByRole("heading", { name: "火种抵达之后" })).toBeVisible();
  await expect(page.locator("#resultScene")).toHaveCSS("pointer-events", "auto");
  await expect(page.locator("[data-record='cost']")).toContainText("林下远路");
  await expect(page.locator("[data-record='companion']")).toContainText("干粮");
  await expect(page.locator("[data-record='memory']")).toContainText("旧药箱");
  await expect(page.locator("[data-record='ending']")).toContainText("同伴带走");
  await page.screenshot({ path: "test-results/archive-mobile.png", fullPage: true });
  expect(errors).toEqual([]);
});

test("centers the 9:16 stage on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "启封档案" })).toBeEnabled();
  const box = await page.locator("#game").boundingBox();
  expect(box.width).toBeCloseTo(506.25, 0);
  expect(box.height).toBe(900);
  expect(box.x).toBeCloseTo((1440 - box.width) / 2, 0);
  await page.screenshot({ path: "test-results/intro-desktop.png", fullPage: true });
});

test("honors reduced motion and exposes stealth assistance", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "启封档案" })).toBeEnabled();
  expect(await page.evaluate(() => window.__snowline.state.reduced)).toBeTruthy();
  await page.getByRole("button", { name: "启封档案" }).click();
  await page.evaluate(() => window.__snowline.enterDay());
  await expect(page.getByText("按住雪地拖动 · 松手伏低")).toBeVisible();
  expect(await page.locator(".waypoint").first().evaluate((element) => getComputedStyle(element).animationName)).toBe("none");
  await page.getByRole("button", { name: "体验设置" }).click();
  await page.getByLabel("辅助潜行").check();
  expect(await page.evaluate(() => window.__snowline.state.assisted)).toBeTruthy();
});

for (const viewport of [{ width: 360, height: 800 }, { width: 430, height: 932 }]) {
  test(`fits the ${viewport.width}x${viewport.height} mobile stage`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.getByRole("button", { name: "启封档案" })).toBeEnabled();
    const gameBox = await page.locator("#game").boundingBox();
    const buttonBox = await page.getByRole("button", { name: "启封档案" }).boundingBox();
    expect(gameBox.width).toBe(viewport.width);
    expect(gameBox.height).toBe(viewport.height);
    expect(buttonBox.x).toBeGreaterThanOrEqual(gameBox.x);
    expect(buttonBox.x + buttonBox.width).toBeLessThanOrEqual(gameBox.x + gameBox.width);
    expect(buttonBox.y + buttonBox.height).toBeLessThan(viewport.height);
    await page.screenshot({ path: `test-results/intro-${viewport.width}.png`, fullPage: true });
  });
}
