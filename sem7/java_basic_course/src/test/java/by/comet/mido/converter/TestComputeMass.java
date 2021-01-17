package by.comet.mido.converter;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;

import java.util.Arrays;
import java.util.Collection;
import static org.junit.Assert.*;

@RunWith(Parameterized.class)
public class TestComputeMass {

    private final double m_expected;
    private final double m_source;
    private final FigureMass.KEY m_from;
    private final FigureMass.KEY m_to;

    @Parameterized.Parameters
    public static Collection<Object[]> data() {
        return Arrays.asList(new Object[][] {
                {0.000000001d, 1d, FigureMass.KEY.mg, FigureMass.KEY.t},
                {0.000001d, 1d, FigureMass.KEY.mg, FigureMass.KEY.kg},
                {0.001d, 1d, FigureMass.KEY.mg, FigureMass.KEY.g},
                {1d, 1d, FigureMass.KEY.mg, FigureMass.KEY.mg},

                {0.000001d, 1d, FigureMass.KEY.g, FigureMass.KEY.t},
                {0.001d, 1d, FigureMass.KEY.g, FigureMass.KEY.kg},
                {1d, 1d, FigureMass.KEY.g, FigureMass.KEY.g},
                {1000d, 1d, FigureMass.KEY.g, FigureMass.KEY.mg},

                {0.001d, 1d, FigureMass.KEY.kg, FigureMass.KEY.t},
                {1d, 1d, FigureMass.KEY.kg, FigureMass.KEY.kg},
                {1000d, 1d, FigureMass.KEY.kg, FigureMass.KEY.g},
                {1000000d, 1d, FigureMass.KEY.kg, FigureMass.KEY.mg},

                {1d, 1d, FigureMass.KEY.t, FigureMass.KEY.t},
                {1000d, 1d, FigureMass.KEY.t, FigureMass.KEY.kg},
                {1000000d, 1d, FigureMass.KEY.t, FigureMass.KEY.g},
                {1000000000d, 1d, FigureMass.KEY.t, FigureMass.KEY.mg}
        });
    }

    public TestComputeMass(double expected, double source, FigureMass.KEY from, FigureMass.KEY to) {
        m_expected = expected;
        m_source = source;
        m_from = from;
        m_to = to;
    }

    @Test
    public void convertTest() {
       assertEquals(new TargetExpanded().exposedCompute(m_source, m_from, m_to),
               m_expected,
               0.0
       );
    }
}

class TargetExpanded extends FigureMass {
    public double exposedCompute(double source, KEY from, KEY to) {
        return compute(source, from, to);
    }
}
