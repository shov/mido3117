package by.comet.mido.converter;

/**
 * Digits
 */
public class FigureDigits implements IConvertingFigure {

    public enum KEY { dec, hex, bin }

    protected Unit[] m_units;

    public FigureDigits() {
        String kind = this.getKind();

        String[] labels = {"dec", "hex", "bim"};

        m_units = new Unit[labels.length];

        for(int i = 0; i < labels.length; i++) {
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
    public boolean isValid(String value) {
        return false;
    }

    @Override
    public String getDefaultValue() {
        return null;
    }

    @Override
    public String convert(String value, int fromKey, int toKey) throws ConversionException {
        return null;
    }
}
