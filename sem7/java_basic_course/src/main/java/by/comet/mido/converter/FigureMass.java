package by.comet.mido.converter;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.util.regex.Pattern;

/**
 * Mass (or Weight)
 */
public class FigureMass implements IConvertingFigure {
    private final String[] m_labels = {
            "mg", "g", "kg", "t"
    };

    public enum KEY {
        mg, g, kg, t
    }

    private final int FRACTION_MAX_LEN = 20;

    private String m_kind;
    private Figure[] m_figures;

    private Pattern m_valueRegExPattern;
    private Pattern m_valueRegExPatternTrailDot;
    private Pattern m_valueRegExPatternLeadDot;
    private Pattern m_valueRegExPatternNoDot;

    public FigureMass() {
        //Set kind and figures
        m_kind = this.getClass().toString();
        m_figures = new Figure[m_labels.length];
        for (int i = 0; i < m_labels.length; i++) {
            m_figures[i] = new Figure(m_kind, i, m_labels[i]);
        }

        //Set mather
        int l = FRACTION_MAX_LEN;
        m_valueRegExPattern = Pattern
                .compile("^([0-9]{1," + l + "}(\\.[0-9]{1," + l + "}|\\.)?|\\.[0-9]{1," + l + "})$");

        m_valueRegExPatternTrailDot = Pattern.compile("^[0-9]{1," + l + "}\\.$");
        m_valueRegExPatternLeadDot = Pattern.compile("^\\.[0-9]{1," + l + "}$");
        m_valueRegExPatternNoDot = Pattern.compile("^[0-9]{1," + l + "}$");
    }

    public String getKind() {
        return this.getClass().toString();
    }

    public Figure[] getFigures() {
        return m_figures;
    }

    public String fixValue(String value) {
        if (value.length() == 0) {
            return value; //Empty is allowed, it equals 0
        }

        if (!m_valueRegExPattern.matcher(value.trim()).matches()) {
            return String.valueOf(Double.parseDouble("0")); //Initial
        }

        return fixLeadsNTrails(value);
    }

    public String fixValue(String value, String fallbackValue) {
        if (!m_valueRegExPattern.matcher(value.trim()).matches()) {
            return fixValue(fallbackValue);
        }

        return fixLeadsNTrails(value);
    }

    private String fixLeadsNTrails(String value) {
        String clean = Double.toString(Double.parseDouble(value.trim()));

        if (m_valueRegExPatternTrailDot.matcher(value).matches()) {
            return clean.replace(".0", ".");
        }

        if (m_valueRegExPatternLeadDot.matcher(value).matches()) {
            return clean.replace("0.", ".");
        }

        if (m_valueRegExPatternNoDot.matcher(value).matches()) {
            return clean.replace(".0", "");
        }

        return clean;
    }

    public String convert(String value, int fromKey, int toKey) throws ConversionException {
        if (fromKey < 0 || fromKey > KEY.values().length) {
            throw new ConversionException("Unexpected, wrong from key!");
        }

        if (toKey < 0 || toKey > KEY.values().length) {
            throw new ConversionException("Unexpected, wrong to key!");
        }

        String fixed = fixValue(value);

        //Since we support empty value, make it 0 if it came
        double numericFrom = Double.parseDouble(fixed.length() > 0 ? fixed : "0");
        double computed = compute(numericFrom, KEY.values()[fromKey], KEY.values()[toKey]);

        BigDecimal computedWrapped = new BigDecimal(computed, new MathContext(20, RoundingMode.HALF_UP));

        String whole = computedWrapped.toPlainString();
        String fraction = ".0";

        if (whole.indexOf('.') >= 0) {
            fraction = whole.substring(whole.indexOf('.'))
                    .replaceAll("^\\.([0-9]{" + FRACTION_MAX_LEN + "})(.+)$", ".$1")
                    .replaceAll("0+$", "");

            whole = whole.substring(0, whole.indexOf('.'));
        }
        return whole + fraction;
    }

    protected double compute(double source, KEY from, KEY to) {
        //g -> 1000 mg
        //kg -> 1000 g
        //t -> 1000 kg

        BigDecimal multiplier = new BigDecimal("1.0");
        BigDecimal step = new BigDecimal("1000");
        int diff = from.ordinal() - to.ordinal();
        boolean increase = diff > 0;

        if (diff == 0) {
            return source;
        }

        diff = Math.abs(diff);

        for (int i = 0; i < diff; i++) {
            if (increase) {
                multiplier = multiplier.multiply(step);
            } else {
                multiplier = multiplier.divide(step);
            }
        }

        return new BigDecimal(Double.toString(source)).multiply(multiplier).doubleValue();
    }
}
