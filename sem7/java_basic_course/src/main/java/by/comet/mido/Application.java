package by.comet.mido;

import by.comet.mido.ui.MainWindow;

/**
 * Application EP
 */
public class Application {

    public static void main(String[] args) {
        try {
            MainWindow.start();
        } catch (Throwable e) {
            System.err.println("Cannot start window!");
            e.printStackTrace();
        }
    }
}
