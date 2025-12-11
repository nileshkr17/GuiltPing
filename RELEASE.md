# Release Process

1. Tests & Lint
```zsh
bun run build
# optional
bun run lint

# or
npm run build
npm run lint
```

2. Versioning
- Follow SemVer: MAJOR.MINOR.PATCH
- Update version in `package.json`

3. Changelog
- Summarize changes in `CHANGELOG.md` (if present)

4. Tag & Publish
```zsh
git tag vX.Y.Z
git push origin vX.Y.Z
```

5. Build Artifacts
- Attach build outputs or container images if relevant.
