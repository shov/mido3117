package by.comet.mido.ui;

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
        m_view.addDirectionSwapListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                try {
                    m_view.convert();
                } catch (Exception ex) {
                    ex.printStackTrace();
                    m_view.showError("Something goes wrong X0.3");
                }

                m_model.swapDirection();
                try {
                    m_view.refreshDirection();
                } catch (Exception ex) {
                    ex.printStackTrace();
                    m_model.swapDirection(); //back
                    m_view.showError("Something goes wrong X0");
                }
            }
        });

        m_view.addFieldsKeyListener(new KeyListener() {
            public void keyTyped(KeyEvent e) {
            }

            public void keyPressed(KeyEvent e) {
            }

            public void keyReleased(KeyEvent e) {
                StateTextField field = (StateTextField) e.getSource();
                boolean isEdited = e.getKeyCode() == KeyEvent.VK_DELETE
                        || e.getKeyCode() == KeyEvent.VK_BACK_SPACE;
                boolean isNotControl = !Character.isISOControl(e.getKeyCode());

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
                    e.consume();
                }

                if (e.getKeyCode() == KeyEvent.VK_ENTER) {
                    try {
                        m_view.convert();
                    } catch (Exception ex) {
                        ex.printStackTrace();
                        m_view.showError("Something goes wrong X1.3");
                    }
                }
            }
        });

        m_view.addComboChangeListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                try {
                    m_view.refreshState();
                } catch (Exception ex) {
                    ex.printStackTrace();
                    m_view.showError("Something goes wrong X2");
                }
            }
        });

        m_view.addConverListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                try {
                    m_view.convert();
                } catch (Exception ex) {
                    ex.printStackTrace();
                    m_view.showError("Something goes wrong X3");
                }
            }
        });
    }
}
