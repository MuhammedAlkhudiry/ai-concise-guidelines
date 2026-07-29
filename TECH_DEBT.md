# Technical Debt

- [ ] Add a supported `lanes add <project> <number>` workflow. Creating Awraq Lane 4 required editing `config/active-projects.ts`, running the full
      installer, and then calling setup; the lane CLI cannot extend a fixed project fleet directly.
- [ ] Make `lanes setup <project>` skip healthy or occupied existing lanes when provisioning a newly configured lane. The Lane 4 setup completed most
      of its work but the overall command failed because Lanes 1–3 were reported as “not safe to reprovision.” Preserve those lanes and report them as
      skipped rather than failures.
- [ ] Give every lane a shared-runtime-owned Vite port and origin, write them into Laravel `.env`, and verify ownership. Lane 4 omitted `VITE_PORT`
      and `VITE_DEV_SERVER_ORIGIN`, collided with the existing listener on port 5173, and left Herd returning HTTP 500 because no usable Vite assets
      existed. Relevant code: `src/lib/project-environment/context.ts`, `environment.ts`, and `verification.ts`.
- [ ] Align new-lane verification with managed service startup. Setup invoked `verify.ts --mobile-development` before a usable frontend service was
      running, while verification requires both a successful Herd page and `public/hot`; setup should start the required managed services or make the
      verification phase explicit.
- [ ] Keep compact setup observable during long dependency, seed, and verification phases. Lane 4 setup was silent for several minutes, making a
      healthy long-running provision indistinguishable from a stalled process; emit concise phase transitions while retaining compact output.
- [ ] Make lane selection and output flags consistent across `lanes` subcommands. `setup` and `verify` accept a lane plus `--compact`, while `status`
      accepts only a project and rejects `--compact`; the inconsistent grammar caused two avoidable command failures during the Lane 4 workflow.
- [ ] Make native lane rebuilds open the dev client against the lane-owned Metro port. Lane 4 correctly assigned Metro port `8204`, but `expo run:ios`
      opened the installed client against default port `8081`; live QA then required an explicit deep link back to the lane server.
- [ ] Size generated Android Gradle memory for the production dependency graph. Lane 4's first clean `assembleDebug` reached `mergeExtDexDebug` and
      exhausted the generated 2 GB heap; 4 GB completed dexing on the same dependency set.
- [ ] Verify and reclaim managed Android emulator storage during lane setup. Lane 4's first APK install failed because the shared QA emulator had no
      internal space; removing the previous Awraq dev build was required before the new native build could be installed.
- [ ] Restart or invalidate Metro after lane dependency changes. Lane 4's managed Metro process started before the newly installed Skia package and
      retained a stale resolver map, producing a false “module could not be found” redbox until the lane-owned Metro service was restarted.
- [ ] Route documented Laravel lane commands through Herd PHP (or expose one project-owned wrapper). Lane 4's documented large-tree seeder failed
      under the host Homebrew PHP because `ext-redis` was absent, and the App Store screenshot tenant seeder failed the same way; both commands passed
      immediately under `herd php`.
- [ ] Provision every fixture advertised by local quick-login controls during lane setup, or hide its shortcut until it exists. Lane 4 displayed the
      App Store screenshot login, but the endpoint returned 422 until `AppStoreScreenshotTenantSeeder` was run manually through Herd PHP.
- [ ] Recreate or schema-verify Laravel parallel test databases before lane test runs. Lane 4 retained `testing_test_1` through `testing_test_14`
      without the base `nodes` table; `mise run family-tree:pest` and Pest's `--recreate-databases` both tried to apply later migrations to the
      incomplete schemas, causing every test to fail before setup. The base `awraq_lane_4_testing` database was also empty. Repairing it required an
      explicit MySQL connection plus `CACHE_STORE=array SESSION_DRIVER=array QUEUE_CONNECTION=sync`; `.env.testing` omits `DB_CONNECTION`, so a plain
      `artisan migrate:fresh --env=testing` instead created a stray SQLite file and then failed on the partial migration history. The lane reset/setup
      path should generate a complete test environment, remove stale parallel databases, and validate/rebuild the base schema before verification.
- [ ] Make lane QA seed commands independent of unavailable Redis services. Lane 4's large-tree seeder still reached Redis after setting array cache
      and sessions because the queue connection remained Redis; the reliable local invocation required
      `CACHE_STORE=array SESSION_DRIVER=array QUEUE_CONNECTION=sync herd php artisan db:seed --class=LargeTreeTenantSeeder`. Add this environment to
      the project-owned seed task so fixture creation works in a freshly provisioned lane.
- [ ] Give huge-tree QA seeders an explicit supported PHP memory budget. Lane 4's 50,000-node fixture exhausted the default 128 MB limit; running the
      seeder through `herd php -d memory_limit=1G` completed successfully. Encode and document that limit in the repeatable QA fixture command instead
      of relying on developer PHP defaults.
- [ ] Ensure lane setup provides an Inertia asset version before backend verification. Lane 4 had a Vite `public/hot` file but no
      `public/build/manifest.json`, so Inertia's version was `null`; partial-navigation feature tests sent an empty version header and consistently
      received 409 responses. Build assets before Pest verification or make the test helper normalize the no-manifest case.
- [ ] Normalize managed-service names before CLI lookup. `lanes services status` presents `Metro`, while
      `lanes services restart awraq lane-4 Metro` fails with “Unknown service” and only the lowercase `metro` identifier works. Display the accepted
      identifier, or make service lookup case-insensitive, so status output can be copied into follow-up commands.
- [ ] Make `agent-device` named-session discovery and help self-consistent. After opening the Lane 4 iOS app with
      `--session native-tree-parity`, `session list` in the default state directory returned no sessions and an unqualified snapshot silently read the
      default Android launcher. Snapshot, screenshot, logs, and Metro commands accept `--session`, but their command help does not list it. Surface
      named sessions across state directories or clearly require and document the shared session flag so visual QA cannot capture the wrong device.
