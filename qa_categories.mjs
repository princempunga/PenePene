export default async function run(page, ui) {
  // login
  await page.goto('http://127.0.0.1:8099/login');
  await page.waitForTimeout(1500);
  await page.locator('input[type=email], input[name=email]').first().fill('admin@penepene.com');
  await page.locator('input[type=password]').first().fill('password');
  await Promise.all([
    page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => { }),
    page.locator('button[type=submit]').first().click(),
  ]);
  await page.waitForTimeout(2000);
  console.log('after login url:', page.url());
  await page.goto('http://127.0.0.1:8099/admin/categories');
  await page.waitForTimeout(4000);
  const body = await page.locator('body').innerText().catch(() => '');
  return { url: page.url(), bodyLen: body.length, text: body.slice(0, 500) };
}
