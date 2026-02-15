import subprocess
import sys
from pathlib import Path


SECRETS_FILE = ".env.secrets"

# Required secrets
REQUIRED_KEYS = [
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "GITHUB_CLIENT_SECRET",
    "GOOGLE_CLIENT_SECRET",
    "DISCORD_CLIENT_SECRET",
    "UPLOADTHING_TOKEN",
]


def load_env_file(filepath: str) -> dict:
    """
    Load .env-style file into a dictionary.
    """
    path = Path(filepath)

    if not path.exists():
        print(f"File not found: {filepath}")
        sys.exit(1)

    secrets_map = {}

    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()

            # Ignore empty lines and comments
            if not line or line.startswith("#"):
                continue

            if "=" not in line:
                continue

            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")

            secrets_map[key] = value

    return secrets_map


def validate_required_keys(secrets_map: dict):
    missing = [key for key in REQUIRED_KEYS if key not in secrets_map]

    if missing:
        print("Missing required secrets in .env.secrets:")
        for key in missing:
            print(f"   - {key}")
        sys.exit(1)


def upload_secret(key: str, value: str):
    """
    Run: wrangler secret put KEY
    and pipe the value via stdin.
    """
    print(f"Uploading {key}...")

    process = subprocess.run(
        ["pnpm", "dlx", "wrangler", "versions", "secret", "put", key],
        input=value.encode(),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    if process.returncode != 0:
        print(f"Failed to upload {key}")
        print(process.stderr.decode())
        sys.exit(1)

    print(f"{key} uploaded successfully.")


def main():
    print("Loading secrets from .env.secrets...")
    secrets_map = load_env_file(SECRETS_FILE)

    validate_required_keys(secrets_map)

    print("Uploading secrets to Cloudflare Workers...\n")

    for key in REQUIRED_KEYS:
        upload_secret(key, secrets_map[key])

    print("\nAll secrets uploaded successfully!")


if __name__ == "__main__":
    main()
