package by.comet.mido.converter;

import java.util.regex.Pattern;

/**
 * general for all figures kinds
 */
public interface IConvertingFigure {
    /**
     * @return kit of provided figures
     */
    public Figure[] getFigures();

    /**
     * @return kind of unique kind :)
     */
    public String getKind();

    /**
     * @param value
     * @return corrected value (validation + normalization)
     */
    public String fixValue(String value);

    /**
     * @param value
     * @param fallbackValue
     * @return corrected value, fallback if not valid
     */
    public String fixValue(String value, String fallbackValue);
}
