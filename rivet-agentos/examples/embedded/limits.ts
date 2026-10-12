import { AgentOs } from "@rivet-dev/agentos-core";

const sidecar = await AgentOs.createSidecar({
	runtime: { executor: { maxActiveVms: 8 } },
});

// `onLimitWarning` surfaces near-limit pressure to the embedding process.
const vm = await AgentOs.create({
	sidecar: { kind: "explicit", handle: sidecar },
	limits: {
		resources: { maxProcesses: 64, maxFilesystemBytes: 256 * 1024 * 1024 },
		jsRuntime: { v8HeapLimitMb: 128, cpuTimeLimitMs: 30_000 },
	},
	onLimitWarning: (warning) => {
		console.warn("near limit:", warning);
	},
});
await vm.dispose();
await sidecar.dispose();
