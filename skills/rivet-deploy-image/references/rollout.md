# Rollout steps, errors, and rollback

## What `rivet.deploy.rollout` returns

```
{ done, step, build_id, build_status?, region?, pool?, status?: { state, message, action_needed }, endpoints? }
```

| `step` | Meaning | What to do |
| - | - | - |
| `verifying_build` | The upload is being checked against the size and digest it was prepared with. `build_status` is `uploading` or `completing`. | Call again with the same arguments. |
| `rolling_out` | The runner pool has been pointed at the build and is not ready yet. `status.message` says what is changing. When `status.action_needed` is `true`, the build itself is failing and `status.message` says why. | Call again with the same arguments, or fix the app and deploy a new build when `status.action_needed` is `true`. |
| `ready` | The pool runs the build, its `status.state` is `ready`, and `done` is `true`. | Stop and report `endpoints`. |

## Arguments

- `region` is only needed when the cluster has several. With exactly one region it is chosen for you.
- `pool` defaults to `default`. A pool that does not exist yet is created with an empty allowlist. An existing pool keeps the allowlist it has.

## Errors

| Error | Cause | What to do |
| - | - | - |
| `deploy/build_failed` | The uploaded bytes did not match `content_length` and `content_md5`. | Measure the tarball again, call `rivet.deploy.prepare`, and upload again. |
| `deploy/build_expired`, `deploy/build_deleting` | The build can no longer be deployed, for example because it was never uploaded before `expires_at`. | Call `rivet.deploy.prepare` for a new build. |
| `deploy/region_required` | The cluster has several regions, or none. | The message lists the regions. Pass one as `region`, or add a region first when there are none. |

A failed upload command means nothing was deployed. Run it again while the URL is still valid, or prepare a new build.

## Rolling back

Call `rivet.deploy.rollout` with an earlier `build_id`, and repeat it until `done` is `true` exactly as for a deploy. Nothing is rebuilt or uploaded. `rivet.cloud.v2.builds.list` lists a cluster's builds newest first with their status, and only a `ready` build can be rolled to.
