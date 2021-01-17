package by.comet.mido.converter;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;

import java.util.Arrays;
import java.util.Collection;

import static org.junit.Assert.*;

@RunWith(Parameterized.class)
public class TestConvertMass {

    private final String m_expected;
    private final String m_source;
    private final FigureMass.KEY m_from;
    private final FigureMass.KEY m_to;

    @Parameterized.Parameters
    public static Collection<Object[]> data() {
        return Arrays.asList(new Object[][]{
                {"0.000000001", "1", FigureMass.KEY.mg, FigureMass.KEY.t},
                {"0.000000001", "1.", FigureMass.KEY.mg, FigureMass.KEY.t},
                {"0.000000001", "1.0", FigureMass.KEY.mg, FigureMass.KEY.t},
                {"0.00000000001", "0.01", FigureMass.KEY.mg, FigureMass.KEY.t},
                {"1", "0.000000001", FigureMass.KEY.t, FigureMass.KEY.mg},
                {"0.01", "0.00000000001", FigureMass.KEY.t, FigureMass.KEY.mg},

                {"0", "0.0", FigureMass.KEY.mg, FigureMass.KEY.t},
                {"0", ".0", FigureMass.KEY.mg, FigureMass.KEY.t},
                {"0", "0.", FigureMass.KEY.mg, FigureMass.KEY.t},
                {"0", "0", FigureMass.KEY.mg, FigureMass.KEY.t},
                {"0", "", FigureMass.KEY.mg, FigureMass.KEY.t},

                {"0.0000001", "0.1", FigureMass.KEY.mg, FigureMass.KEY.kg},
                {"0.0001", "0.1", FigureMass.KEY.mg, FigureMass.KEY.g},
                {"0.1", "0.1", FigureMass.KEY.mg, FigureMass.KEY.mg},


                {"0.002", "2", FigureMass.KEY.kg, FigureMass.KEY.t},
                {"2", "2", FigureMass.KEY.kg, FigureMass.KEY.kg},
                {"2000", "2", FigureMass.KEY.kg, FigureMass.KEY.g},
                {"2000000", "2", FigureMass.KEY.kg, FigureMass.KEY.mg},

                {"200", "0.2", FigureMass.KEY.kg, FigureMass.KEY.g},
                {"20", "0.02", FigureMass.KEY.kg, FigureMass.KEY.g},
                {"2", "0.002", FigureMass.KEY.kg, FigureMass.KEY.g},
                {"0.2", "0.0002", FigureMass.KEY.kg, FigureMass.KEY.g},
                {"1500", "1.5", FigureMass.KEY.kg, FigureMass.KEY.g},

        });
    }

    public TestConvertMass(String expected, String source, FigureMass.KEY from, FigureMass.KEY to) {
        m_expected = expected;
        m_source = source;
        m_from = from;
        m_to = to;
    }

    @Test
    public void convertTest() {
        try {
            String converted = new FigureMass().convert(m_source, m_from.ordinal(), m_to.ordinal());
            assertEquals(m_expected, converted);
        } catch (Throwable e) {
            fail(e.getMessage());
        }
    }
}
