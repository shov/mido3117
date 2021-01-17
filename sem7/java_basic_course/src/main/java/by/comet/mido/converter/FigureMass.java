package by.comet.mido.converter;

import java.util.regex.Pattern;

/**
 * Mass (or Weight)
 */
public class FigureMass implements IConvertingFigure {
    private final String[] m_labels = {
            "mg", "g", "kg", "t"
    };

    private enum KEY {
        mg, g, kg, t
    }

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
        m_valueRegExPattern = Pattern.compile("^([0-9]{1,20}(\\.[0-9]{1,20}|\\.)?|\\.[0-9]{1,20})$");
        m_valueRegExPatternTrailDot = Pattern.compile("^[0-9]{1,20}\\.$");
        m_valueRegExPatternLeadDot = Pattern.compile("^\\.[0-9]{1,20}$");
        m_valueRegExPatternNoDot = Pattern.compile("^[0-9]{1,20}$");
    }

    public String getKind() {
        return this.getClass().toString();
    }

    public Figure[] getFigures() {
        return m_figures;
    }

    public String fixValue(String value) {
        if(value.length() == 0) {
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
        String clean = String.valueOf(Double.parseDouble(value.trim()));

        if(m_valueRegExPatternTrailDot.matcher(value).matches()) {
            return clean.replace(".0", ".");
        }

        if(m_valueRegExPatternLeadDot.matcher(value).matches()) {
            return clean.replace("0.", ".");
        }

        if(m_valueRegExPatternNoDot.matcher(value).matches()) {
            return clean.replace(".0", "");
        }

        return clean;
    }

    public String convert(int fromKey, int toKey, String value) throws ConversionException {
        if(fromKey < 0 || fromKey > KEY.values().length) {
            throw new ConversionException("Unexpected, wrong from key!");
        }

        if(toKey < 0 || toKey > KEY.values().length) {
            throw new ConversionException("Unexpected, wrong to key!");
        }

        double numericFrom = Double.parseDouble(fixValue(value));
        return String.valueOf(convertOnMg(numericFrom, KEY.values()[fromKey], KEY.values()[toKey]));
    }

    private double convertOnMg(double source, KEY from, KEY to) {
        //g -> 1000 mg
        //kg -> 1000 g
        //t -> 1000 kg

        double multiplier = 1.0d;
        int step = 1000;
        int diff = from.ordinal() - to.ordinal();
        boolean increase = diff > 0;

        if(diff == 0) {
            return source;
        }

        diff = Math.abs(diff);

        for (int i = 0; i < diff; i++) {
            if(increase) {
                multiplier *= step;
            } else {
                multiplier /= step;
            }
        }

        return source * multiplier;
    }
}
