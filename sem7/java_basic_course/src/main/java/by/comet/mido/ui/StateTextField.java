package by.comet.mido.ui;

import javax.swing.*;

/**
 * A text field who remember it's previous value
 * and a kind
 */
public class StateTextField extends JTextField {
    public static final String ERROR_TEXT = "#ERROR";


    private String m_kind = null;

    public void setKind(String kind) {
        m_kind = kind;
    }

    public String getKind() {
        return m_kind;
    }

}
