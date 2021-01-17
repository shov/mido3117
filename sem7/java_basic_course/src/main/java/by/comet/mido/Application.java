package by.comet.mido;

import by.comet.mido.ui.MainWindow;

import java.util.Locale;

/**
 * Application EP
 */
public class Application {

    public static void main(String[] args) {
        //Affects decimal separator
        Locale.setDefault(new Locale("en", "US"));

        try {
            MainWindow.start();
        } catch (Throwable e) {
            System.err.println("Cannot start window!");
            e.printStackTrace();
        }
    }
}
