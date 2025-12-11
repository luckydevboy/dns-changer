# DNS Changer CLI for macOS

A simple Deno CLI application to set or remove DNS servers on macOS with support for predefined providers and custom DNS servers.

## Installation

### Run directly with Deno

```bash
deno run --allow-run main.ts
```

### Install as a global command

```bash
deno task install
```

After installation, you can use `dns-changer` from anywhere.

### Compile to standalone executable

```bash
deno task compile
# or
deno compile --allow-run --output dns-changer main.ts
```

## Usage

### Set DNS using default provider (shecan)

```bash
dns-changer
# or
dns-changer set
```

### Set DNS using a provider

```bash
dns-changer shecan
dns-changer begzar
dns-changer electro
# or
dns-changer set shecan
```

### Set custom DNS servers

```bash
dns-changer 8.8.8.8 8.8.4.4
dns-changer set 1.1.1.1 1.0.0.1
```

### Remove DNS servers

```bash
dns-changer remove
```

### List available providers

```bash
dns-changer providers
```

## Available Providers

- **shecan**: 178.22.122.100, 185.51.200.2
- **begzar**: 185.55.226.26, 185.55.225.25, 185.55.224.24
- **electro**: 78.157.42.101, 78.157.42.100

## Commands

- `set [provider|dns...]` - Set DNS servers (default if no command specified)
- `remove` - Remove DNS servers
- `providers` - List available DNS providers

## Permissions

This script requires the `--allow-run` permission to execute the `networksetup` command.

## Requirements

- macOS (uses `networksetup` command)
- Deno runtime