package by.comet.mido.converter;

import java.util.Arrays;
import java.text.DecimalFormat;

/**
 * Mass (or Weight)
 */
public class FigureMass implements IConvertingFigure {

    public enum KEY {
        mg, g, kg, t
    }

    private final int FRACTION_MAX_LEN = 20;

    protected Unit[] m_units;

    private DecimalFormat m_big_double_formatter = new DecimalFormat("0.00000000000000000000");

    public FigureMass() {
        String kind = this.getClass().toString();

        String[] labels = {
                "mg", "g", "kg", "t"
        };

        m_units = new Unit[labels.length];

        for (int i = 0; i < labels.length; i++)
            m_units[i] = new Unit(kind, i, labels[i]);
    }

    public String getKind() {
        return this.getClass().toString();
    }

    public Unit[] getUnits() {
        return m_units;
    }

    public boolean isValid(String value) {
        String contentExp = "^(([1-9]+[0-9]*|[0-9])(\\.|\\.([0-9]|[0-9]*[1-9]+))?|(\\.([0-9]|[0-9]*[1-9]+)))$";

        int l = FRACTION_MAX_LEN;
        String lenExp = "^(\\d{1," + l + "}\\.?|\\d{0," + l + "}\\.\\d{1," + l + "})$";

        return value != null && value.matches(contentExp) && value.matches(lenExp);
    }

    public String getDefaultValue() {
        return "0";
    }

    public String convert(String value, int fromKey, int toKey) throws ConversionException {
        if (fromKey < 0 || fromKey > KEY.values().length) {
            throw new ConversionException("Unexpected, wrong from key!");
        }

        if (toKey < 0 || toKey > KEY.values().length) {
            throw new ConversionException("Unexpected, wrong to key!");
        }

        if (!isValid(value)) {
            throw new ConversionException("Invalid value for this converter given!");
        }

        String fixed = fixValue(value);

        //Since we support empty value, make it 0 if it came
        if (fixed.length() < 1) {
            fixed = "0.0";
        }

        fixed = fixed
                .replaceAll("^\\.", "0.")
                .replaceAll("\\.$", ".0")
                .replaceAll("^([^.]+)$", "$1.0");

        int diff = fromKey - toKey;
        boolean increase = diff > 0;

        if (diff == 0) {
            return fixed.replaceAll("\\.0$", "");
        }

        int STEP = 3; // 1kg -> 1000g
        diff = Math.abs(diff) * STEP;

        char[] spaceContent = new char[FRACTION_MAX_LEN];
        Arrays.fill(spaceContent, '0');
        String space = new String(spaceContent);

        fixed = increase ? fixed + space : space + fixed;

        int indexOfDot = fixed.indexOf('.');

        if (indexOfDot < 0) {
            throw new ConversionException("Unexpected, don must be in the fixed value!");
        }

        int newDotIndex = increase
                //add extra 1 because of old dot
                ? indexOfDot + diff + 1
                : indexOfDot - diff;

        fixed = new StringBuilder(fixed)
                .insert(newDotIndex, ".")
                .toString();

        fixed = increase
                ? fixed.replaceAll("^([^.]+)?(\\.)(.*)$", "$1$3")
                : fixed.replaceAll("^(.*)(\\.)([^.]+)$", "$1$3");

        fixed = cutOffZeros(fixed);

        //Handle MAX value length
        String fraction = fixed.replaceAll("^(.*)(\\.)([^.]+)$", "$3");

        if (fraction.length() > FRACTION_MAX_LEN) {
            //Try reduce
            fraction = "0." + fraction.substring(0, FRACTION_MAX_LEN - 1);
            fraction = cutOffZeros(fraction);
            if (fraction.length() > FRACTION_MAX_LEN) {
                throw new ConversionMaxValueException("Unexpected big fraction part of result " + fixed);
            }

            fraction = fraction.replace("0.", "");
        }

        String whole = fixed.replaceAll("^([^.]+)?(\\.)(.*)$", "$1");
        if (whole.length() > FRACTION_MAX_LEN) {
            throw new ConversionMaxValueException("Unexpected big whole part of result " + fixed);
        }

        return whole + (fraction.equals("0") ? "" : "." + fraction);
    }

    private String fixValue(String value) throws ConversionInvalidValueException {
        if(!isValid(value)) {
            throw new ConversionInvalidValueException("Not valid value!");
        }

        double numeric = Double.parseDouble(value.trim());
        String clean = m_big_double_formatter.format(numeric);

        return cutOffZeros(clean);
    }

    private String cutOffZeros(String value) {
        return value
                .replaceAll("^([0]*)(([1-9]|0)[0-9]*\\.([0-9]*[1-9]|0))([0]*)$", "$2");
    }
}
