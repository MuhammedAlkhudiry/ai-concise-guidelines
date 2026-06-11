# PHP / Composer

1. Identify PHP version, Composer version, platform config, extensions, `composer.json`, `composer.lock`, repositories, scripts, plugins, and autoload rules.
2. Classify packages as runtime, dev tooling, test tooling, static analysis, code style, framework-adjacent, or transitive/security-only.
3. Use Composer-native commands such as `composer outdated`, `composer audit`, `composer why`, `composer why-not`, and targeted `composer update vendor/package --with-dependencies`.
4. Keep the existing PHP execution boundary: run PHP and Composer through the project's established local flow, and use `ddev` for Laravel/PHP commands when the repo requires it.
5. Review current release notes for upgraded direct packages, with extra care for PHP version constraints, plugin behavior, autoload changes, and removed APIs.
6. Apply small fixes directly: renamed classes, namespace changes, method signature updates, config key changes, type errors, tool config updates, and simple test assertion updates.
7. Skip and ask approval for broad API migrations, PHP version jumps that affect runtime hosting, replacing major libraries, or dependency changes that require many application files.
8. Run available Composer scripts, PHPUnit/Pest, PHPStan/Psalm, Rector checks, Pint, and focused tests for touched behavior.
9. Report each PHP dependency with version movement, notable changes, code impact, patch status, checks, and skipped/blocked reasons.
