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
}
