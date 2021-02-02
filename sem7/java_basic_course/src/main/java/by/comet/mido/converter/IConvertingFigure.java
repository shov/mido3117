package by.comet.mido.converter;

/**
 * general for all figures kinds
 */
public interface IConvertingFigure {
    /**
     * @return kit of provided units
     */
    public Unit[] getUnits();

    /**
     * @return kind of unique kind :)
     */
    public String getKind();

    /**
     * Validate income value
     * @param value
     * @return is it valid
     */
    public boolean isValid(String value);

    /**
     * @return valid default value
     */
    public String getDefaultValue();

    /**
     * @param fromKey
     * @param toKey
     * @param value
     * @return converted value
     */
    public String convert(String value, int fromKey, int toKey) throws ConversionException;
}
