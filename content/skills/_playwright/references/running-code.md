# Running Custom Playwright Code

Use `run-code` to execute arbitrary Playwright code for advanced scenarios not covered by CLI commands.

## Syntax

```bash
playwright-cli run-code "async page => {
  // Your Playwright code here
}"
```

## Examples

```bash
playwright-cli run-code "async page => {
  await page.context().grantPermissions(['geolocation']);
  await page.context().setGeolocation({ latitude: 37.7749, longitude: -122.4194 });
}"

playwright-cli run-code "async page => {
  await page.waitForLoadState('networkidle');
}"

playwright-cli run-code "async page => {
  return await page.title();
}"
```
