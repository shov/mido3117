package by.comet.mido.converter;

import org.junit.Test;

import static org.junit.Assert.fail;

public class TestConvertMassLimit {
    @Test(expected = ConversionException.class)
    public void maxInputWhole() throws ConversionException {

        new FigureMass()
                .convert("000000000000000000012", 100, FigureMass.KEY.g.ordinal());

    }

    @Test
    public void noInputWhole() throws ConversionException {

        new FigureMass()
                .convert("000000000000000000012", FigureMass.KEY.kg.ordinal(), FigureMass.KEY.g.ordinal());

    }

    @Test(expected = ConversionMaxValueException.class)
    public void maxWholeTest() throws ConversionMaxValueException {
        try {
            new FigureMass()
                    .convert("100000000000000000", FigureMass.KEY.kg.ordinal(), FigureMass.KEY.g.ordinal());
        } catch (ConversionMaxValueException e) {
            throw e;
        } catch (ConversionException e) {
            fail();
        }
    }

    @Test(expected = ConversionMaxValueException.class)
    public void maxFractionTest() throws ConversionMaxValueException {
        try {
            new FigureMass()
                    .convert("0.111111111111111111", FigureMass.KEY.mg.ordinal(), FigureMass.KEY.t.ordinal());
        } catch (ConversionMaxValueException e) {
            throw e;
        } catch (ConversionException e) {
            fail();
        }
    }
}
