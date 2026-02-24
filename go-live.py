#!/usr/bin/env python3
"""Post go-live announcements to Bluesky, Twitter, and clipboard (for Discord)."""

import argparse
import os
import subprocess
import sys

from dotenv import load_dotenv


def load_config():
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".go-live.env")
    if not os.path.exists(env_path):
        print(f"ERROR: Config file not found: {env_path}")
        print("Copy .go-live.env.example and fill in your credentials.")
        sys.exit(1)
    load_dotenv(env_path)


def build_message(custom_message=None):
    stream_url = os.environ.get("STREAM_URL", "")
    if custom_message:
        # If the custom message contains {stream_url}, substitute it
        return custom_message.replace("{stream_url}", stream_url)
    default = os.environ.get("DEFAULT_MESSAGE", "Going live now! Come hang out: {stream_url}")
    return default.replace("{stream_url}", stream_url)


def post_bluesky(message, dry_run=False):
    handle = os.environ.get("BSKY_HANDLE", "")
    password = os.environ.get("BSKY_APP_PASSWORD", "")
    if not handle or not password or handle == "your.handle.bsky.social":
        return "SKIPPED (no credentials configured)"

    if dry_run:
        return "DRY RUN (would post)"

    try:
        from atproto import Client

        client = Client()
        client.login(handle, password)
        client.send_post(text=message)
        return "OK"
    except Exception as e:
        return f"FAILED ({e})"


def post_twitter(message, dry_run=False):
    api_key = os.environ.get("TWITTER_API_KEY", "")
    api_secret = os.environ.get("TWITTER_API_SECRET", "")
    access_token = os.environ.get("TWITTER_ACCESS_TOKEN", "")
    access_secret = os.environ.get("TWITTER_ACCESS_SECRET", "")

    if not all([api_key, api_secret, access_token, access_secret]):
        return "SKIPPED (no credentials configured)"

    if dry_run:
        return "DRY RUN (would post)"

    try:
        import tweepy

        client = tweepy.Client(
            consumer_key=api_key,
            consumer_secret=api_secret,
            access_token=access_token,
            access_token_secret=access_secret,
        )
        client.create_tweet(text=message)
        return "OK"
    except Exception as e:
        return f"FAILED ({e})"


def copy_to_clipboard(message, dry_run=False):
    if dry_run:
        return "DRY RUN (would copy)"

    try:
        proc = subprocess.run(
            ["pbcopy"], input=message.encode(), check=True, capture_output=True
        )
        return "OK (copied to clipboard)"
    except FileNotFoundError:
        return "FAILED (pbcopy not found - macOS only)"
    except Exception as e:
        return f"FAILED ({e})"


def main():
    parser = argparse.ArgumentParser(description="Announce going live across platforms")
    parser.add_argument("message", nargs="?", help="Custom message (default from .go-live.env)")
    parser.add_argument("--skip", action="append", default=[], help="Platforms to skip (bluesky, twitter, discord)")
    parser.add_argument("--dry-run", action="store_true", help="Show what would happen without posting")
    parser.add_argument("--open-discord", action="store_true", help="Open Discord app after copying")
    args = parser.parse_args()

    load_config()
    message = build_message(args.message)
    skip = [s.lower() for s in args.skip]

    print(f"Message: {message}")
    print(f"{'(DRY RUN)' if args.dry_run else ''}")
    print()

    results = {}

    if "bluesky" not in skip:
        results["Bluesky"] = post_bluesky(message, args.dry_run)
    else:
        results["Bluesky"] = "SKIPPED (--skip)"

    if "twitter" not in skip:
        results["Twitter"] = post_twitter(message, args.dry_run)
    else:
        results["Twitter"] = "SKIPPED (--skip)"

    if "discord" not in skip:
        results["Discord"] = copy_to_clipboard(message, args.dry_run)
        if args.open_discord and not args.dry_run:
            subprocess.run(["open", "-a", "Discord"], check=False)
    else:
        results["Discord"] = "SKIPPED (--skip)"

    print("Results:")
    for platform, status in results.items():
        print(f"  {platform}: {status}")


if __name__ == "__main__":
    main()
