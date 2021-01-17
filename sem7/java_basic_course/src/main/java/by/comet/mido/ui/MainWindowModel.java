package by.comet.mido.ui;

import by.comet.mido.converter.EConvertDirection;
import by.comet.mido.converter.Figure;
import by.comet.mido.converter.FigureMass;
import by.comet.mido.converter.IConvertingFigure;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

/**
 * MVC model
 * provides UI with data got from logic
 */
class MainWindowModel {
    private EConvertDirection m_currDirection = EConvertDirection.RIGHT;

    private IConvertingFigure[] m_figureRepos;
    private Map<String, IConvertingFigure> m_figureReposMap;
    private Map<String, Figure[]> m_figureReposContentMap;

    private ArrayList<ComboItem> m_masterComboItems;

    public MainWindowModel() {

        //Fill in figure repos
        m_figureRepos = new IConvertingFigure[1];
        m_figureRepos[0] = new FigureMass();

        m_figureReposMap = new HashMap<String, IConvertingFigure>();
        m_figureReposContentMap = new HashMap<String, Figure[]>();


        //Save master combo items, fill figures map
        m_masterComboItems = new ArrayList<ComboItem>();
        for (IConvertingFigure repo : m_figureRepos) {
            Figure[] repoFigures = repo.getFigures();

            m_figureReposMap.put(repo.getKind(), repo);
            m_figureReposContentMap.put(repo.getKind(), repoFigures);


            for (Figure figure : repoFigures) {
                m_masterComboItems.add(new ComboItem(
                        figure.getKind(),
                        figure.getKey(),
                        figure.getLabel()
                ));
            }
        }
    }

    /**
     * @return current convert direction
     */
    public EConvertDirection getCurrDirection() {
        return m_currDirection;
    }

    public void swapDirection() {
        m_currDirection =
                m_currDirection == EConvertDirection.RIGHT
                        ? EConvertDirection.LEFT
                        : EConvertDirection.RIGHT;
    }

    /**
     * @return All available figures
     */
    public ComboItem[] getMasterComboItems() {
        return m_masterComboItems.toArray(new ComboItem[0]);
    }

    /**
     * @param masterSelectedItem
     * @return figures of the same kind
     */
    public ComboItem[] getSlaveComboItems(ComboItem masterSelectedItem) {
        ArrayList<ComboItem> buff = new ArrayList<ComboItem>();
        for (ComboItem item : m_masterComboItems) {
            if (masterSelectedItem.getKind().equals(item.getKind())) {
                buff.add(item);
            }
        }
        return buff.toArray(new ComboItem[0]);
    }

    /**
     * Get figure repo by combo item
     *
     * @param kind
     * @return repo
     * @throws Exception
     */
    private IConvertingFigure getFigureRepoByKind(String kind) throws Exception {
        IConvertingFigure repo = m_figureReposMap.get(kind);
        if (null == repo) {
            throw new Exception("Unexpected, cannot find figures for given kind " + kind);
        }
        return repo;
    }

    /**
     * Get figure by combo item
     *
     * @param kind
     * @param key
     * @return figure
     * @throws Exception
     */
    private Figure getFigureByProps(String kind, int key) throws Exception {
        Figure[] repoFigures = m_figureReposContentMap.get(kind);
        if (null == repoFigures) {
            throw new Exception("Unexpected, cannot find figures for given kind " + kind);
        }

        for (Figure repoFigure : repoFigures) {
            if (repoFigure.getKey() == key) {
                return repoFigure;
            }
        }

        throw new Exception("Unexpected, cannot find figure for given kind and key "
                + kind
                + " "
                + key);
    }

    /**
     * Fix/Update a value for kind of figure of selected item
     *
     * @param kind
     * @param value
     * @return valid value
     */
    public String fixValueForItem(String kind, String value) throws Exception {
        System.out.println("fix1: | " + value);
        IConvertingFigure repo = getFigureRepoByKind(kind);
        return repo.fixValue(value);
    }

    /**
     * Fix/Update a value for kind of figure of selected item
     *
     * @param kind
     * @param value
     * @param fallbackValue
     * @return valid value
     */
    public String fixValueForItem(String kind, String value, String fallbackValue) throws Exception {

        IConvertingFigure repo = getFigureRepoByKind(kind);
        String res = repo.fixValue(value, fallbackValue);

        System.out.println(
                "fix2: kind " + kind + " | "
                        + "| " + value + "(" + value.length() + ") | "
                        + fallbackValue + "(" + fallbackValue.length() + ") | "
                        + res + "(" + res.length() + ") | ");

        return res;
    }
}
