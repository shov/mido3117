package by.comet.mido.ui;

import javax.swing.*;

/**
 * A text field who remember it's previous value
 * and a kind
 */
public class StateTextField extends JTextField {
    public static final String DEFAULT_TEXT = "#DEFAULT#";
    public static final String ERROR_TEXT = "#ERROR";

    private String m_lastText = DEFAULT_TEXT;

    private String m_kind = null;

    public String getLastText() {
        return m_lastText;
    }

    public void setKind(String kind) {
        m_kind = kind;
    }

    public String getKind() {
        return m_kind;
    }

    @Override
    public void setText(String t) {
        if (!getText().equals(t) && !ERROR_TEXT.equals(t)) {
            m_lastText = getText();
        }

        super.setText(t);
    }

    public StateTextField() {
        super();
        setText(DEFAULT_TEXT);
    }
}
