package by.comet.mido.converter;

/**
 * General interface for all figures kinds
 */
public interface IConvertingFigure {
    /**
     * @return kit of provided units
     */
    Unit[] getUnits();

    String getKind();

    boolean isValid(String value, int key) throws ConversionException;

    String getDefaultValue();

    String convert(String value, int fromKey, int toKey) throws ConversionException;
}
