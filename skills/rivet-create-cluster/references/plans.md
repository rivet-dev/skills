# Reading the plans

Everything below comes from `rivet.cloud.v2.plans.get()`. Use its numbers, not the examples here.

## What a cluster is made of

- The **control plane** runs the cluster's engine and stores actor state: KV, SQLite and workflow history. Its size is set by the plan and the `control_plane` option, and it bounds how much state the cluster holds and how fast it can write.
- **Actor Nodes** are the runner nodes that run the app's code. They are sized by `machine_type` and `node_count` on the runner pool. One node runs hundreds of typical actors. Add nodes for more concurrent actors or CPU-heavy actions, and pick a larger machine type for memory-heavy actors.

## Plans

Each entry of `pricing.plans` has:

| Field | Meaning |
| - | - |
| `plan`, `label` | The ID to send, and the name the dashboard shows, such as `pro` and Hobby. |
| `control_planes` | The control plane sizes the plan is sold in, cheapest first. The first is the default. |
| `runners.max_nodes` | The most Actor Nodes across every runner pool of the cluster. |
| `runners.machine_types` | The machine types its Actor Nodes may use. |
| `runners.billed` | Whether Actor Nodes cost extra. When `false`, they are included in the plan's price. |
| `uptime_sla` | The uptime the plan guarantees, or `null` for none. |
| `support` | The support channel the plan includes. |

## Control plane options

Each entry of a plan's `control_planes` has:

| Field | Meaning |
| - | - |
| `control_plane`, `label` | The ID to send, and the name the dashboard shows, such as `1x-e2-small` and Hobby-2. |
| `machine_type`, `node_count` | The control plane's nodes. Look the machine type up in `pricing.machine_types`. |
| `availability_zones` | The isolated data centers of the region the nodes are spread across. With more than one, the cluster stays up through a zone outage. |
| `monthly_cents` | The plan's whole price with this option, before Actor Nodes. |

Look the control plane's `machine_type` up in `pricing.machine_types`. Multiply by `node_count` to get the cluster's figures, which is how the dashboard shows them: `storage_gib × node_count` is the actor storage, or hot cache, the cluster includes, and `write_mbps × node_count` is its sustained write throughput.

## Allowances

`pricing.allowances` applies to every cluster:

- `included_egress_gib` of egress each month, then `egress_cents_per_gib`.
- Actor storage past the included `storage_gib × node_count` costs `extra_storage_cents_per_gib`.
- Object storage of `object_storage_multiplier` times the actor storage is included, then `extra_object_storage_cents_per_gib`.

Mention these in the cost estimate when the app stores a lot of state or serves large responses.

## Choosing

- **Prototype or side project:** the free plan, or the cheapest paid plan when it needs more than the free limits. One availability zone and no SLA are fine.
- **Production with real users:** a plan with an `uptime_sla`. Prefer one whose control plane spans several `availability_zones` when downtime costs the user money.
- **Write-heavy or large state:** a larger control plane option within the plan, sized so the expected state fits its included actor storage and peak writes fit its write throughput.
- **Runners:** pick the machine type and count first, then the cheapest plan whose `runners` allow them. A plan that does not allow a machine type or node count refuses it, so move up a plan rather than shrinking the runners below what the app needs.
- The monthly total is the option's `monthly_cents`, plus `node_prices` times `node_count` for the region's `cloud` when `runners.billed` is `true`.
