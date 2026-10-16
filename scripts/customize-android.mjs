// Run after `npx cap add android`. Makes the Android app fullscreen (hides the status and
// navigation bars, which reappear for a moment when you swipe from the screen edge).
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const { appId } = JSON.parse(readFileSync("capacitor.config.json", "utf8"));

if (!existsSync("android")) {
  throw new Error("The android/ project is missing. Run `npx cap add android` first.");
}

const javaDir = join("android", "app", "src", "main", "java", ...appId.split("."));
mkdirSync(javaDir, { recursive: true });
for (const file of readdirSync(javaDir)) {
  if (/^MainActivity\.(java|kt)$/.test(file)) rmSync(join(javaDir, file));
}

const source = `package ${appId};

import android.os.Bundle;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        enterImmersiveMode();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            enterImmersiveMode();
        }
    }

    private void enterImmersiveMode() {
        WindowInsetsControllerCompat controller =
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        controller.hide(WindowInsetsCompat.Type.systemBars());
    }
}
`;

writeFileSync(join(javaDir, "MainActivity.java"), source);
console.log(`Fullscreen MainActivity written to ${join(javaDir, "MainActivity.java")}`);
