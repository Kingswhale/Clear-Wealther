package com.meetfaced.app;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.rnim.rn.audio.ReactNativeAudioPackage;
import co.apptailor.googlesignin.RNGoogleSigninPackage;
import com.facebook.CallbackManager;
import com.facebook.FacebookSdk;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.goldenowl.twittersignin.TwitterSigninPackage;
import com.sbugert.rnadmob.RNAdMobPackage;
import com.zmxv.RNSound.RNSoundPackage;
import cl.json.RNSharePackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.tanguyantoine.react.MusicControl;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import io.invertase.firebase.RNFirebasePackage;
import com.dylanvann.fastimage.FastImageViewPackage;
import com.reactnativedocumentpicker.ReactNativeDocumentPicker;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;
import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

    private static CallbackManager mCallbackManager = CallbackManager.Factory.create();

  protected static CallbackManager getCallbackManager() {
    return mCallbackManager;
  }

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new ReactNativeAudioPackage(),
            new RNGoogleSigninPackage(),

            new TwitterSigninPackage(),
            new FBSDKPackage(mCallbackManager),
            new RNAdMobPackage(),
            new RNSoundPackage(),
            new RNSharePackage(),
            new MusicControl(),
            new PickerPackage(),
            new RNFirebasePackage(),
            new RNI18nPackage(),
            new FastImageViewPackage(),
            new RNFirebaseMessagingPackage(),
            new ReactNativeDocumentPicker(),
            new SplashScreenReactPackage(),
            new RNFirebaseNotificationsPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
