## Intro

Note: While not exactly the same, [`yarn outdated`](https://classic.yarnpkg.com/lang/en/docs/cli/outdated/) provides already very relevant version information.

Node script to check `package.json`'s `dependencies` and `devDependencies` and list those outdated.

Sample output:
```
> devDependencies 'eslint-config-airbnb-base' is out of date.
  Installed v.14.2.1 -> latest v.15.0.0 (367 days between versions)
> devDependencies 'eslint' is out of date.
  Installed v.7.32.0 -> latest v.8.16.0 (293 days between versions)
```

Actual output uses one of 3 colors:
- grey for outdated by a few days
- yellow for outdated at least 1 month
- red for outdated at least 2 months

## Requirements

- NodeJS for executing
- Yarn for dependency checking (uses `yarn info` behind the scenes)
