package by.comet.mido.converter;

/**
 * A figure like kg or m
 */
public class Unit {
    private String m_label;
    private String m_kind;
    private int m_key;

    Unit(String kind, int key, String label) {
        m_kind = kind;
        m_key = key;
        m_label = label;
    }

    public String getKind() {
        return m_kind;
    }

    public int getKey() {
        return m_key;
    }

    public String getLabel() {
        return m_label;
    }
}
