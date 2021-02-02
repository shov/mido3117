package by.comet.mido.ui;

import javax.swing.*;
import java.awt.event.*;

/**
 * MVC Controller
 * Tides up view events to actions that interacts with the model
 */
class MainWindowController {
    private MainWindowModel m_model;
    private MainWindowView m_view;

    MainWindowController(MainWindowModel model, MainWindowView view) {
        m_model = model;
        m_view = view;

        setListeners();
    }

    private void setListeners() {
        m_view.addDirectionSwapListener(event -> {
            m_model.swapDirection();
            try {
                m_view.refreshDirection();
            } catch (Exception ex) {
                ex.printStackTrace();
                m_model.swapDirection(); //back
                m_view.showError("Cannot swap! 😕");
            }

            try {
                m_view.convert();
            } catch (Exception e) {
                e.printStackTrace();
                m_view.showError("Cannot convert after swap! 😕");
            }
        });

        m_view.addFieldsKeyListener(new KeyListener() {
            public void keyTyped(KeyEvent event) {
            }

            public void keyPressed(KeyEvent event) {
            }

            public void keyReleased(KeyEvent event) {
                if (event.getKeyCode() == KeyEvent.VK_ENTER) {
                    try {
                        m_view.convert();
                    } catch (Exception e) {
                        e.printStackTrace();
                        m_view.showError("Cannot handle Enter releasing! 😕");
                    }
                }
            }
        });

        m_view.addComboChangeListener(event -> {
            try {
                m_view.refreshOfChangedCombo((JComboBox) event.getSource());
            } catch (Exception e) {
                e.printStackTrace();
                m_view.showError("Cannot handle switching combo! 😕");
            }
        });

        m_view.addConvertListener(event -> {
            try {
                m_view.convert();
            } catch (Exception e) {
                e.printStackTrace();
                m_view.showError("Cannot convert! 😕");
            }
        });
    }
}
