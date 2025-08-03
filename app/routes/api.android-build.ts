import { type ActionFunctionArgs, json } from '@remix-run/cloudflare';
import JSZip from 'jszip';

interface AndroidBuildRequest {
  projectFiles: Record<string, string>;
  appName: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  iconUrl?: string;
  buildType: 'debug' | 'release';
}

interface AndroidBuildResponse {
  success: boolean;
  downloadUrl?: string;
  buildId?: string;
  error?: string;
  buildTime?: number;
}

// Android project template structure
const ANDROID_TEMPLATE = {
  'app/build.gradle': (appName: string, packageName: string, versionName: string, versionCode: number) => `
plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace '${packageName}'
    compileSdk 34

    defaultConfig {
        applicationId "${packageName}"
        minSdk 24
        targetSdk 34
        versionCode ${versionCode}
        versionName "${versionName}"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary true
        }
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = '1.8'
    }
    buildFeatures {
        compose true
    }
    composeOptions {
        kotlinCompilerExtensionVersion '1.5.1'
    }
    packaging {
        resources {
            excludes += '/META-INF/{AL2.0,LGPL2.1}'
        }
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.lifecycle:lifecycle-runtime-ktx:2.7.0'
    implementation 'androidx.activity:activity-compose:1.8.2'
    implementation platform('androidx.compose:compose-bom:2023.08.00')
    implementation 'androidx.compose.ui:ui'
    implementation 'androidx.compose.ui:ui-graphics'
    implementation 'androidx.compose.ui:ui-tooling-preview'
    implementation 'androidx.compose.material3:material3'
    implementation 'androidx.webkit:webkit:1.8.0'
    
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
    androidTestImplementation platform('androidx.compose:compose-bom:2023.08.00')
    androidTestImplementation 'androidx.compose.ui:ui-test-junit4'
    debugImplementation 'androidx.compose.ui:ui-tooling'
    debugImplementation 'androidx.compose.ui:ui-test-manifest'
}`,

  'app/src/main/AndroidManifest.xml': (appName: string, _packageName: string) => `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="${appName}"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.${appName.replace(/\s/g, '')}"
        tools:targetApi="31">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="${appName}"
            android:theme="@style/Theme.${appName.replace(/\s/g, '')}"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,

  'app/src/main/java/MainActivity.kt': (_packageName: string) => `package ${_packageName}

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import ${_packageName}.ui.theme.AppTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AppTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    WebViewScreen()
                }
            }
        }
    }
}`,

  'app/src/main/java/WebViewScreen.kt': (_packageName: string) => `package ${_packageName}

import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView

@Composable
fun WebViewScreen() {
    AndroidView(
        modifier = Modifier.fillMaxSize(),
        factory = { context ->
            WebView(context).apply {
                webViewClient = WebViewClient()
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                settings.allowFileAccess = true
                settings.allowContentAccess = true
                
                // Load the web app
                loadUrl("file:///android_asset/www/index.html")
            }
        }
    )
}`,

  'build.gradle':
    () => `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    id 'com.android.application' version '8.1.1' apply false
    id 'org.jetbrains.kotlin.android' version '1.8.10' apply false
}`,

  'gradle.properties': () => `# Project-wide Gradle settings.
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
kotlin.code.style=official
android.nonTransitiveRClass=true`,

  'settings.gradle': (appName: string) => `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "${appName}"
include ':app'`,
};

export async function action({ request }: ActionFunctionArgs): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const buildRequest: AndroidBuildRequest = await request.json();
    const { projectFiles, appName, packageName, versionName, versionCode } = buildRequest;

    const startTime = Date.now();

    // Create Android project structure
    const zip = new JSZip();

    // Add Android project files
    zip.file('app/build.gradle', ANDROID_TEMPLATE['app/build.gradle'](appName, packageName, versionName, versionCode));
    zip.file(
      'app/src/main/AndroidManifest.xml',
      ANDROID_TEMPLATE['app/src/main/AndroidManifest.xml'](appName, packageName),
    );

    // Create package directory structure
    const packagePath = packageName.replace(/\./g, '/');
    zip.file(
      `app/src/main/java/${packagePath}/MainActivity.kt`,
      ANDROID_TEMPLATE['app/src/main/java/MainActivity.kt'](packageName),
    );
    zip.file(
      `app/src/main/java/${packagePath}/WebViewScreen.kt`,
      ANDROID_TEMPLATE['app/src/main/java/WebViewScreen.kt'](packageName),
    );

    zip.file('build.gradle', ANDROID_TEMPLATE['build.gradle']());
    zip.file('gradle.properties', ANDROID_TEMPLATE['gradle.properties']());
    zip.file('settings.gradle', ANDROID_TEMPLATE['settings.gradle'](appName));

    // Add web assets
    const assetsFolder = zip.folder('app/src/main/assets/www');

    // Process project files and add them to assets
    for (const [filePath, content] of Object.entries(projectFiles)) {
      if (
        filePath.endsWith('.html') ||
        filePath.endsWith('.js') ||
        filePath.endsWith('.css') ||
        filePath.endsWith('.json') ||
        filePath.endsWith('.png') ||
        filePath.endsWith('.jpg') ||
        filePath.endsWith('.svg') ||
        filePath.endsWith('.ico')
      ) {
        assetsFolder?.file(filePath, content);
      }
    }

    // Add default Android resources
    zip.file(
      'app/src/main/res/values/colors.xml',
      `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="purple_200">#FFBB86FC</color>
    <color name="purple_500">#FF6200EE</color>
    <color name="purple_700">#FF3700B3</color>
    <color name="teal_200">#FF03DAC5</color>
    <color name="teal_700">#FF018786</color>
    <color name="black">#FF000000</color>
    <color name="white">#FFFFFFFF</color>
</resources>`,
    );

    zip.file(
      'app/src/main/res/values/strings.xml',
      `<resources>
    <string name="app_name">${appName}</string>
</resources>`,
    );

    zip.file(
      'app/src/main/res/values/themes.xml',
      `<resources xmlns:tools="http://schemas.android.com/tools">
    <style name="Theme.${appName.replace(/\s/g, '')}" parent="Theme.Material3.DayNight">
        <item name="colorPrimary">@color/purple_500</item>
        <item name="colorPrimaryVariant">@color/purple_700</item>
        <item name="colorOnPrimary">@color/white</item>
        <item name="colorSecondary">@color/teal_200</item>
        <item name="colorSecondaryVariant">@color/teal_700</item>
        <item name="colorOnSecondary">@color/black</item>
    </style>
</resources>`,
    );

    // Add gradle wrapper
    zip.file(
      'gradle/wrapper/gradle-wrapper.properties',
      `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.0-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists`,
    );

    zip.file(
      'gradlew',
      `#!/usr/bin/env sh
./gradlew build`,
    );

    // Add build instructions
    zip.file(
      'BUILD_INSTRUCTIONS.md',
      `# Android Build Instructions

## Prerequisites
- Android Studio or Android SDK
- Java 8 or higher
- Gradle 8.0+

## Build Steps
1. Extract this ZIP file
2. Open terminal in the extracted directory
3. Run: \`./gradlew assembleDebug\` (for debug build)
4. Or run: \`./gradlew assembleRelease\` (for release build)
5. Find APK in: \`app/build/outputs/apk/\`

## Alternative: Android Studio
1. Open the project in Android Studio
2. Build > Generate Signed Bundle / APK
3. Choose APK and follow the wizard

Your web app will be accessible as a native Android app!
`,
    );

    // Generate the ZIP file
    const zipBlob = await zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    const buildTime = Date.now() - startTime;
    const buildId = `android_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;

    /*
     * In a real implementation, you would:
     * 1. Save the ZIP to a storage service (S3, etc.)
     * 2. Trigger an actual Android build process
     * 3. Return a real download URL
     */

    // For now, we'll create a data URL for the ZIP
    const base64 = Buffer.from(zipBlob).toString('base64');
    const downloadUrl = `data:application/zip;base64,${base64}`;

    const response: AndroidBuildResponse = {
      success: true,
      downloadUrl,
      buildId,
      buildTime,
    };

    return json(response);
  } catch (error) {
    console.error('Android build error:', error);
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    );
  }
}
