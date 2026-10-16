#!/usr/bin/env bash
# Run on a Mac after `npx cap add ios`. Hides the iPhone status bar so the game is fullscreen.
# These are cosmetic tweaks, so a failure here never stops the build.
PLIST="ios/App/App/Info.plist"
PB=/usr/libexec/PlistBuddy

if [ ! -f "$PLIST" ]; then
  echo "Info.plist not found at $PLIST (is the iOS project created?)"
  exit 0
fi

set_bool() {
  "$PB" -c "Set :$1 $2" "$PLIST" 2>/dev/null || "$PB" -c "Add :$1 bool $2" "$PLIST" 2>/dev/null || true
}

set_bool UIStatusBarHidden true
set_bool UIViewControllerBasedStatusBarAppearance false
echo "iOS status bar set to hidden."
exit 0
