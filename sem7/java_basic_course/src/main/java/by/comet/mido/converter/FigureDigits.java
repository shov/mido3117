package by.comet.mido.converter;

/**
 * Digits
 */
public class FigureDigits implements IConvertingFigure {

    public enum KEY {dec, hex, bin}

    private Unit[] m_units;
    private int[] m_radixMap = {10, 16, 2};
    final private int MAX_LEN = 30;

    public FigureDigits() {
        String kind = this.getKind();

        String[] labels = {"dec", "hex", "bin"};

        m_units = new Unit[labels.length];

        for (int i = 0; i < labels.length; i++) {
            m_units[i] = new Unit(kind, i, labels[i]);
        }
    }

    @Override
    public Unit[] getUnits() {
        return m_units;
    }

    @Override
    public String getKind() {
        return this.getClass().toString();
    }

    @Override
    public boolean isValid(String value, int key) throws ConversionException {
        if (key < 0 || key > KEY.values().length) {
            throw new ConversionException("Unexpected, wrong key!");
        }

        if (null == value) {
            return false;
        }

        if (KEY.bin.ordinal() == key) {
            return value.matches("^[01]{1," + MAX_LEN + "}$");

        } else if (KEY.dec.ordinal() == key) {
            return value.matches("^[0-9]{1," + MAX_LEN + "}$");

        } else if (KEY.hex.ordinal() == key) {
            return value.matches("^[0-9A-Fa-f]{1," + MAX_LEN + "}$");
        }

        return false;
    }

    @Override
    public String getDefaultValue() {
        return "0";
    }

    @Override
    public String convert(String value, int fromKey, int toKey) throws ConversionException {
        if (fromKey < 0 || fromKey > KEY.values().length) {
            throw new ConversionException("Unexpected, wrong from key!");
        }

        if (toKey < 0 || toKey > KEY.values().length) {
            throw new ConversionException("Unexpected, wrong to key!");
        }

        if (!isValid(value, fromKey)) {
            throw new ConversionException("Invalid value for this converter given!");
        }

        int fromDigit = Integer.parseInt(value, m_radixMap[fromKey]);

        if (KEY.bin.ordinal() == toKey) {
            return Integer.toBinaryString(fromDigit);

        } else if (KEY.dec.ordinal() == toKey) {
            return Integer.toString(fromDigit);

        } else if (KEY.hex.ordinal() == toKey) {
            return Integer.toHexString(fromDigit).toUpperCase();
        }

        return "#ERROR";
    }
}
