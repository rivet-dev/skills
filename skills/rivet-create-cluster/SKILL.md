---
name: rivet-create-cluster
description: Size and create a Rivet Cloud cluster for an app through the Rivet MCP server, from a recommendation the user approves. Use when asked to create, provision, or set up a Rivet cluster, or to pick its plan, region, or runner size.
metadata:
  rivet-requires: rivet.cloud.v2.plans.get rivet.cloud.v2.regions.available rivet.cloud.v2.clusters.upsert rivet.cloud.v2.clusters.get
---

# Create a Rivet cluster

Read the app, recommend a setup, wait for the user's approval, then create the cluster. Every call below runs as Code Mode JavaScript through the `execute` tool.

## 1. Estimate the workload

Read the codebase: which Rivet Actors it defines or needs, how many run at once, how much state and SQLite each keeps, how write-heavy it is, and whether it is a prototype or headed to production. When there is no app yet, size for a prototype. The docs are at https://rivet.dev/docs.

## 2. Read the options

```js
const [pricing, regions] = await Promise.all([
	rivet.cloud.v2.plans.get(),
	rivet.cloud.v2.regions.available(),
]);
return { pricing, regions: regions.items };
```

- `regions` lists each `cloud` and `region` a cluster can be created in, with its city.
- `pricing.plans` is cheapest first. Each plan's `control_planes` are the sizes it is sold in, cheapest first, with `monthly_cents`. The control plane stores actor state.
- `plan.runners` caps the runners across every pool: `max_nodes`, the allowed `machine_types`, and whether nodes are `billed`.
- `pricing.machine_types` gives each machine type's vCPU, memory, disk and write throughput. `pricing.node_prices` gives the monthly price of one runner node by `cloud` and `machine_type`.

Take every price from this response. Never quote a price from memory.

## 3. Recommend a setup

Recommend one value for each setting, each with a one-line reason, and the total monthly cost. Prefer the cheapest setup that fits.

- Name (`cluster`): lowercase letters, digits and hyphens, at most 63 characters, not starting or ending with a hyphen. Base it on the app's name.
- `cloud` and `region`: the region closest to the app's users, or to the user when that is unknown.
- `plan` and `control_plane`.
- Runner `machine_type` and `node_count`, within the plan's `runners` limits.
- Allowed IPs (`cidr_allowlist`, comma-separated CIDRs): `0.0.0.0/0` unless the app is only reached from known networks.

The plan, control plane and runners can all be changed later without recreating the cluster. The cloud and region cannot.

## 4. Create it after approval

Show the recommendation and wait for the user's approval before creating anything. A paid plan charges the organization's default payment method.

```js
return await rivet.cloud.v2.clusters.upsert({
	cluster: "my-app",
	query: {
		cloud: "gcp",
		region: "us-east4",
		plan: "free",
		control_plane: "1x-e2-micro",
		cidr_allowlist: "0.0.0.0/0",
	},
});
```

A 402 means the organization has no payment method. Ask the user to add a card in the dashboard, then retry.

Provisioning takes several minutes. Call `rivet.cloud.v2.clusters.get({ cluster })` until `status.state` is `ready`, and report `status.message` when `status.action_needed` is `true`.

## 5. Deploy and size the runners

Deploy the app with the `rivet-deploy-image` skill. The first rollout creates the `default` runner pool with one `e2-small` node.

When the recommendation had other runners, set them on the `default` pool after that first rollout. Read the pool first and send its `cidr_allowlist` back, because an upsert replaces the pool's settings wholesale.

```js
const pool = await rivet.cloud.v2.runnerPools.get({ cluster: "my-app", region: "us-east4", pool: "default" });
return await rivet.cloud.v2.runnerPools.upsert({
	cluster: "my-app",
	region: "us-east4",
	pool: "default",
	body: {
		build_id: pool.build_id,
		cidr_allowlist: pool.cidr_allowlist,
		machine_type: "e2-medium",
		node_count: 2,
	},
});
```

## Rules

- Never create a cluster or change a plan without the user's approval of that exact setup.
- Do not guess a `cluster`, `region` or `pool` name. List them first.
- Code that calls the app's actors connects with the cluster's `RIVET_ENDPOINT` and an admin token. This skill cannot read the token. Ask the user to copy the agent prompt from the cluster's page in the dashboard, which has both.
