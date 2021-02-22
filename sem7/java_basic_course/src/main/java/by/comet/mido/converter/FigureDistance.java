package by.comet.mido.converter;

/**
 * Distance (or Length)
 */
public class FigureDistance extends FigureMass implements IConvertingFigure {

    public enum KEY {
        mm, m, km
    }

    public FigureDistance() {
        String kind = this.getKind();

        String[] labels = {
                "mm", "m", "km"
        };

        m_units = new Unit[labels.length];

        for (int i = 0; i < labels.length; i++)
            m_units[i] = new Unit(kind, i, labels[i]);
    }
}
