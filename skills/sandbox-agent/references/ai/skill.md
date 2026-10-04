# skill.md

> Source: `docs/ai/skill.mdx`
> Canonical URL: https://sandboxagent.dev/docs/ai/skill
> Description: Agent skill manifest for this documentation.

---
Mintlify hosts a `skill.md` file for this documentation site.

Access it at:

```
https://sandboxagent.dev/docs/skill.md
```

To add it to an agent using the Skills CLI:

#### npx

```bash
npx skills add rivet-dev/skills -s sandbox-agent
```

#### bunx

```bash
bunx skills add rivet-dev/skills -s sandbox-agent
```

If you run a reverse proxy in front of the docs, make sure `/skill.md` and `/.well-known/skills/*`
are forwarded to Mintlify.
