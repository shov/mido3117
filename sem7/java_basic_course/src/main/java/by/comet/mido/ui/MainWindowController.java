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
                m_view.showError("Something goes wrong X0");
            }

            try {
                m_view.convert();
            } catch (Exception e) {
                e.printStackTrace();
                m_view.showError("Something goes wrong X0.3");
            }
        });

        m_view.addFieldsKeyListener(new KeyListener() {
            public void keyTyped(KeyEvent event) {
            }

            public void keyPressed(KeyEvent event) {
            }

            public void keyReleased(KeyEvent event) {
                StateTextField field = (StateTextField) event.getSource();
                boolean isEdited = event.getKeyCode() == KeyEvent.VK_DELETE
                        || event.getKeyCode() == KeyEvent.VK_BACK_SPACE;
                boolean isNotControl = !Character.isISOControl(event.getKeyCode());

                if (isEdited || isNotControl) {
                    int caretPos = field.getCaretPosition();
                    try {
                        m_view.updateFieldText(field);
                    } catch (Exception ex) {
                        ex.printStackTrace();
                        m_view.showError("Something goes wrong X1");
                    }

                    if (field.getText().length() > caretPos) {
                        field.setCaretPosition(caretPos);
                    }

                } else {
                    event.consume();
                }

                if (event.getKeyCode() == KeyEvent.VK_ENTER) {
                    try {
                        m_view.convert();
                    } catch (Exception e) {
                        e.printStackTrace();
                        m_view.showError("Something goes wrong X1.3");
                    }
                }
            }
        });

        m_view.addComboChangeListener(event -> {
            try {
                m_view.refreshOfChangedCombo((JComboBox) event.getSource());
            } catch (Exception e) {
                e.printStackTrace();
                m_view.showError("Something goes wrong X2");
            }
        });

        m_view.addConvertListener(event -> {
            try {
                m_view.convert();
            } catch (Exception e) {
                e.printStackTrace();
                m_view.showError("Something goes wrong X3");
            }
        });
    }
}
