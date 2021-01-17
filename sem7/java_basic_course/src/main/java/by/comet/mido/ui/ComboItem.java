package by.comet.mido.ui;

/**
 * ComboBox item
 */
class ComboItem {
    private String m_label;
    private String m_kind;
    private int m_key;

    ComboItem(String kind, int key, String label) {
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

    /**
     * @return text representation as label
     */
    @Override
    public String toString() {
        return m_label;
    }
}
