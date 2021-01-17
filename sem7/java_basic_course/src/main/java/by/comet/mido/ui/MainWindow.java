package by.comet.mido.ui;

/**
 * Creates MVC and start Swing in a parallel thread
 */
public class MainWindow {
    static public void start() {
        java.awt.EventQueue.invokeLater(new Runnable() {
            public void run() {
                try {
                    MainWindowModel model = new MainWindowModel();
                    MainWindowView view = new MainWindowView(model);
                    new MainWindowController(model, view);

                    view.setVisible(true);
                } catch (Exception e) {
                    e.printStackTrace();
                    System.exit(1);
                }
            }
        });
    }
}
