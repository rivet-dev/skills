import { AgentOs, type Permissions } from "@rivet-dev/agentos-core";

// Core accepts the kernel permission tree plus policies for trusted host
// bindings and mounts.
const permissions = {
	network: {
		default: "deny",
		rules: [
			{
				mode: "allow",
				operations: ["*"],
				patterns: ["dns://api.example.com", "tcp://api.example.com:*"],
			},
		],
	},
} satisfies Permissions;

const vm = await AgentOs.create({ permissions });

await vm.dispose();
