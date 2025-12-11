#!/usr/bin/env -S deno run --allow-run

/**
 * Simple DNS Changer CLI for macOS
 * Set or remove DNS servers using networksetup command
 */

const DNS_PROVIDERS: Record<string, string[]> = {
  shecan: ["178.22.122.100", "185.51.200.2"],
  begzar: ["185.55.226.26", "185.55.225.25", "185.55.224.24"],
  electro: ["78.157.42.101", "78.157.42.100"],
};

/**
 * Get the active network service (Wi-Fi or Ethernet)
 */
async function getActiveService(): Promise<string> {
  const command = new Deno.Command("networksetup", {
    args: ["-listallnetworkservices"],
    stdout: "piped",
    stderr: "piped",
  });

  const { stdout, success } = await command.output();

  if (!success) {
    throw new Error("Failed to list network services");
  }

  const output = new TextDecoder().decode(stdout);
  const lines = output
    .split("\n")
    .filter((line) => line.trim() && !line.startsWith("An asterisk"));

  const services = lines.map((line) => line.trim());

  // Prefer Wi-Fi, then Ethernet, then first available
  const service =
    services.find((s) => s.toLowerCase().includes("wi-fi")) ||
    services.find((s) => s.toLowerCase().includes("ethernet")) ||
    services[0];

  if (!service) {
    throw new Error("No network service found");
  }

  return service;
}

/**
 * Set DNS servers
 */
async function setDNS(service: string, servers: string[]): Promise<void> {
  const args = ["-setdnsservers", service, ...servers];

  const command = new Deno.Command("networksetup", {
    args,
    stdout: "piped",
    stderr: "piped",
  });

  const { success, stderr } = await command.output();

  if (!success) {
    const error = new TextDecoder().decode(stderr);
    throw new Error(`Failed to set DNS servers: ${error}`);
  }
}

/**
 * Remove DNS servers (set to empty)
 */
async function removeDNS(service: string): Promise<void> {
  const args = ["-setdnsservers", service, "Empty"];

  const command = new Deno.Command("networksetup", {
    args,
    stdout: "piped",
    stderr: "piped",
  });

  const { success, stderr } = await command.output();

  if (!success) {
    const error = new TextDecoder().decode(stderr);
    throw new Error(`Failed to remove DNS servers: ${error}`);
  }
}

/**
 * Parse DNS servers from arguments
 */
function parseDNSServers(args: string[]): {
  servers: string[];
  provider?: string;
} {
  // Check if first argument is a provider name
  const firstArg = args[0]?.toLowerCase();
  if (firstArg && DNS_PROVIDERS[firstArg]) {
    return { servers: DNS_PROVIDERS[firstArg], provider: firstArg };
  }

  // Check if it's a custom DNS (IP addresses)
  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  const customServers: string[] = [];

  for (const arg of args) {
    if (ipPattern.test(arg)) {
      customServers.push(arg);
    } else {
      break; // Stop at first non-IP argument
    }
  }

  if (customServers.length > 0) {
    return { servers: customServers };
  }

  // Default to shecan if no arguments
  return { servers: DNS_PROVIDERS.shecan, provider: "shecan" };
}

/**
 * Main CLI function
 */
async function main() {
  const args = Deno.args;
  const command = args[0]?.toLowerCase();

  try {
    // Show providers list
    if (command === "providers" || command === "list") {
      console.log("Available DNS providers:\n");
      for (const [name, servers] of Object.entries(DNS_PROVIDERS)) {
        console.log(`  ${name}:`);
        servers.forEach((server) => console.log(`    - ${server}`));
        console.log();
      }
      return;
    }

    const service = await getActiveService();

    if (command === "remove" || command === "clear" || command === "rm") {
      console.log(`Removing DNS servers from ${service}...`);
      await removeDNS(service);
      console.log(`✓ DNS servers removed successfully`);
    } else {
      // Parse DNS servers from arguments
      const dnsArgs = command === "set" ? args.slice(1) : args;
      const { servers, provider } = parseDNSServers(dnsArgs);

      // Set DNS servers
      console.log(`Setting DNS servers for ${service}...`);
      if (provider) {
        console.log(`Provider: ${provider}`);
      }
      await setDNS(service, servers);
      console.log(`✓ DNS servers set successfully:`);
      servers.forEach((server) => console.log(`  - ${server}`));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error:", message);
    Deno.exit(1);
  }
}

// Show help
if (Deno.args.includes("--help") || Deno.args.includes("-h")) {
  console.log(`
DNS Changer CLI for macOS

Usage:
  dns-changer [command] [provider|dns...]

Commands:
  set [provider|dns...]   Set DNS servers (default if no command specified)
  remove                   Remove DNS servers
  providers                List available DNS providers

Providers:
  shecan                   178.22.122.100, 185.51.200.2
  begzar                   185.55.226.26, 185.55.225.25, 185.55.224.24
  electro                  78.157.42.101, 78.157.42.100

Examples:
  # Set DNS using default provider (shecan)
  dns-changer
  dns-changer set

  # Set DNS using a provider
  dns-changer shecan
  dns-changer set begzar
  dns-changer set electro

  # Set custom DNS servers
  dns-changer 8.8.8.8 8.8.4.4
  dns-changer set 1.1.1.1 1.0.0.1

  # Remove DNS servers
  dns-changer remove

  # List available providers
  dns-changer providers
`);
  Deno.exit(0);
}

// Run main if this is the main module
if (import.meta.main) {
  await main();
}
